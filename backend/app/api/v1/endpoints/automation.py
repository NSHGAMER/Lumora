from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException
from app.dependencies.auth import require_roles
from app.dependencies.database import get_database
from app.schemas.campus import WorkflowDefinition

router = APIRouter(prefix="/automation", tags=["Automation"], dependencies=[Depends(require_roles("admin", "management"))])


@router.get("")
async def inspect(db=Depends(get_database)):
    return {"workflows": await db["workflows"].find({}).limit(200).to_list(200),
            "runs": await db["workflow_runs"].find({}, {"event": 0, "lease": 0}).sort("created_at", -1).limit(100).to_list(100),
            "worker": await db["worker_health"].find_one({"_id": "automation"})}


@router.post("/workflows", status_code=201)
async def create(body: WorkflowDefinition, user=Depends(require_roles("admin", "management")), db=Depends(get_database)):
    if await db["workflows"].count_documents({}) >= 200:
        raise HTTPException(409, "Workflow limit reached")
    doc = {"_id": str(uuid4()), **body.model_dump(mode="json"), "created_by": user.id}
    await db["workflows"].insert_one(doc)
    return doc


@router.put("/workflows/{workflow_id}")
async def update(workflow_id: str, body: WorkflowDefinition, user=Depends(require_roles("admin", "management")), db=Depends(get_database)):
    result = await db["workflows"].update_one({"_id": workflow_id}, {"$set": {**body.model_dump(mode="json"), "updated_by": user.id}})
    if not result.matched_count:
        raise HTTPException(404, "Workflow not found")
    return {"updated": True}
