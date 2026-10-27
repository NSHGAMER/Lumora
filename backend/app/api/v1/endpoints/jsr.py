from fastapi import APIRouter, Depends
from app.core.config import get_settings
from app.dependencies.auth import get_current_user
from app.dependencies.database import get_database
from app.dependencies.directory import get_directory_service
from app.api.v1.endpoints.academics import get_academic_service
from app.api.v1.endpoints.campus import get_campus_repository
from app.services.ai_provider import ChatCompletionProvider
from app.services.jsr_service import JSRService
from app.schemas.jsr import ChatRequest

router = APIRouter(prefix="/jsr", tags=["JSR"])


def get_ai_provider(settings=Depends(get_settings)):
    return ChatCompletionProvider(settings)


@router.post("/chat")
async def chat(body: ChatRequest, user=Depends(get_current_user), db=Depends(get_database),
               academics=Depends(get_academic_service), campus=Depends(get_campus_repository),
               directory=Depends(get_directory_service), provider=Depends(get_ai_provider)):
    return await JSRService(db, academics, campus, directory, provider).chat(body, user)
