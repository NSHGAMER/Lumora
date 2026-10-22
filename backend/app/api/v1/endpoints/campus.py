from fastapi import APIRouter, Depends, HTTPException, Query
from app.dependencies.auth import get_current_user, require_roles
from app.dependencies.database import get_database
from app.repositories.campus_repository import CampusRepository
from app.schemas.campus import CampusRecord
from app.api.v1.endpoints.academics import get_academic_service

router = APIRouter(prefix="/campus", tags=["Campus"])


def get_campus_repository(db=Depends(get_database)):
    return CampusRepository(db)


@router.get("/records")
async def records(kind: str | None = Query(default=None, pattern="^(announcement|event|document)$"),
                  user=Depends(get_current_user), repo=Depends(get_campus_repository)):
    return await repo.records(user.role, kind)


@router.post("/records", status_code=201)
async def create_record(body: CampusRecord, user=Depends(require_roles("admin", "management")), repo=Depends(get_campus_repository)):
    return await repo.create_record(body, user.id)


@router.get("/notifications")
async def notifications(user=Depends(get_current_user), repo=Depends(get_campus_repository)):
    return await repo.notifications(user.id)


@router.patch("/notifications/{notification_id}/read")
async def read_notification(notification_id: str, user=Depends(get_current_user), repo=Depends(get_campus_repository)):
    result = await repo.mark_read(notification_id, user.id)
    if not result.matched_count:
        raise HTTPException(404, "Notification not found")
    return {"read": True}


@router.get("/summary")
async def summary(user=Depends(get_current_user), repo=Depends(get_campus_repository), academics=Depends(get_academic_service)):
    view = await academics.view(user)
    query = {"roles": user.role}
    return {"role": user.role, "scheduled_sessions": len(view["sessions"]),
            "announcements": await repo.db["campus_records"].count_documents({**query, "kind": "announcement"}),
            "events": await repo.db["campus_records"].count_documents({**query, "kind": "event"}),
            "unread_notifications": await repo.db["notifications"].count_documents({"user_id": user.id, "read": False}),
            "published_at": view["published_at"], "email_available": False,
            "external_channels_available": False}
