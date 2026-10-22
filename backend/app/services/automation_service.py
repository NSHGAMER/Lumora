"""Durable, restricted workflow execution. Run in a separate worker process."""
import asyncio
from datetime import datetime, timedelta, timezone
from uuid import uuid4
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError


def utcnow():
    return datetime.now(timezone.utc)


async def ensure_automation(db):
    await db["notifications"].create_index([("user_id", 1), ("created_at", -1)])
    await db["workflow_runs"].create_index([("status", 1), ("next_at", 1)])
    await db["campus_records"].create_index([("kind", 1), ("roles", 1), ("created_at", -1)])
    for trigger in ("announcement.created", "timetable.published", "request.decided"):
        await db["workflows"].update_one({"_id": trigger}, {"$setOnInsert": {
            "name": trigger.replace(".", " ").title(), "trigger": trigger, "action": "notify",
            "enabled": True, "max_attempts": 3, "created_by": "system", "run_at": None,
        }}, upsert=True)


class AutomationEngine:
    def __init__(self, db):
        self.db = db

    async def enqueue(self, workflow, event):
        run_id = f'{workflow["_id"]}:{event["id"]}'
        await self.db["workflow_runs"].update_one({"_id": run_id}, {"$setOnInsert": {
            "workflow_id": workflow["_id"], "action": workflow["action"], "event": event,
            "status": "queued", "attempts": 0, "max_attempts": workflow["max_attempts"],
            "next_at": utcnow(), "created_at": utcnow(), "error": None,
        }}, upsert=True)

    async def dispatch(self):
        workflows = await self.db["workflows"].find({"enabled": True}).limit(200).to_list(200)
        for name in ("campus_records", "timetable_plans"):
            docs = await self.db[name].find({"outbox.0": {"$exists": True}}).limit(50).to_list(50)
            for doc in docs:
                for event in doc["outbox"][:100]:
                    for workflow in workflows:
                        if workflow["trigger"] == event["trigger"]:
                            await self.enqueue(workflow, event)
                    # Event is acknowledged only after durable, deduplicated runs exist.
                    await self.db[name].update_one({"_id": doc["_id"]}, {"$pull": {"outbox": {"id": event["id"]}}})
        for workflow in workflows:
            run_at = workflow.get("run_at")
            if workflow["trigger"] != "scheduled" or not run_at:
                continue
            scheduled = datetime.fromisoformat(run_at) if isinstance(run_at, str) else run_at
            if scheduled <= utcnow():
                await self.enqueue(workflow, {"id": scheduled.isoformat(), "trigger": "scheduled",
                    "title": workflow["title"], "body": workflow["body"], "roles": workflow["roles"], "user_ids": []})

    async def notify(self, run):
        event = run["event"]
        ids = list(event.get("user_ids", []))
        roles = list(event.get("roles", []))
        from bson import ObjectId
        user_ids = [ObjectId(uid) if ObjectId.is_valid(uid) else uid for uid in ids]
        cursor = self.db["users"].find({"is_active": True, "$or": [{"role": {"$in": roles}}, {"_id": {"$in": user_ids}}]}, {"_id": 1})
        count = 0
        async for user in cursor:
            count += 1
            if count > 10000:
                raise ValueError("Recipient limit exceeded")
            uid = str(user["_id"])
            try:
                await self.db["notifications"].update_one({"_id": f'{run["_id"]}:{uid}'}, {"$setOnInsert": {
                    "user_id": uid, "title": event["title"], "body": event["body"], "read": False,
                    "created_at": utcnow().isoformat(), "run_id": run["_id"],
                }}, upsert=True)
            except DuplicateKeyError:
                pass  # Another leased attempt already delivered this exact recipient.
        return count

    async def run_one(self):
        now, lease = utcnow(), str(uuid4())
        run = await self.db["workflow_runs"].find_one_and_update(
            {"$or": [{"status": {"$in": ["queued", "retry"]}, "next_at": {"$lte": now}},
                     {"status": "running", "lease_until": {"$lte": now}}]},
            {"$set": {"status": "running", "lease": lease, "lease_until": now + timedelta(seconds=60)}, "$inc": {"attempts": 1}},
            sort=[("next_at", 1)], return_document=ReturnDocument.AFTER)
        if not run:
            return False
        selector = {"_id": run["_id"], "lease": lease}
        try:
            if run["attempts"] > run["max_attempts"]:
                raise ValueError("Retry limit exhausted after worker restart")
            workflow = await self.db["workflows"].find_one({"_id": run["workflow_id"], "enabled": True})
            if not workflow:
                await self.db["workflow_runs"].update_one(selector, {"$set": {"status": "cancelled", "finished_at": utcnow()}})
                return True
            handlers = {"notify": self.notify}
            if run["action"] not in handlers:
                raise ValueError("Unregistered action")
            delivered = await asyncio.wait_for(handlers[run["action"]](run), timeout=20)
            await self.db["workflow_runs"].update_one(selector, {"$set": {
                "status": "succeeded", "delivered": delivered, "finished_at": utcnow(), "error": None}})
        except Exception as exc:
            # Never persist provider messages, connection strings or recipient payloads in error logs.
            final = run["attempts"] >= run["max_attempts"]
            await self.db["workflow_runs"].update_one(selector, {"$set": {
                "status": "failed" if final else "retry", "error": type(exc).__name__,
                "next_at": utcnow() + timedelta(seconds=2 ** run["attempts"] * 5), "finished_at": utcnow() if final else None}})
        return True

    async def tick(self):
        await self.dispatch()
        for _ in range(10):
            if not await self.run_one():
                break
