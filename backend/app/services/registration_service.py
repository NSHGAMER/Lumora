"""Registration service coordinating user account registration.

Adheres to Lumora security and architectural invariants:
- Pure business logic layer (Route -> Service -> Repository -> MongoDB)
- Enforces PUBLIC_REGISTRATION_ROLES (student and faculty only)
- Deterministic duplicate prevention on normalized email and institutional ID
- Argon2id password hashing via SecurityService
- Account is immediately active upon registration
- Never persists or logs plaintext passwords
- Safe UserResponse representation (zero credentials, hashes, or tokens exposed)
"""

from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.repositories.user_repository import UserRepository
from app.schemas.auth import RegisterRequest
from app.schemas.user import (
    PUBLIC_REGISTRATION_ROLES,
    UserCreateInternal,
    UserResponse,
    normalize_email,
    normalize_institutional_id,
)
from app.services.security_service import SecurityService


class RegistrationService:
    """Service handling self-registration domain logic and persistence coordination."""

    def __init__(
        self,
        user_repository: UserRepository,
        security_service: SecurityService,
    ) -> None:
        self.user_repository = user_repository
        self.security_service = security_service

    async def register(self, request: RegisterRequest) -> UserResponse:
        """Execute user registration workflow.

        Steps:
        1. Validate role is authorized for public self-registration.
        2. Perform proactive deduplication checks on normalized credentials.
        3. Cryptographically hash password using Argon2id.
        4. Persist UserDocument with immediate activation (is_active=True).
        5. Handle MongoDB duplicate-key race conditions cleanly.
        6. Return sanitized UserResponse strictly excluding sensitive credentials.
        """
        # 1. Registration Role Policy Check
        if request.role not in PUBLIC_REGISTRATION_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Public self-registration is restricted to: "
                    f"{', '.join(sorted(PUBLIC_REGISTRATION_ROLES))}. "
                    f"The role '{request.role}' must be provisioned administratively."
                ),
            )

        # 2. Identifier and Email Normalization for Duplicate Verification
        norm_id = normalize_institutional_id(request.institutional_id)
        norm_email = normalize_email(request.institutional_email)

        # Proactive duplicate detection: institutional ID
        existing_by_id = await self.user_repository.get_by_institutional_id(norm_id)
        if existing_by_id is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this institutional identifier is already registered.",
            )

        # Proactive duplicate detection: institutional email
        existing_by_email = await self.user_repository.get_by_email(norm_email)
        if existing_by_email is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this institutional email is already registered.",
            )

        # 3. Secure Password Hashing (Argon2id)
        password_hash = self.security_service.hash_password(request.password)

        # 4. User Internal Document Payload (Account immediately active)
        user_internal = UserCreateInternal(
            institutional_id=norm_id,
            institutional_email=request.institutional_email,
            full_name=request.full_name,
            role=request.role,
            password_hash=password_hash,
            is_active=True,
        )

        # 5. Persistence with DuplicateKey race condition handling
        try:
            created_user = await self.user_repository.create_user(user_internal)
        except DuplicateKeyError as exc:
            err_msg = str(exc)
            if "institutional_id" in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An account with this institutional identifier is already registered.",
                )
            if "normalized_email" in err_msg or "email" in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An account with this institutional email is already registered.",
                )
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with these credentials already exists.",
            )

        # 6. Return Safe Public User Representation (no passwords, hashes, or tokens)
        return UserResponse.model_validate(created_user)
