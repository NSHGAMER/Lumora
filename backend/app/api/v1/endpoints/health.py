"""Health check endpoint for process monitoring and deployment orchestration."""

from datetime import datetime, timezone
from fastapi import APIRouter, status
from app.core.config import get_settings
from app.schemas.health import HealthResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Service Health Inspection",
    description="Returns current process health, environment, version, and component status.",
)
async def check_health() -> HealthResponse:
    """Verify that the FastAPI process is running and responsive."""
    settings = get_settings()
    return HealthResponse(
        status="healthy",
        environment=settings.environment,
        version=settings.app_version,
        timestamp=datetime.now(timezone.utc),
        services={"api": "operational"},
    )
