"""Directory repository handling MongoDB persistence for 'directory_profiles' collection.

Responsibilities:
- Isolated persistence operations on campus directory profiles
- Direct MongoDB collection interactions using AsyncCollection
- Zero HTTP or authorization logic
"""

from datetime import datetime, timezone
from typing import Any, List, Optional
from bson import ObjectId
from pymongo.asynchronous.collection import AsyncCollection

from app.schemas.directory import DirectoryProfileDocument, DirectoryProfileUpdate


class DirectoryRepository:
    """Repository handling all database queries and updates for directory profiles."""

    def __init__(self, collection: AsyncCollection) -> None:
        self.collection = collection

    @staticmethod
    def _document_to_schema(doc: dict[str, Any]) -> DirectoryProfileDocument:
        """Convert MongoDB document dictionary to DirectoryProfileDocument."""
        if "_id" in doc and isinstance(doc["_id"], ObjectId):
            doc["_id"] = str(doc["_id"])
        return DirectoryProfileDocument(**doc)

    async def get_by_user_id(self, user_id: str) -> Optional[DirectoryProfileDocument]:
        """Fetch directory profile for a specific user ID."""
        doc = await self.collection.find_one({"user_id": str(user_id)})
        return self._document_to_schema(doc) if doc else None

    async def get_profiles_by_user_ids(
        self, user_ids: List[str]
    ) -> dict[str, DirectoryProfileDocument]:
        """Batch fetch directory profiles for a list of user IDs."""
        if not user_ids:
            return {}

        clean_ids = [str(uid) for uid in user_ids]
        cursor = self.collection.find({"user_id": {"$in": clean_ids}})
        docs = await cursor.to_list(length=len(clean_ids))
        return {str(d["user_id"]): self._document_to_schema(d) for d in docs}

    async def upsert_profile(
        self, user_id: str, updates: DirectoryProfileUpdate
    ) -> DirectoryProfileDocument:
        """Create or update campus directory profile for user."""
        now = datetime.now(timezone.utc)
        update_data = updates.model_dump(exclude_unset=True)

        set_fields: dict[str, Any] = {"updated_at": now}
        for field, val in update_data.items():
            if val is not None:
                set_fields[field] = val

        setOnInsert_fields: dict[str, Any] = {
            "user_id": str(user_id),
            "created_at": now,
        }
        if "department" not in set_fields:
            setOnInsert_fields["department"] = "General Campus"

        result = await self.collection.find_one_and_update(
            {"user_id": str(user_id)},
            {
                "$set": set_fields,
                "$setOnInsert": setOnInsert_fields,
            },
            upsert=True,
            return_document=True,
        )

        if result is None:
            # Fallback retrieve if find_one_and_update returns None on insert in older driver variants
            result = await self.collection.find_one({"user_id": str(user_id)})

        return self._document_to_schema(result)  # type: ignore[arg-type]

    async def list_departments(self) -> List[str]:
        """Fetch distinct list of campus departments."""
        departments = await self.collection.distinct("department")
        dept_set = {str(d).strip() for d in departments if d and str(d).strip()}
        dept_set.add("General Campus")
        return sorted(list(dept_set))

    async def get_user_ids_by_department(self, department: str) -> List[str]:
        """Fetch all user IDs explicitly assigned to a specific department."""
        import re
        cursor = self.collection.find(
            {"department": {"$regex": f"^{re.escape(department.strip())}$", "$options": "i"}},
            projection={"user_id": 1},
        )
        docs = await cursor.to_list(length=None)
        return [str(d["user_id"]) for d in docs]

    async def get_user_ids_with_other_departments(self, department: str) -> List[str]:
        """Fetch user IDs assigned to any department OTHER than the specified one."""
        import re
        cursor = self.collection.find(
            {"department": {"$not": {"$regex": f"^{re.escape(department.strip())}$", "$options": "i"}}},
            projection={"user_id": 1},
        )
        docs = await cursor.to_list(length=None)
        return [str(d["user_id"]) for d in docs]
