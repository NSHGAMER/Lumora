"""User repository for persistence operations on MongoDB 'users' collection.

Adheres to:
- Single responsibility: persistence only, zero authentication/business logic
- Pure collection dependency injection (no client construction inside repository)
- Deterministic query normalization for email and institutional ID lookups
"""

from datetime import datetime, timezone
from typing import Any, Optional
from bson import ObjectId
from pymongo.asynchronous.collection import AsyncCollection

from app.schemas.user import (
    UserCreateInternal,
    UserDocument,
    normalize_email,
    normalize_institutional_id,
)


class UserRepository:
    """Repository handling all persistence queries and mutations for the 'users' collection."""

    def __init__(self, collection: AsyncCollection) -> None:
        self.collection = collection

    @staticmethod
    def _document_to_schema(doc: dict[str, Any]) -> UserDocument:
        """Convert MongoDB document dictionary with ObjectId to UserDocument."""
        if "_id" in doc and isinstance(doc["_id"], ObjectId):
            doc["_id"] = str(doc["_id"])
        return UserDocument(**doc)

    async def get_by_id(self, user_id: str) -> Optional[UserDocument]:
        """Fetch user by unique system identifier (MongoDB ObjectId or string)."""
        query: dict[str, Any]
        if ObjectId.is_valid(user_id):
            query = {"_id": ObjectId(user_id)}
        else:
            query = {"_id": user_id}

        doc = await self.collection.find_one(query)
        return self._document_to_schema(doc) if doc else None

    async def get_by_email(self, email: str) -> Optional[UserDocument]:
        """Fetch user by email using deterministic normalization."""
        norm_email = normalize_email(email)
        doc = await self.collection.find_one({"normalized_email": norm_email})
        return self._document_to_schema(doc) if doc else None

    async def get_by_institutional_id(self, institutional_id: str) -> Optional[UserDocument]:
        """Fetch user by institutional identifier using deterministic normalization."""
        norm_id = normalize_institutional_id(institutional_id)
        doc = await self.collection.find_one({"institutional_id": norm_id})
        return self._document_to_schema(doc) if doc else None

    async def get_by_identifier(self, identifier: str) -> Optional[UserDocument]:
        """Find user by either institutional email OR institutional ID."""
        cleaned = identifier.strip()
        if "@" in cleaned:
            return await self.get_by_email(cleaned)
        return await self.get_by_institutional_id(cleaned)

    async def create_user(self, user_data: UserCreateInternal) -> UserDocument:
        """Persist a new user document into the collection."""
        doc = user_data.to_document()
        result = await self.collection.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        return UserDocument(**doc)

    async def update_last_login(
        self, user_id: str, login_time: Optional[datetime] = None
    ) -> bool:
        """Update last login timestamp for the specified user."""
        now = login_time or datetime.now(timezone.utc)
        query: dict[str, Any]
        if ObjectId.is_valid(user_id):
            query = {"_id": ObjectId(user_id)}
        else:
            query = {"_id": user_id}

        res = await self.collection.update_one(
            query,
            {"$set": {"last_login_at": now, "updated_at": now}},
        )
        return res.modified_count > 0

    async def count(self) -> int:
        """Count total user documents in collection."""
        return await self.collection.count_documents({})
