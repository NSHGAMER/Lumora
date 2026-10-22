from fastapi import APIRouter, Depends
from app.dependencies.auth import get_current_user
from app.dependencies.database import get_database, get_user_repository
from app.repositories.academic_repository import AcademicRepository
from app.services.academic_service import AcademicService
from app.schemas.academic import CatalogUpdate, GenerateRequest, Revision, SessionMove, ChangeRequest, Decision

router = APIRouter(prefix="/academics", tags=["Academics"])


def get_academic_service(db=Depends(get_database), users=Depends(get_user_repository)):
    return AcademicService(AcademicRepository(db), users)


@router.get("")
async def view(user=Depends(get_current_user), service=Depends(get_academic_service)):
    return await service.view(user)


@router.put("/catalog")
async def configure(body: CatalogUpdate, user=Depends(get_current_user), service=Depends(get_academic_service)):
    return await service.configure(body, user)


@router.post("/generate")
async def generate(body: GenerateRequest, user=Depends(get_current_user), service=Depends(get_academic_service)):
    return await service.generate(body, user)


@router.patch("/sessions/{session_id}")
async def edit(session_id: str, body: SessionMove, user=Depends(get_current_user), service=Depends(get_academic_service)):
    return await service.edit(session_id, body, user)


@router.post("/publish")
async def publish(body: Revision, user=Depends(get_current_user), service=Depends(get_academic_service)):
    return await service.publish(body, user)


@router.post("/requests")
async def request_change(body: ChangeRequest, user=Depends(get_current_user), service=Depends(get_academic_service)):
    return await service.request_change(body, user)


@router.patch("/requests/{request_id}")
async def decide(request_id: str, body: Decision, user=Depends(get_current_user), service=Depends(get_academic_service)):
    return await service.decide(request_id, body, user)
