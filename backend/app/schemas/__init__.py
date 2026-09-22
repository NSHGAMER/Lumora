from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    LogoutResponse,
    RefreshTokenRequest,
    RegisterRequest,
    TokenPayload,
)
from app.schemas.health import HealthResponse
from app.schemas.info import ApiInfoResponse
from app.schemas.response import ErrorDetail, ErrorResponse, StandardResponse
from app.schemas.session import (
    SessionCreateInternal,
    SessionDocument,
    SessionResponse,
)
from app.schemas.user import (
    PUBLIC_REGISTRATION_ROLES,
    CanonicalRole,
    UserCreateInternal,
    UserDocument,
    UserResponse,
    normalize_email,
    normalize_institutional_id,
)

__all__ = [
    "HealthResponse",
    "ApiInfoResponse",
    "ErrorDetail",
    "ErrorResponse",
    "StandardResponse",
    "CanonicalRole",
    "PUBLIC_REGISTRATION_ROLES",

    "UserDocument",
    "UserCreateInternal",
    "UserResponse",
    "SessionDocument",
    "SessionCreateInternal",
    "SessionResponse",
    "RegisterRequest",
    "LoginRequest",
    "RefreshTokenRequest",
    "LogoutResponse",
    "TokenPayload",
    "AuthResponse",
    "normalize_email",
    "normalize_institutional_id",
]
