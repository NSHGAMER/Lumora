"""Authentication and authorization dependency providers for FastAPI dependency injection.

Adheres to Lumora Phase 2B.4 architecture:
- Authoritative token validation using central SecurityService
- In-database user verification ensuring deleted or deactivated users are rejected
- Authoritative RBAC role enforcement (student, faculty, admin, management, staff)
- HTTP 401 Unauthorized for authentication failures
- HTTP 403 Forbidden for insufficient role permissions
"""

from typing import Optional, Set
from fastapi import Depends, HTTPException, Request, status
import jwt

from app.core.config import Settings, get_settings
from app.dependencies.database import get_session_repository, get_user_repository
from app.repositories.session_repository import SessionRepository
from app.repositories.user_repository import UserRepository
from app.schemas.user import CanonicalRole, UserDocument, VALID_ROLES
from app.services.auth_service import AuthService
from app.services.registration_service import RegistrationService
from app.services.security_service import SecurityService, security_service


def get_security_service() -> SecurityService:
    """Provide singleton SecurityService instance."""
    return security_service


def get_registration_service(
    user_repo: UserRepository = Depends(get_user_repository),
    sec_service: SecurityService = Depends(get_security_service),
) -> RegistrationService:
    """Provide RegistrationService injected with repositories and security services."""
    return RegistrationService(
        user_repository=user_repo,
        security_service=sec_service,
    )


def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repository),
    session_repo: SessionRepository = Depends(get_session_repository),
    sec_service: SecurityService = Depends(get_security_service),
    settings: Settings = Depends(get_settings),
) -> AuthService:
    """Provide AuthService injected with repositories, security primitives, and settings."""
    return AuthService(
        user_repository=user_repo,
        session_repository=session_repo,
        security_service=sec_service,
        settings=settings,
    )


async def get_current_user(
    request: Request,
    user_repo: UserRepository = Depends(get_user_repository),
    sec_service: SecurityService = Depends(get_security_service),
    settings: Settings = Depends(get_settings),
) -> UserDocument:
    """Authenticate incoming request via Bearer access token and resolve active user from MongoDB.

    SECURITY INVARIANTS:
    1. Authorization header must be present and formatted as 'Bearer <token>'.
    2. Token must be cryptographically signed with the configured secret and algorithm.
    3. Expiry, issuer, audience, and required claims ('sub', 'exp', 'iat', 'iss', 'aud') are strictly verified.
    4. User ID is extracted from 'sub' claim; user must exist in the database.
    5. User account must be active ('is_active=True').
    6. All authentication failures return HTTP 401 Unauthorized.
    """
    auth_header: Optional[str] = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Bearer token required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme. Bearer token required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]

    try:
        payload = sec_service.decode_access_token(token, settings)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (jwt.InvalidTokenError, jwt.PyJWTError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or malformed access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token: missing subject claim.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await user_repo.get_by_id(str(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def get_current_active_user(
    current_user: UserDocument = Depends(get_current_user),
) -> UserDocument:
    """Explicit alias for get_current_user, validating that the user is active."""
    return current_user


class RoleChecker:
    """FastAPI authorization dependency enforcing canonical role access control.

    SECURITY INVARIANTS:
    - Verifies the user's authoritative role stored in MongoDB (not client assertions).
    - Unauthenticated requests trigger HTTP 401 via get_current_user.
    - Authenticated users lacking an allowed role receive HTTP 403 Forbidden.
    - Does not leak internal authorization or database structures.
    """

    def __init__(self, allowed_roles: Set[str]) -> None:
        # Validate that configured roles belong to the canonical 5-role system
        invalid = allowed_roles - VALID_ROLES
        if invalid:
            raise ValueError(f"Invalid canonical role(s) specified in dependency: {invalid}")
        self.allowed_roles: Set[CanonicalRole] = set(allowed_roles)  # type: ignore[assignment]

    async def __call__(
        self, current_user: UserDocument = Depends(get_current_user)
    ) -> UserDocument:
        """Enforce role authorization against the authenticated user document."""
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: insufficient role permissions.",
            )
        return current_user


def require_role(role: str) -> RoleChecker:
    """FastAPI dependency requiring a single specific canonical RBAC role.

    Usage:
        @router.get("/admin/panel")
        async def admin_panel(user: UserDocument = Depends(require_role("admin"))):
            ...
    """
    return RoleChecker(allowed_roles={role})


def require_roles(*roles: str) -> RoleChecker:
    """FastAPI dependency requiring at least one of the specified canonical RBAC roles.

    Usage:
        @router.get("/staff/tools")
        async def staff_tools(user: UserDocument = Depends(require_roles("admin", "management"))):
            ...
    """
    return RoleChecker(allowed_roles=set(roles))
