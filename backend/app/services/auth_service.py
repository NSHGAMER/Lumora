"""Authentication service coordinating login verification, token issuance, and session persistence.

Adheres to Lumora security invariants:
- Generic failure responses (HTTP 401 Unauthorized) to prevent account enumeration
- Argon2id password verification via SecurityService
- Inactive accounts are blocked from receiving tokens or sessions
- Short-lived cryptographically signed access JWTs
- Raw refresh tokens are never persisted in MongoDB (SHA-256 digests only)
- Secure HttpOnly cookie transport for refresh tokens
- last_login_at updated only on successful authentication
- Multiple concurrent logins create distinct sessions
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import HTTPException, Response, status

from app.core.config import Settings
from app.repositories.session_repository import SessionRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import AuthResponse, LoginRequest, LogoutResponse
from app.schemas.session import SessionCreateInternal
from app.schemas.user import UserResponse
from app.services.security_service import SecurityService


class AuthService:
    """Service coordinating authentication, session creation, and credential validation."""

    REFRESH_COOKIE_NAME: str = "lumora_refresh_token"
    REFRESH_COOKIE_PATH: str = "/api/v1/auth"

    def __init__(
        self,
        user_repository: UserRepository,
        session_repository: SessionRepository,
        security_service: SecurityService,
        settings: Settings,
    ) -> None:
        self.user_repository = user_repository
        self.session_repository = session_repository
        self.security_service = security_service
        self.settings = settings

    async def login(
        self,
        request: LoginRequest,
        device_info: Optional[str] = None,
    ) -> tuple[AuthResponse, str]:
        """Authenticate user credentials and create a new session.

        Returns:
            Tuple of (AuthResponse, raw_refresh_token).
            The raw refresh token must be placed in a secure HttpOnly cookie
            and never exposed in persistent storage or standard JSON response.
        """
        cleaned_identifier = request.identifier.strip()
        auth_error = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid institutional credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

        # 1. Look up user by normalized email or institutional identifier
        try:
            if "@" in cleaned_identifier:
                user = await self.user_repository.get_by_email(cleaned_identifier)
            else:
                user = await self.user_repository.get_by_institutional_id(cleaned_identifier)
        except ValueError:
            # Syntax failure in email/ID normalization is treated as invalid credentials
            raise auth_error

        if user is None:
            raise auth_error

        # 2. Verify password with Argon2id constant-time mechanism
        if not self.security_service.verify_password(request.password, user.password_hash):
            raise auth_error

        # 3. Verify account active state
        if not user.is_active:
            raise auth_error

        # 4. Successful authentication: update last_login_at timestamp
        now = datetime.now(timezone.utc)
        if user.id is not None:
            await self.user_repository.update_last_login(user.id, now)
        user.last_login_at = now

        # 5. Generate short-lived signed JWT access token
        access_token = self.security_service.create_access_token(
            subject=str(user.id or ""),
            role=user.role,
            settings=self.settings,
        )

        # 6. Generate cryptographically secure random refresh token and hash it
        raw_refresh_token = self.security_service.generate_refresh_token()
        token_hash = self.security_service.hash_token(raw_refresh_token)
        session_expiry = now + timedelta(days=self.settings.jwt_refresh_token_expire_days)

        # 7. Persist session to MongoDB (storing only the SHA-256 fingerprint)
        session_create = SessionCreateInternal(
            user_id=str(user.id or ""),
            token_hash=token_hash,
            expires_at=session_expiry,
            device_info=device_info,
        )
        await self.session_repository.create_session(session_create)

        # 8. Build safe public AuthResponse
        auth_response = AuthResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=self.settings.jwt_access_token_expire_minutes * 60,
            user=UserResponse.model_validate(user),
        )

        return auth_response, raw_refresh_token

    def set_refresh_cookie(self, response: Response, refresh_token: str) -> None:
        """Set raw refresh token in a secure HttpOnly cookie for browser transport."""
        response.set_cookie(
            key=self.REFRESH_COOKIE_NAME,
            value=refresh_token,
            httponly=True,
            secure=self.settings.is_production,
            samesite="lax",
            max_age=self.settings.jwt_refresh_token_expire_days * 86400,
            path=self.REFRESH_COOKIE_PATH,
        )

    def clear_refresh_cookie(self, response: Response) -> None:
        """Clear refresh token cookie with matching security parameters."""
        response.delete_cookie(
            key=self.REFRESH_COOKIE_NAME,
            path=self.REFRESH_COOKIE_PATH,
            httponly=True,
            secure=self.settings.is_production,
            samesite="lax",
        )

    async def refresh_session(
        self,
        raw_refresh_token: Optional[str],
        device_info: Optional[str] = None,
    ) -> tuple[AuthResponse, str]:
        """Rotate an active refresh token, issue a new access JWT, and establish a new session.

        Enforces:
        - Rejection of missing, empty, or whitespace tokens
        - Atomic session consumption (find unrevoked/unexpired session and set revoked_at = now)
        - Verification that user exists and is_active
        - Single-use rotation: old session remains revoked, new session created
        - Generic HTTP 401 Unauthorized for all rejection paths
        - last_login_at is NOT updated on refresh

        Returns:
            Tuple of (AuthResponse, new_raw_refresh_token).
        """
        auth_error = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

        if not raw_refresh_token or not raw_refresh_token.strip():
            raise auth_error

        # 1. Compute SHA-256 fingerprint of the presented refresh token
        token_hash = self.security_service.hash_token(raw_refresh_token.strip())

        # 2. Atomically claim/consume the active session to prevent concurrent rotation races
        old_session = await self.session_repository.consume_active_session(token_hash)
        if old_session is None:
            raise auth_error

        # 3. Verify associated user exists and remains active
        user = await self.user_repository.get_by_id(old_session.user_id)
        if user is None or not user.is_active:
            raise auth_error

        # 4. Generate a new cryptographically signed short-lived JWT access token
        access_token = self.security_service.create_access_token(
            subject=str(user.id or ""),
            role=user.role,
            settings=self.settings,
        )

        # 5. Generate a new cryptographically secure refresh token and hash it
        new_raw_refresh_token = self.security_service.generate_refresh_token()
        new_token_hash = self.security_service.hash_token(new_raw_refresh_token)
        now = datetime.now(timezone.utc)
        session_expiry = now + timedelta(days=self.settings.jwt_refresh_token_expire_days)

        # 6. Persist new session document (storing only SHA-256 digest)
        session_create = SessionCreateInternal(
            user_id=str(user.id or ""),
            token_hash=new_token_hash,
            expires_at=session_expiry,
            device_info=device_info or old_session.device_info,
        )
        await self.session_repository.create_session(session_create)

        # 7. Construct safe public AuthResponse
        auth_response = AuthResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=self.settings.jwt_access_token_expire_minutes * 60,
            user=UserResponse.model_validate(user),
        )

        return auth_response, new_raw_refresh_token

    async def logout(
        self,
        raw_refresh_token: Optional[str] = None,
    ) -> LogoutResponse:
        """Terminate the active session represented by the refresh token.

        Safe and idempotent: if token is missing, expired, or already revoked,
        still completes successfully without error or leaking session state.
        Does not touch last_login_at or other user sessions.
        """
        if raw_refresh_token and raw_refresh_token.strip():
            try:
                token_hash = self.security_service.hash_token(raw_refresh_token.strip())
                await self.session_repository.revoke_session(token_hash)
            except Exception:
                # Safe fault isolation: never leak internal or database errors
                pass

        return LogoutResponse(message="Successfully logged out")
