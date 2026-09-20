"""API root information endpoint."""

from fastapi import APIRouter, status
from app.core.config import get_settings
from app.schemas.info import ApiInfoResponse

router = APIRouter(tags=["System Info"])


@router.get(
    "/",
    response_model=ApiInfoResponse,
    status_code=status.HTTP_200_OK,
    summary="API Root Information",
    description="Returns public API identity, semantic version, and documentation location.",
)
async def get_api_info() -> ApiInfoResponse:
    """Return minimal structured metadata for the Lumora Campus OS API."""
    settings = get_settings()
    return ApiInfoResponse(
        name=settings.app_name,
        version=settings.app_version,
        status="online",
        environment=settings.environment,
        documentation_url="/docs",
        api_prefix=settings.api_v1_prefix,
    )
