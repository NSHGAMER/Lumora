"""Pytest configuration and fixtures for Lumora Backend."""

import os
import pytest
from fastapi.testclient import TestClient

# Ensure test environment is forced before importing settings
os.environ["LUMORA_ENV"] = "testing"
os.environ["CORS_ORIGINS"] = '["http://testserver", "http://localhost:5173"]'

from app.core.config import Settings, get_settings
from app.main import create_app


@pytest.fixture(scope="session", autouse=True)
def test_settings() -> Settings:
    """Clear settings cache and provide test settings instance."""
    get_settings.cache_clear()
    settings = get_settings()
    return settings


@pytest.fixture
def client(test_settings: Settings) -> TestClient:
    """FastAPI TestClient fixture."""
    app = create_app(test_settings)
    with TestClient(app, base_url="http://testserver") as client:
        yield client
