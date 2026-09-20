"""Health check schema."""

from datetime import datetime, timezone
from typing import Literal
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Structured health verification response."""

    status: Literal["healthy", "degraded", "unhealthy"] = Field(
        default="healthy", description="Overall system health status"
    )
    environment: str = Field(description="Active application runtime environment")
    version: str = Field(description="Service semantic version")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC timestamp of the health check inspection",
    )
    services: dict[str, str] = Field(
        default_factory=lambda: {"api": "operational"},
        description="Component status dictionary",
    )
