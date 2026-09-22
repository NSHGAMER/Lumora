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
from pydantic import AliasChoices, Field, field_validator
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
    # Phase 2B.2: MongoDB Atlas Persistence Configuration
    # --------------------------------------------------------------------------
    mongodb_uri: str | None = Field(
        default=None,
        alias="MONGODB_URI",
        description="MongoDB connection string (URI format)",
    )
    mongodb_database: str = Field(
        default="lumora",
        validation_alias=AliasChoices("MONGODB_DATABASE", "MONGODB_DB_NAME"),
        description="Target MongoDB database name",
    )
    mongodb_server_selection_timeout_ms: int = Field(
        default=2500,
        alias="MONGODB_TIMEOUT_MS",
        description="Timeout in milliseconds for MongoDB server discovery and ping",
    )
    mongodb_min_pool_size: int = Field(
        default=5,
        alias="MONGODB_MIN_POOL_SIZE",
        description="Minimum connection pool size for MongoDB",
    )
    mongodb_max_pool_size: int = Field(
        default=50,
        alias="MONGODB_MAX_POOL_SIZE",
        description="Maximum connection pool size for MongoDB",
    )

    # --------------------------------------------------------------------------
    # Phase 2B.3: Authentication & Token Security Configuration
    # --------------------------------------------------------------------------
    jwt_secret_key: str = Field(
        default="lumora-insecure-dev-secret-key-change-in-production-min-32-chars",
        alias="JWT_SECRET_KEY",
        description="Cryptographic signing secret for JWT tokens",
    )
    jwt_algorithm: str = Field(
        default="HS256",
        alias="JWT_ALGORITHM",
        description="Cryptographic algorithm for JWT signing",
    )
    jwt_access_token_expire_minutes: int = Field(
        default=15,
        validation_alias=AliasChoices("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "ACCESS_TOKEN_EXPIRE_MINUTES"),
        description="Access token validity period in minutes",
    )
    jwt_refresh_token_expire_days: int = Field(
        default=7,
        validation_alias=AliasChoices("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "REFRESH_TOKEN_EXPIRE_DAYS"),
        description="Refresh token validity period in days",
    )
    jwt_issuer: str = Field(
        default="lumora",
        alias="JWT_ISSUER",
        description="JWT issuer (iss) claim",
    )
    jwt_audience: str = Field(
        default="lumora-client",
        alias="JWT_AUDIENCE",
        description="JWT audience (aud) claim",
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

    @field_validator("jwt_secret_key")
    @classmethod
    def validate_jwt_secret_key(cls, v: str, info: Any) -> str:
        """Enforce production requirement that JWT secret is strong and not a placeholder."""
        data = info.data
        env = data.get("environment")
        if env == "production":
            placeholder_markers = ["placeholder", "change-in-production", "insecure", "<", ">", "secret"]
            v_lower = v.lower()
            if any(marker in v_lower for marker in placeholder_markers):
                raise ValueError(
                    "In production mode, JWT_SECRET_KEY cannot contain default or placeholder values."
                )
            if len(v) < 32:
                raise ValueError(
                    "In production mode, JWT_SECRET_KEY must be at least 32 characters long."
                )
        return v

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

    @property
    def has_mongodb_configured(self) -> bool:
        """Verify if a valid, non-placeholder MongoDB URI is provided."""
        if not self.mongodb_uri:
            return False
        uri = self.mongodb_uri.strip()
        if "<username>" in uri or "<password>" in uri or "<cluster>" in uri:
            return False
        return uri.startswith("mongodb://") or uri.startswith("mongodb+srv://")



@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
