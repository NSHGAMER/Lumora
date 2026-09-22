"""Aggregated router for all v1 API endpoints."""

from fastapi import APIRouter
from app.api.v1.endpoints import auth, directory, health, info

api_v1_router = APIRouter()

# Mount System Info at /api/v1
api_v1_router.include_router(info.router)

# Mount Health Check at /api/v1/health
api_v1_router.include_router(health.router)

# Mount Authentication at /api/v1/auth
api_v1_router.include_router(auth.router)

# Mount Campus Directory at /api/v1/directory
api_v1_router.include_router(directory.router)
