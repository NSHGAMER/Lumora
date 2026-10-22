"""Authorized academic workflows with revision checks and immutable published snapshots."""
from copy import deepcopy
from datetime import datetime, timezone
from uuid import uuid4
from fastapi import HTTPException
from app.schemas.academic import Catalog, Session, SessionMove
from app.services.scheduling import validate_schedule, generate_schedule

EDITORS = {"admin", "management"}


class AcademicService:
    def __init__(self, repository, users):
        self.repo, self.users = repository, users

    @staticmethod
    def editor(user):
        if user.role not in EDITORS:
            raise HTTPException(403, "Academic administration permission required")

    async def load(self, revision):
        doc = await self.repo.read()
        if doc["revision"] != revision:
            raise HTTPException(409, "Timetable changed. Reload before editing.")
        return doc

    async def view(self, user):
        doc = await self.repo.read()
        editor = user.role in EDITORS
        snapshot = doc if editor else doc.get("published")
        catalog = deepcopy(snapshot["catalog"] if snapshot else Catalog().model_dump())
        sessions = deepcopy(snapshot.get("draft", snapshot.get("sessions", [])) if snapshot else [])
        if not editor:
            class_ids = {e["class_id"] for e in catalog["enrollments"] if e["user_id"] == user.id}
            subjects = [s for s in catalog["subjects"] if
                        (user.role == "faculty" and s["teacher_id"] == user.id) or
                        (user.role == "student" and s["class_id"] in class_ids)]
            ids = {s["id"] for s in subjects}
            sessions = [s for s in sessions if s["subject_id"] in ids]
            catalog["subjects"] = subjects
            catalog["classes"] = [c for c in catalog["classes"] if c["id"] in {s["class_id"] for s in subjects}]
            catalog["teachers"] = []  # private availability and workload are administrative
            catalog["enrollments"] = []
        teacher_ids = {s["teacher_id"] for s in catalog["subjects"]}
        names = {}
        for uid in teacher_ids:
            faculty = await self.users.get_by_id(uid)
            if faculty:
                names[uid] = faculty.full_name
        return {"revision": doc["revision"], "catalog": catalog, "sessions": sessions,
                "faculty_names": names, "published_at": (doc.get("published") or {}).get("published_at"),
                "has_unpublished_changes": doc.get("dirty", False) if editor else False,
                "requests": [r for r in doc["requests"] if editor or r["user_id"] == user.id]}

    async def configure(self, body, user):
        self.editor(user)
        doc = await self.load(body.revision)
        for teacher in body.catalog.teachers:
            target = await self.users.get_by_id(teacher.user_id)
            if not target or not target.is_active or target.role != "faculty":
                raise HTTPException(422, "Every faculty allocation must reference an active faculty user")
        for enrollment in body.catalog.enrollments:
            target = await self.users.get_by_id(enrollment.user_id)
            if not target or not target.is_active or target.role != "student":
                raise HTTPException(422, "Every enrollment must reference an active student user")
        doc["catalog"] = body.catalog.model_dump()
        doc["draft"] = []  # catalog changes invalidate drafts; published snapshot stays intact
        doc["dirty"] = True
        await self.repo.save(doc, body.revision)
        return await self.view(user)

    async def generate(self, body, user):
        self.editor(user)
        doc = await self.load(body.revision)
        import asyncio
        generated = await asyncio.to_thread(generate_schedule, Catalog(**doc["catalog"]),
                                             [Session(**s) for s in doc["draft"]], body.class_id)
        doc["draft"] = [s.model_dump() for s in generated]
        doc["dirty"] = True
        await self.repo.save(doc, body.revision)
        return await self.view(user)

    @staticmethod
    def move(doc, session_id, body):
        target = next((s for s in doc["draft"] if s["id"] == session_id), None)
        if not target:
            raise HTTPException(404, "Session no longer exists in the draft")
        target.update({k: getattr(body, k) for k in ("day", "period", "room_id")})
        validate_schedule(Catalog(**doc["catalog"]), [Session(**s) for s in doc["draft"]])

    async def edit(self, session_id, body, user):
        self.editor(user)
        doc = await self.load(body.revision)
        self.move(doc, session_id, body)
        doc["dirty"] = True
        await self.repo.save(doc, body.revision)
        return await self.view(user)

    async def publish(self, body, user):
        self.editor(user)
        doc = await self.load(body.revision)
        if not doc["draft"]:
            raise HTTPException(409, "Generate a draft first")
        validate_schedule(Catalog(**doc["catalog"]), [Session(**s) for s in doc["draft"]], complete=True)
        now = datetime.now(timezone.utc).isoformat()
        doc["published"] = {"catalog": deepcopy(doc["catalog"]), "sessions": deepcopy(doc["draft"]), "published_at": now}
        doc["dirty"] = False
        recipients = sorted({e["user_id"] for e in doc["catalog"]["enrollments"]} |
                            {t["user_id"] for t in doc["catalog"]["teachers"]})
        doc["outbox"].append({"id": str(uuid4()), "trigger": "timetable.published",
                              "title": "Timetable published", "body": "Your published timetable has been updated.",
                              "user_ids": recipients, "roles": [], "created_at": now})
        await self.repo.save(doc, body.revision)
        return await self.view(user)

    async def request_change(self, body, user):
        if user.role != "faculty":
            raise HTTPException(403, "Only assigned faculty can request changes")
        doc = await self.load(body.revision)
        published = doc.get("published")
        if not published:
            raise HTTPException(409, "Publish a timetable before requesting changes")
        subject_ids = {s["id"] for s in published["catalog"]["subjects"] if s["teacher_id"] == user.id}
        if not any(s["id"] == body.session_id and s["subject_id"] in subject_ids for s in published["sessions"]):
            raise HTTPException(403, "You may request changes only to your assigned published sessions")
        check = {"catalog": published["catalog"], "draft": deepcopy(published["sessions"])}
        self.move(check, body.session_id, body)
        if len(doc["requests"]) >= 500:
            raise HTTPException(409, "Request history limit reached; contact the administrator")
        doc["requests"].append({"id": str(uuid4()), **body.model_dump(), "user_id": user.id,
                                "status": "pending", "created_at": datetime.now(timezone.utc).isoformat()})
        await self.repo.save(doc, body.revision)
        return await self.view(user)

    async def decide(self, request_id, body, user):
        self.editor(user)
        doc = await self.load(body.revision)
        target = next((r for r in doc["requests"] if r["id"] == request_id), None)
        if not target:
            raise HTTPException(404, "Request not found")
        if target["status"] != "pending":
            raise HTTPException(409, "Request already reviewed")
        if body.status == "approved":
            self.move(doc, target["session_id"], SessionMove(**{k: target[k] for k in ("revision", "day", "period", "room_id")}))
            doc["dirty"] = True
        target.update(status=body.status, decided_by=user.id)
        doc["outbox"].append({"id": str(uuid4()), "trigger": "request.decided",
                              "title": f"Timetable request {body.status}",
                              "body": "Approved changes take effect after the next publication.",
                              "user_ids": [target["user_id"]], "roles": [],
                              "created_at": datetime.now(timezone.utc).isoformat()})
        await self.repo.save(doc, body.revision)
        return await self.view(user)
