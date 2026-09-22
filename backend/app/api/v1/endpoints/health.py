from datetime import datetime, timezone
from fastapi import APIRouter, status
from app.core.config import get_settings
from app.core.database import db_manager
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
    """Verify process health and inspect database connectivity truthfully."""
    settings = get_settings()
    db_health = db_manager.get_health_status()
    db_state = db_health["state"]

    services = {
        "api": "operational",
        "database": db_state,
    }

    # Determine overall system health
    if db_state == "connected":
        overall_status = "healthy"
    elif db_state == "unconfigured":
        # In development/testing, unconfigured DB is safe development fallback
        overall_status = "healthy" if not settings.is_production else "degraded"
    else:
        # Configured but unreachable/disconnected
        overall_status = "degraded"

    return HealthResponse(
        status=overall_status,
        environment=settings.environment,
        version=settings.app_version,
        timestamp=datetime.now(timezone.utc),
        services=services,
    )
