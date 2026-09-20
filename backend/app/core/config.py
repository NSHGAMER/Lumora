"""Centralized configuration management for Lumora Campus OS FastAPI backend.

Adheres to 12-factor application principles and strict security invariants:
- Zero hardcoded secrets
- Strict environment segregation (development, testing, production)
- Explicit CORS allowlist with wildcard prohibition in production
- Structured placeholders for future Phase 2B.2 (MongoDB) and Phase 2B.3 (JWT/Auth)
"""

from functools import lru_cache
import json
from typing import Any, Literal
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings validated via Pydantic Settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="",
        extra="ignore",
        case_sensitive=False,
    )

    # Application Identity
    app_name: str = Field(default="Lumora Campus OS API", description="Public name of API service")
    app_version: str = Field(default="1.0.0", description="Semantic API version")
    api_v1_prefix: str = Field(default="/api/v1", description="Prefix for v1 endpoints")

    # Environment & Operational Mode
    environment: Literal["development", "testing", "production"] = Field(
        default="development",
        alias="LUMORA_ENV",
        description="Active runtime environment",
    )
    debug: bool = Field(default=False, description="Enable verbose debugging features")

    # Server Bindings
    api_host: str = Field(default="0.0.0.0", alias="API_HOST", description="Host address to bind")
    api_port: int = Field(default=8000, alias="API_PORT", description="Port number to bind")

    # CORS Allowlist
    cors_origins: list[str] = Field(
        default=[
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
        ],
        alias="CORS_ORIGINS",
        description="Explicit list of allowed frontend origins",
    )

    # --------------------------------------------------------------------------
    # Planned Phase 2B.2: MongoDB Atlas Persistence Placeholders
    # --------------------------------------------------------------------------
    mongodb_uri: str = Field(
        default="mongodb://localhost:27017",
        alias="MONGODB_URI",
        description="MongoDB connection string (placeholder for Phase 2B.2)",
    )
    mongodb_db_name: str = Field(
        default="lumora_db",
        alias="MONGODB_DB_NAME",
        description="Target database name (placeholder for Phase 2B.2)",
    )

    # --------------------------------------------------------------------------
    # Planned Phase 2B.3: Real Authentication & JWT Security Placeholders
    # --------------------------------------------------------------------------
    jwt_secret_key: str = Field(
        default="lumora-insecure-dev-secret-key-change-in-production",
        alias="JWT_SECRET_KEY",
        description="Signing secret for JWTs (placeholder for Phase 2B.3)",
    )
    jwt_algorithm: str = Field(
        default="HS256",
        alias="JWT_ALGORITHM",
        description="Cryptographic algorithm for JWT signing",
    )
    access_token_expire_minutes: int = Field(
        default=15,
        alias="ACCESS_TOKEN_EXPIRE_MINUTES",
        description="Access token validity period in minutes",
    )
    refresh_token_expire_days: int = Field(
        default=7,
        alias="REFRESH_TOKEN_EXPIRE_DAYS",
        description="Refresh token validity period in days",
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Any) -> list[str]:
        """Parse CORS origins from JSON string, comma-separated string, or list."""
        if isinstance(v, str):
            v_stripped = v.strip()
            if v_stripped.startswith("[") and v_stripped.endswith("]"):
                try:
                    parsed = json.loads(v_stripped)
                    if isinstance(parsed, list):
                        return [str(origin).strip() for origin in parsed if origin]
                except json.JSONDecodeError:
                    pass
            # Fallback to comma-separated list
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        if isinstance(v, (list, tuple, set)):
            return [str(origin).strip() for origin in v if origin]
        return []

    @field_validator("cors_origins")
    @classmethod
    def validate_cors_origins_security(cls, origins: list[str], info: Any) -> list[str]:
        """Enforce strict security: wildcard CORS origins are forbidden in production."""
        data = info.data
        env = data.get("environment")
        if env == "production":
            if "*" in origins or "http://*" in origins or "https://*" in origins:
                raise ValueError("Wildcard CORS origins ('*') are strictly forbidden in production mode.")
            if not origins:
                raise ValueError("Production mode requires at least one explicit allowed origin in CORS_ORIGINS.")
        return origins

    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.environment == "production"

    @property
    def is_testing(self) -> bool:
        """Check if running in test environment."""
        return self.environment == "testing"

    @property
    def is_development(self) -> bool:
        """Check if running in development."""
        return self.environment == "development"


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
