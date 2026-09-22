"""Session repository for persistence operations on MongoDB 'sessions' collection.

Adheres to:
- Persistence only, zero authentication/business logic
- Pure collection dependency injection
- Hashed token queries only; raw refresh tokens are never handled here
"""

from datetime import datetime, timezone
from typing import Any, Optional
from bson import ObjectId
from pymongo import DESCENDING, ReturnDocument
from pymongo.asynchronous.collection import AsyncCollection

from app.schemas.session import SessionCreateInternal, SessionDocument


class SessionRepository:
    """Repository handling persistence queries and mutations for the 'sessions' collection."""

    def __init__(self, collection: AsyncCollection) -> None:
        self.collection = collection

    @staticmethod
    def _document_to_schema(doc: dict[str, Any]) -> SessionDocument:
        """Convert MongoDB document dictionary with ObjectId to SessionDocument."""
        if "_id" in doc and isinstance(doc["_id"], ObjectId):
            doc["_id"] = str(doc["_id"])
        return SessionDocument(**doc)

    async def create_session(self, session_data: SessionCreateInternal) -> SessionDocument:
        """Persist a new session document into the collection."""
        doc = session_data.to_document()
        result = await self.collection.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        return SessionDocument(**doc)

    async def get_by_token_hash(self, token_hash: str) -> Optional[SessionDocument]:
        """Fetch session document by its SHA-256 token fingerprint."""
        if not token_hash:
            return None
        doc = await self.collection.find_one({"token_hash": token_hash.strip()})
        return self._document_to_schema(doc) if doc else None

    async def consume_active_session(self, token_hash: str) -> Optional[SessionDocument]:
        """Atomically find, validate unrevoked/unexpired state, and revoke an active session.

        Enforces that a session can be consumed for rotation exactly once.
        Concurrent attempts with the same token_hash will find revoked_at is not None,
        returning None and preventing race conditions or duplicate rotations.
        """
        if not token_hash:
            return None
        now = datetime.now(timezone.utc)
        doc = await self.collection.find_one_and_update(
            {
                "token_hash": token_hash.strip(),
                "revoked_at": None,
                "expires_at": {"$gt": now},
            },
            {"$set": {"revoked_at": now}},
            return_document=ReturnDocument.AFTER,
        )
        return self._document_to_schema(doc) if doc else None

    async def get_active_sessions_for_user(self, user_id: str) -> list[SessionDocument]:
        """Retrieve all active (unrevoked and unexpired) sessions for a user."""
        now = datetime.now(timezone.utc)
        cursor = self.collection.find({
            "user_id": str(user_id),
            "revoked_at": None,
            "expires_at": {"$gt": now},
        }).sort("created_at", DESCENDING)

        sessions: list[SessionDocument] = []
        async for doc in cursor:
            sessions.append(self._document_to_schema(doc))
        return sessions

    async def revoke_session(self, token_hash: str) -> bool:
        """Mark a specific session as revoked."""
        if not token_hash:
            return False
        now = datetime.now(timezone.utc)
        res = await self.collection.update_one(
            {"token_hash": token_hash.strip(), "revoked_at": None},
            {"$set": {"revoked_at": now}},
        )
        return res.modified_count > 0

    async def revoke_all_for_user(self, user_id: str) -> int:
        """Revoke all active sessions for a user (e.g. during security invalidation)."""
        now = datetime.now(timezone.utc)
        res = await self.collection.update_many(
            {"user_id": str(user_id), "revoked_at": None},
            {"$set": {"revoked_at": now}},
        )
        return res.modified_count

    async def delete_expired_sessions(self) -> int:
        """Clean up sessions that have surpassed their expiration timestamp."""
        now = datetime.now(timezone.utc)
        res = await self.collection.delete_many({"expires_at": {"$lt": now}})
        return res.deleted_count

    async def count_active(self) -> int:
        """Count total active sessions across the platform."""
        now = datetime.now(timezone.utc)
        return await self.collection.count_documents({
            "revoked_at": None,
            "expires_at": {"$gt": now},
        })
