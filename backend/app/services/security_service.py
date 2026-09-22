"""Security service coordinating password hashing, verification, and token fingerprinting.

Follows clean architectural boundaries:
- Routes delegate to AuthService
- AuthService utilizes SecurityService and Repositories
- Repositories persist data to MongoDB
"""

from datetime import timedelta
from typing import Any, Optional

from app.core.config import Settings
from app.core.security import (
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    check_needs_rehash,
    create_access_token,
    decode_access_token,
    generate_refresh_token,
    hash_password,
    hash_token,
    validate_password_policy,
    verify_password,
)


class SecurityService:
    """Service encapsulating password management and cryptographic token operations."""

    min_password_length: int = PASSWORD_MIN_LENGTH
    max_password_length: int = PASSWORD_MAX_LENGTH

    def validate_password(self, password: str) -> str:
        """Validate a candidate password against centralized policy."""
        return validate_password_policy(password)

    def hash_password(self, password: str) -> str:
        """Generate Argon2id hash for password."""
        return hash_password(password)

    def verify_password(self, password: str, password_hash: str) -> bool:
        """Verify candidate password against Argon2id hash."""
        return verify_password(password, password_hash)

    def hash_token(self, raw_token: str) -> str:
        """Compute SHA-256 digest for refresh token storage and revocation lookup."""
        return hash_token(raw_token)

    def needs_rehash(self, password_hash: str) -> bool:
        """Inspect if password hash requires re-hashing."""
        return check_needs_rehash(password_hash)

    def generate_refresh_token(self) -> str:
        """Generate cryptographically secure random refresh token."""
        return generate_refresh_token()

    def create_access_token(
        self,
        subject: str,
        role: str,
        settings: Settings,
        expires_delta: Optional[timedelta] = None,
    ) -> str:
        """Generate cryptographically signed short-lived JWT access token."""
        return create_access_token(
            subject=subject,
            role=role,
            settings=settings,
            expires_delta=expires_delta,
        )

    def decode_access_token(self, token: str, settings: Settings) -> dict[str, Any]:
        """Decode and validate a JWT access token."""
        return decode_access_token(token, settings)


# Global instance
security_service = SecurityService()
