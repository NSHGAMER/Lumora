"""Persistence for institutional records and recipient-owned notifications."""
from datetime import datetime, timezone
from uuid import uuid4


class CampusRepository:
    def __init__(self, database):
        self.db = database

    async def records(self, role, kind=None, limit=100):
        query = {"roles": role}
        if kind:
            query["kind"] = kind
        return await self.db["campus_records"].find(query, {"outbox": 0}).sort("created_at", -1).limit(limit).to_list(limit)

    async def create_record(self, body, actor_id):
        now = datetime.now(timezone.utc)
        record = {"_id": str(uuid4()), **body.model_dump(mode="json"), "created_by": actor_id,
                  "created_at": now.isoformat(), "outbox": []}
        if body.kind == "announcement":
            record["outbox"] = [{"id": str(uuid4()), "trigger": "announcement.created", "title": body.title,
                                  "body": body.body[:1000], "roles": body.roles, "user_ids": [], "created_at": now.isoformat()}]
        await self.db["campus_records"].insert_one(record)
        return {k: v for k, v in record.items() if k != "outbox"}

    async def notifications(self, user_id):
        return await self.db["notifications"].find({"user_id": user_id}).sort("created_at", -1).limit(100).to_list(100)

    async def mark_read(self, notification_id, user_id):
        return await self.db["notifications"].update_one(
            {"_id": notification_id, "user_id": user_id}, {"$set": {"read": True}})
