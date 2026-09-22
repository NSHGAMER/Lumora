"""Authentication API endpoints for Lumora Campus OS.

Phase 2B.3-B Implementation:
- POST /api/v1/auth/register: Self-registration for student and faculty accounts.
- Immediate account activation; zero email confirmation/SMTP dependency.
- Thin route delegating entirely to RegistrationService.
"""

from fastapi import APIRouter, Depends, Request, Response, status

from app.dependencies.auth import get_auth_service, get_registration_service
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest
from app.schemas.response import ErrorResponse
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService
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


@router.post(
    "/login",
    status_code=status.HTTP_200_OK,
    response_model=AuthResponse,
    summary="Authenticate institutional user and establish session",
    description=(
        "Authenticates credentials via institutional identifier or email using Argon2id. "
        "On success, returns a signed short-lived access JWT in the JSON body "
        "and delivers a secure HttpOnly refresh token cookie."
    ),
    responses={
        status.HTTP_200_OK: {
            "model": AuthResponse,
            "description": "Authentication successful. Access JWT returned; refresh cookie set.",
        },
        status.HTTP_401_UNAUTHORIZED: {
            "model": ErrorResponse,
            "description": "Invalid institutional credentials or inactive account.",
        },
        422: {
            "model": ErrorResponse,
            "description": "Payload validation failure.",
        },
    },
)
async def login_user(
    payload: LoginRequest,
    response: Response,
    request: Request,
    auth_service: AuthService = Depends(get_auth_service),
) -> AuthResponse:
    """Authenticate user credentials, issue access JWT, and set secure HttpOnly refresh cookie."""
    device_info = request.headers.get("user-agent")
    auth_response, refresh_token = await auth_service.login(payload, device_info=device_info)
    auth_service.set_refresh_cookie(response, refresh_token)
    return auth_response
