"""Authentication request and response contracts for Phase 2B.3.

Adheres to Lumora security invariants:
- Typed contracts for future registration, login, token refresh, and token claims
- Passwords are validated via centralized policy
- Raw passwords and password_hash are NEVER present in response schemas
- Canonical role validation and identity normalization enforced
"""

from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.security import (
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    validate_password_policy,
)
from app.schemas.user import (
    CanonicalRole,
    UserResponse,
    VALID_ROLES,
    normalize_email,
    normalize_institutional_id,
)


class RegisterRequest(BaseModel):
    """Client request schema for new institutional account registration."""

    model_config = ConfigDict(str_strip_whitespace=True)

    institutional_id: str = Field(
        min_length=3,
        max_length=50,
        description="Official student ID or faculty/staff institutional identifier",
    )
    institutional_email: str = Field(
        max_length=255,
        description="Official university institutional email address",
    )
    full_name: str = Field(
        min_length=2,
        max_length=100,
        description="User's complete formal name",
    )
    password: str = Field(
        min_length=PASSWORD_MIN_LENGTH,
        max_length=PASSWORD_MAX_LENGTH,
        description="Account password adhering to centralized security policy",
    )
    role: CanonicalRole = Field(
        default="student",
        description="One of the 5 canonical RBAC roles: student, faculty, admin, management, staff",
    )

    @field_validator("institutional_email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        """Normalize and validate email format."""
        return normalize_email(v)

    @field_validator("institutional_id")
    @classmethod
    def validate_id_format(cls, v: str) -> str:
        """Normalize institutional identifier."""
        return normalize_institutional_id(v)

    @field_validator("password")
    @classmethod
    def validate_password_criteria(cls, v: str) -> str:
        """Enforce centralized password length and complexity policy."""
        return validate_password_policy(v)

    @field_validator("role")
    @classmethod
    def validate_role_membership(cls, v: str) -> CanonicalRole:
        """Ensure role belongs to the canonical 5-role system."""
        if v not in VALID_ROLES:
            raise ValueError(f"Invalid role '{v}'. Must be one of: {sorted(list(VALID_ROLES))}")
        return v  # type: ignore[return-value]


class LoginRequest(BaseModel):
    """Client request schema for authenticating with institutional identifier or email."""

    model_config = ConfigDict(str_strip_whitespace=True)

    identifier: str = Field(
        min_length=3,
        max_length=255,
        description="Institutional ID (e.g. STU-2026-001) or registered institutional email",
    )
    password: str = Field(
        min_length=1,
        max_length=PASSWORD_MAX_LENGTH,
        description="Account password",
    )


class RefreshTokenRequest(BaseModel):
    """Request schema for refreshing an access token.

    Note: The preferred architecture delivers the refresh token via a secure HttpOnly cookie.
    This schema provides an explicit body fallback for non-browser API clients.
    """

    model_config = ConfigDict(str_strip_whitespace=True)

    refresh_token: Optional[str] = Field(
        default=None,
        description="Optional refresh token string if not transmitted via HttpOnly cookie",
    )


class TokenPayload(BaseModel):
    """Internal schema for decoded JWT access token claims."""

    sub: str = Field(description="Subject identifier (user ID)")
    role: CanonicalRole = Field(description="User RBAC role for stateless authorization")
    iss: str = Field(default="lumora", description="Token issuer")
    aud: str = Field(default="lumora-client", description="Token audience")
    exp: int = Field(description="UTC expiration Unix timestamp")
    iat: int = Field(description="UTC issued-at Unix timestamp")
    jti: Optional[str] = Field(default=None, description="Unique JWT ID for revocation tracking")


class AuthResponse(BaseModel):
    """Successful authentication response model.

    SECURITY INVARIANT:
    - password and password_hash are NEVER present.
    - Refresh token is delivered via secure HttpOnly cookie, not exposed in body.
    """

    access_token: str = Field(description="Short-lived signed JWT access token")
    token_type: str = Field(default="bearer", description="Token scheme type")
    expires_in: int = Field(description="Access token lifespan in seconds")
    user: UserResponse = Field(description="Authenticated user profile excluding sensitive credentials")


class LogoutResponse(BaseModel):
    """Safe response model for session termination."""

    message: str = Field(
        default="Successfully logged out",
        description="Session termination confirmation",
    )
