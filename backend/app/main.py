"""Lumora Campus OS - FastAPI Backend Application Entry Point.

Establishes:
- Async lifespan for managed startup/shutdown hooks
- Centralized configuration loading
- Explicit CORS allowlist
- Structured error handling envelope adhering to RULE 11
- API versioning foundation mounted at /api/v1
"""

from contextlib import asynccontextmanager
import logging
from typing import AsyncGenerator
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.api.v1.router import api_v1_router
from app.core.config import Settings, get_settings
from app.core.database import db_manager
from app.schemas.response import ErrorDetail, ErrorResponse

logger = logging.getLogger("lumora.backend")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager for graceful startup and shutdown."""
    settings = getattr(app.state, "settings", None) or get_settings()
    logger.info(
        "Initializing %s (v%s) in [%s] mode...",
        settings.app_name,
        settings.app_version,
        settings.environment,
    )
    logger.info("CORS allowed origins: %s", settings.cors_origins)

    # Initialize MongoDB Atlas connection pool and verify indexes
    await db_manager.connect(settings)

    yield

    # Clean shutdown: close MongoDB client pool
    await db_manager.disconnect()
    logger.info("Shutting down %s gracefully...", settings.app_name)


def create_app(settings: Settings | None = None) -> FastAPI:
    """Application factory for Lumora Campus OS FastAPI backend."""
    if settings is None:
        settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="High-performance backend API for Lumora AI-Powered Campus Operating System.",
        docs_url="/docs" if not settings.is_production or settings.debug else None,
        redoc_url="/redoc" if not settings.is_production or settings.debug else None,
        openapi_url="/openapi.json" if not settings.is_production or settings.debug else None,
        lifespan=lifespan,
    )
    app.state.settings = settings

    # --------------------------------------------------------------------------
    # CORS Configuration (Strict Explicit Allowlist)
    # --------------------------------------------------------------------------
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    # --------------------------------------------------------------------------
    # Structured Error Handling Handlers (RULE 11 Compliance)
    # --------------------------------------------------------------------------
    @app.exception_handler(StarletteHTTPException)
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException | HTTPException) -> JSONResponse:
        error_code = f"HTTP_{exc.status_code}"
        if exc.status_code == status.HTTP_404_NOT_FOUND:
            error_code = "RESOURCE_NOT_FOUND"
        elif exc.status_code == status.HTTP_401_UNAUTHORIZED:
            error_code = "UNAUTHORIZED"
        elif exc.status_code == status.HTTP_403_FORBIDDEN:
            error_code = "ACCESS_FORBIDDEN"

        payload = ErrorResponse(
            success=False,
            error=ErrorDetail(
                code=error_code,
                message=str(exc.detail),
                details=None,
            ),
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=payload.model_dump(),
            headers=getattr(exc, "headers", None),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        # Sanitize error messages for client consumption
        clean_errors = []
        for err in exc.errors():
            loc = " -> ".join(str(item) for item in err.get("loc", []))
            clean_errors.append({"field": loc, "message": err.get("msg", "Invalid value")})

        payload = ErrorResponse(
            success=False,
            error=ErrorDetail(
                code="VALIDATION_ERROR",
                message="Incoming request payload failed schema validation.",
                details=clean_errors,
            ),
        )
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=payload.model_dump(),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled server exception processing %s: %s", request.url.path, exc)
        safe_message = "An internal server fault occurred. Operation could not be completed."
        payload = ErrorResponse(
            success=False,
            error=ErrorDetail(
                code="INTERNAL_SERVER_ERROR",
                message=safe_message,
                details=None,
            ),
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=payload.model_dump(),
        )

    # --------------------------------------------------------------------------
    # Route Registration
    # --------------------------------------------------------------------------
    # Root summary endpoint
    @app.get("/", tags=["System Root"], include_in_schema=False)
    async def root_redirect() -> dict[str, str]:
        return {
            "name": settings.app_name,
            "version": settings.app_version,
            "status": "online",
            "api": settings.api_v1_prefix,
            "docs": "/docs" if not settings.is_production or settings.debug else "disabled",
        }

    # Mount versioned API routes (/api/v1)
    app.include_router(api_v1_router, prefix=settings.api_v1_prefix)

    return app


# Standard WSGI/ASGI entrypoint instance
app = create_app()
