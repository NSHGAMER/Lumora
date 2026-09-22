"""Core password security, policy validation, and cryptographic hashing primitives.

Adheres to Lumora Phase 2B.3 security invariants:
- Preferred algorithm: Argon2id (RFC 9106 recommended parameters)
- Passwords are never logged or stored in plaintext
- Verification uses constant-time library verification
- Password policy is centralized and rejects empty/overlong inputs
- Refresh tokens are hashed via SHA-256 before persistence
"""

import hashlib
import logging
from typing import Final
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

logger = logging.getLogger("lumora.security")

# Centralized Password Policy Boundaries
PASSWORD_MIN_LENGTH: Final[int] = 8
PASSWORD_MAX_LENGTH: Final[int] = 128

# Argon2id hasher singleton configured with RFC 9106 standards
_password_hasher: Final[PasswordHasher] = PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=4,
    hash_len=32,
    salt_len=16,
)


def validate_password_policy(password: str) -> str:
    """Validate password against Lumora centralized security policy.

    Rules:
    1. Must not be empty or whitespace-only.
    2. Minimum length: 8 characters.
    3. Maximum length: 128 characters (guards against hashing DoS).

    Returns:
        The validated raw password string.

    Raises:
        ValueError: If password violates length or content constraints.
    """
    if not password or not password.strip():
        raise ValueError("Password cannot be empty or contain only whitespace.")

    if len(password) < PASSWORD_MIN_LENGTH:
        raise ValueError(f"Password must be at least {PASSWORD_MIN_LENGTH} characters long.")

    if len(password) > PASSWORD_MAX_LENGTH:
        raise ValueError(f"Password cannot exceed {PASSWORD_MAX_LENGTH} characters.")

    return password


def hash_password(password: str) -> str:
    """Hash plaintext password using Argon2id.

    SECURITY INVARIANT:
    - Never log the raw password or password hash.
    - Password must satisfy policy before hashing.
    """
    validated = validate_password_policy(password)
    return _password_hasher.hash(validated)


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a raw candidate password against a stored Argon2id hash.

    SECURITY INVARIANT:
    - Uses library's built-in constant-time verification.
    - Gracefully handles invalid hash strings without raising uncaught exceptions.
    - Passwords and hashes are never printed to logs.
    """
    if not password or not password_hash:
        return False

    try:
        return _password_hasher.verify(password_hash, password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False
    except Exception as exc:
        logger.warning("Unexpected exception during password verification: %s", type(exc).__name__)
        return False


def check_needs_rehash(password_hash: str) -> bool:
    """Check whether stored hash needs upgrading to updated Argon2id parameters."""
    if not password_hash:
        return False
    try:
        return _password_hasher.check_needs_rehash(password_hash)
    except Exception:
        return False


def hash_token(raw_token: str) -> str:
    """Compute SHA-256 fingerprint of a session or refresh token for database persistence.

    SECURITY INVARIANT:
    Raw refresh tokens must NEVER be stored in the database.
    Only cryptographic hashes suitable for revocation lookups are persisted.
    """
    if not raw_token or not raw_token.strip():
        raise ValueError("Token cannot be empty.")
    return hashlib.sha256(raw_token.strip().encode("utf-8")).hexdigest()
