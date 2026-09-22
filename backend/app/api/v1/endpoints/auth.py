"""Authentication API endpoints for Lumora Campus OS.

Phase 2B.3-B Implementation:
- POST /api/v1/auth/register: Self-registration for student and faculty accounts.
- Immediate account activation; zero email confirmation/SMTP dependency.
- Thin route delegating entirely to RegistrationService.
"""

from fastapi import APIRouter, Depends, status

from app.dependencies.auth import get_registration_service
from app.schemas.auth import RegisterRequest
from app.schemas.response import ErrorResponse
from app.schemas.user import UserResponse
from app.services.registration_service import RegistrationService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=UserResponse,
    summary="Register a new institutional student or faculty account",
    description=(
        "Registers a new user account with immediate activation. "
        "Self-registration is restricted to canonical 'student' and 'faculty' roles. "
        "Does not issue sessions or tokens; clients authenticate separately via /login."
    ),
    responses={
        status.HTTP_201_CREATED: {
            "model": UserResponse,
            "description": "Account created and activated immediately.",
        },
        status.HTTP_403_FORBIDDEN: {
            "model": ErrorResponse,
            "description": "Public self-registration attempted for a privileged role.",
        },
        status.HTTP_409_CONFLICT: {
            "model": ErrorResponse,
            "description": "Institutional identifier or email is already registered.",
        },
        422: {
            "model": ErrorResponse,
            "description": "Payload validation failure (syntax, length, or invalid role).",
        },
    },
)
async def register_user(
    payload: RegisterRequest,
    registration_service: RegistrationService = Depends(get_registration_service),
) -> UserResponse:
    """Execute user registration and return sanitized user response."""
    return await registration_service.register(payload)
