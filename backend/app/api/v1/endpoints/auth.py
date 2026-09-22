"""Authentication API endpoints for Lumora Campus OS.

Phase 2B.3-B Implementation:
- POST /api/v1/auth/register: Self-registration for student and faculty accounts.
- Immediate account activation; zero email confirmation/SMTP dependency.
- Thin route delegating entirely to RegistrationService.
"""

from typing import Optional
from fastapi import APIRouter, Body, Depends, Request, Response, status

from app.dependencies.auth import (
    get_auth_service,
    get_current_user,
    get_registration_service,
)
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    LogoutResponse,
    RefreshTokenRequest,
    RegisterRequest,
)
from app.schemas.response import ErrorResponse
from app.schemas.user import UserDocument, UserResponse
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


@router.post(
    "/refresh",
    status_code=status.HTTP_200_OK,
    response_model=AuthResponse,
    summary="Rotate refresh token and issue new access JWT",
    description=(
        "Authenticates via the HttpOnly lumora_refresh_token cookie. "
        "Atomically consumes the old session, issues a new short-lived access JWT, "
        "and rotates the refresh token in the HttpOnly cookie."
    ),
    responses={
        status.HTTP_200_OK: {
            "model": AuthResponse,
            "description": "Session rotated successfully. New access JWT and refresh cookie set.",
        },
        status.HTTP_401_UNAUTHORIZED: {
            "model": ErrorResponse,
            "description": "Invalid, expired, or revoked refresh token.",
        },
    },
)
async def refresh_token(
    response: Response,
    request: Request,
    payload: Optional[RefreshTokenRequest] = Body(default=None),
    auth_service: AuthService = Depends(get_auth_service),
) -> AuthResponse:
    """Execute refresh token rotation and set new HttpOnly cookie."""
    cookie_token = request.cookies.get(auth_service.REFRESH_COOKIE_NAME)
    body_token = payload.refresh_token if payload else None
    raw_token = cookie_token or body_token

    device_info = request.headers.get("user-agent")
    auth_resp, new_refresh_token = await auth_service.refresh_session(
        raw_refresh_token=raw_token,
        device_info=device_info,
    )
    auth_service.set_refresh_cookie(response, new_refresh_token)
    return auth_resp


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    response_model=LogoutResponse,
    summary="Terminate active session and clear refresh token cookie",
    description=(
        "Revokes the session matching the client's refresh token cookie and clears "
        "the HttpOnly cookie. Safe and idempotent."
    ),
    responses={
        status.HTTP_200_OK: {
            "model": LogoutResponse,
            "description": "Session revoked and cookie cleared.",
        },
    },
)
async def logout_user(
    response: Response,
    request: Request,
    payload: Optional[RefreshTokenRequest] = Body(default=None),
    auth_service: AuthService = Depends(get_auth_service),
) -> LogoutResponse:
    """Revoke session from cookie or body and clear refresh cookie."""
    cookie_token = request.cookies.get(auth_service.REFRESH_COOKIE_NAME)
    body_token = payload.refresh_token if payload else None
    raw_token = cookie_token or body_token

    result = await auth_service.logout(raw_refresh_token=raw_token)
    auth_service.clear_refresh_cookie(response)
    return result


@router.get(
    "/me",
    status_code=status.HTTP_200_OK,
    response_model=UserResponse,
    summary="Get current authenticated user profile",
    description=(
        "Retrieves the public institutional profile of the currently authenticated user "
        "identified by the Bearer access token provided in the Authorization header. "
        "Excludes sensitive credentials and database internals."
    ),
    responses={
        status.HTTP_200_OK: {
            "model": UserResponse,
            "description": "Profile of the authenticated user.",
        },
        status.HTTP_401_UNAUTHORIZED: {
            "model": ErrorResponse,
            "description": "Missing, expired, or invalid Bearer access token, or inactive account.",
        },
    },
)
async def get_current_user_profile(
    current_user: UserDocument = Depends(get_current_user),
) -> UserResponse:
    """Return public profile of the currently authenticated user."""
    return UserResponse(
        id=current_user.id or "",
        institutional_id=current_user.institutional_id,
        institutional_email=current_user.institutional_email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
        last_login_at=current_user.last_login_at,
    )
