"""Session schemas, persistence contracts, and public session representation.

Adheres to Lumora security invariants:
- Raw refresh tokens are NEVER stored in the database.
- Sessions collection stores only SHA-256 token hashes.
- Public SessionResponse strictly excludes token_hash.
- Idempotent index alignment with database.py (user_id, token_hash, expires_at).
"""

from datetime import datetime, timezone
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, Field


class SessionDocument(BaseModel):
    """Session representation as stored in MongoDB 'sessions' collection."""

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: Optional[str] = Field(default=None, alias="_id", description="MongoDB ObjectId string")
    user_id: str = Field(description="Target user document ID reference")
    token_hash: str = Field(description="Cryptographic SHA-256 hash of the issued refresh token")
    expires_at: datetime = Field(description="Absolute UTC expiration timestamp")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Session creation UTC timestamp",
    )
    revoked_at: Optional[datetime] = Field(
        default=None,
        description="UTC revocation timestamp if explicitly revoked/logged out",
    )
    device_info: Optional[str] = Field(
        default=None,
        description="Client device, browser, or user-agent summary",
    )

    @property
    def is_active(self) -> bool:
        """Evaluate if session is valid (unrevoked and unexpired)."""
        if self.revoked_at is not None:
            return False
        now = datetime.now(timezone.utc)
        exp = self.expires_at if self.expires_at.tzinfo else self.expires_at.replace(tzinfo=timezone.utc)
        return exp > now


class SessionCreateInternal(BaseModel):
    """Payload for persisting a new session in MongoDB."""

    user_id: str
    token_hash: str
    expires_at: datetime
    device_info: Optional[str] = None

    def to_document(self) -> dict[str, Any]:
        """Convert to MongoDB document dictionary with UTC timestamps."""
        now = datetime.now(timezone.utc)
        exp = self.expires_at if self.expires_at.tzinfo else self.expires_at.replace(tzinfo=timezone.utc)
        return {
            "user_id": str(self.user_id),
            "token_hash": self.token_hash,
            "expires_at": exp,
            "created_at": now,
            "revoked_at": None,
            "device_info": self.device_info,
        }


class SessionResponse(BaseModel):
    """Safe public representation of an active session for profile inspection.

    SECURITY INVARIANT:
    `token_hash` is strictly excluded from this model.
    """

    model_config = ConfigDict(from_attributes=True)

    id: str = Field(description="Session unique identifier")
    created_at: datetime = Field(description="Session creation timestamp")
    expires_at: datetime = Field(description="Session expiration timestamp")
    device_info: Optional[str] = Field(default=None, description="Device/browser summary")
    is_active: bool = Field(description="Session validity status")
