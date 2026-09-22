"""User schemas, canonical role specifications, and identity normalization rules.

Establishes:
- Canonical role model: student, faculty, admin, management, staff
- Deterministic normalization for email and institutional identifier
- Strict separation between database document representation and API response
- Absolute exclusion of password_hash from any public/API response schema
- Future session collection contract specification
"""

from datetime import datetime, timezone
import re
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

# Canonical Lumora RBAC Roles
CanonicalRole = Literal["student", "faculty", "admin", "management", "staff"]
VALID_ROLES: set[str] = {"student", "faculty", "admin", "management", "staff"}


def normalize_email(email: str) -> str:
    """Deterministic email normalization for canonical storage and uniqueness checks.

    Rules:
    1. Strip leading and trailing whitespace.
    2. Convert entire string to lowercase.
    3. Validate standard email syntax (local-part@domain).
    """
    cleaned = email.strip().lower()
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", cleaned):
        raise ValueError(f"Invalid email address format: '{email}'")
    return cleaned


def normalize_institutional_id(inst_id: str) -> str:
    """Deterministic institutional identifier normalization for canonical storage and uniqueness checks.

    Rules:
    1. Strip leading and trailing whitespace.
    2. Convert to uppercase for case-insensitive canonical matching (e.g., 'STU-2026-001').
    3. Collapse multiple internal whitespace characters to single spaces.
    4. Enforce minimum length of 3 characters.
    """
    cleaned = " ".join(inst_id.strip().split()).upper()
    if len(cleaned) < 3:
        raise ValueError("Institutional identifier must be at least 3 characters long.")
    return cleaned


# ==============================================================================
# Database Document Schemas (Persistence Layer)
# ==============================================================================

class UserDocument(BaseModel):
    """Internal user representation as stored in MongoDB 'users' collection."""

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: Optional[str] = Field(default=None, alias="_id", description="MongoDB ObjectId string")
    institutional_id: str = Field(description="Normalized unique institutional identifier")
    institutional_email: str = Field(description="Original user-supplied institutional email")
    normalized_email: str = Field(description="Deterministic lowercase email for uniqueness indexing")
    full_name: str = Field(description="User's complete formal name")
    role: CanonicalRole = Field(description="One of the 5 canonical RBAC roles")
    password_hash: str = Field(description="Argon2id/Bcrypt hash string; NEVER returned to clients")
    is_active: bool = Field(default=True, description="Immediate activation invariant flag")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC creation timestamp",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC last update timestamp",
    )
    last_login_at: Optional[datetime] = Field(
        default=None,
        description="UTC timestamp of last successful authentication",
    )

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in VALID_ROLES:
            raise ValueError(f"Invalid role '{v}'. Must be one of: {sorted(list(VALID_ROLES))}")
        return v


class UserCreateInternal(BaseModel):
    """Payload provided to UserRepository to construct a new UserDocument."""

    institutional_id: str
    institutional_email: str
    full_name: str
    role: CanonicalRole
    password_hash: str
    is_active: bool = True

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in VALID_ROLES:
            raise ValueError(f"Invalid role '{v}'. Must be one of: {sorted(list(VALID_ROLES))}")
        return v

    def to_document(self) -> dict:
        """Serialize into MongoDB document dictionary with normalized fields."""
        now = datetime.now(timezone.utc)
        norm_email = normalize_email(self.institutional_email)
        norm_id = normalize_institutional_id(self.institutional_id)
        return {
            "institutional_id": norm_id,
            "institutional_email": self.institutional_email.strip(),
            "normalized_email": norm_email,
            "full_name": self.full_name.strip(),
            "role": self.role,
            "password_hash": self.password_hash,
            "is_active": self.is_active,
            "created_at": now,
            "updated_at": now,
            "last_login_at": None,
        }


# ==============================================================================
# API Response Schema (Safe for Client Consumption)
# ==============================================================================

class UserResponse(BaseModel):
    """Public user response schema.

    SECURITY INVARIANT:
    `password_hash` is strictly excluded from this schema.
    """

    model_config = ConfigDict(from_attributes=True)

    id: str = Field(description="Unique system identifier")
    institutional_id: str = Field(description="Unique institutional identifier")
    institutional_email: str = Field(description="Institutional email address")
    full_name: str = Field(description="Full name")
    role: CanonicalRole = Field(description="Assigned RBAC role")
    is_active: bool = Field(description="Account active status")
    created_at: datetime = Field(description="Account creation timestamp")
    updated_at: datetime = Field(description="Profile last update timestamp")
    last_login_at: Optional[datetime] = Field(default=None, description="Last login timestamp")


# ==============================================================================
# Future Session Collection Contract (Phase 2B.3 Blueprint)
# ==============================================================================

class SessionDocument(BaseModel):
    """Planned schema for 'sessions' collection supporting HTTP-only refresh tokens.

    Documented strictly as a persistence blueprint for Phase 2B.3.
    """

    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str = Field(description="Target user document ID reference")
    token_hash: str = Field(description="Cryptographic hash of the issued refresh token")
    expires_at: datetime = Field(description="Absolute expiration timestamp")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    revoked_at: Optional[datetime] = Field(default=None, description="Revocation timestamp if logged out")
    device_info: Optional[str] = Field(default=None, description="Client device / user-agent summary")
