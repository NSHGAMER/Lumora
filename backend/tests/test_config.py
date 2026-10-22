"""Test configuration validation and security constraints."""

import pytest
import os
from pydantic import ValidationError
from app.core.config import Settings


def test_unconfigured_development_keys_are_unique(monkeypatch):
    monkeypatch.delenv('JWT_SECRET_KEY', raising=False)
    first = Settings(_env_file=None, LUMORA_ENV='development')
    second = Settings(_env_file=None, LUMORA_ENV='development')
    assert len(first.jwt_secret_key) >= 32
    assert first.jwt_secret_key != second.jwt_secret_key


def test_production_requires_an_explicit_key(monkeypatch):
    monkeypatch.delenv('JWT_SECRET_KEY', raising=False)
    with pytest.raises(ValidationError):
        Settings(_env_file=None, LUMORA_ENV='production', CORS_ORIGINS=['https://campus.example'])


def test_default_config() -> None:
    """Verify default settings instantiation."""
    settings = Settings(
        LUMORA_ENV="development",
        CORS_ORIGINS=["http://localhost:5173"],
    )
    assert settings.app_name == "Lumora Campus OS API"
    assert settings.is_development is True
    assert settings.is_production is False
    assert settings.is_testing is False
    assert settings.api_port == 8000
    assert settings.api_v1_prefix == "/api/v1"


def test_cors_origin_parsing_comma_separated() -> None:
    """Verify CORS origins string parsing from comma-separated list."""
    settings = Settings(
        LUMORA_ENV="development",
        CORS_ORIGINS="http://localhost:5173, http://127.0.0.1:3000",
    )
    assert settings.cors_origins == ["http://localhost:5173", "http://127.0.0.1:3000"]


def test_cors_origin_parsing_json_array() -> None:
    """Verify CORS origins string parsing from JSON list."""
    settings = Settings(
        LUMORA_ENV="development",
        CORS_ORIGINS='["http://localhost:5173", "http://localhost:3000"]',
    )
    assert settings.cors_origins == ["http://localhost:5173", "http://localhost:3000"]


def test_production_wildcard_cors_rejected() -> None:
    """Enforce security invariant: wildcard CORS is strictly rejected in production."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            LUMORA_ENV="production",
            CORS_ORIGINS=["*"],
        )
    assert "Wildcard CORS origins ('*') are strictly forbidden in production mode" in str(
        exc_info.value
    )


def test_production_empty_cors_rejected() -> None:
    """Enforce that production requires at least one explicit origin."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            LUMORA_ENV="production",
            CORS_ORIGINS=[],
        )
    assert "Production mode requires at least one explicit allowed origin" in str(exc_info.value)
