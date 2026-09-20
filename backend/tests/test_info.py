"""Test API root and system information endpoints."""

from fastapi.testclient import TestClient


def test_api_v1_info_endpoint(client: TestClient) -> None:
    """Verify GET /api/v1 returns structured metadata."""
    response = client.get("/api/v1")
    assert response.status_code == 200

    data = response.json()
    assert data["name"] == "Lumora Campus OS API"
    assert data["version"] == "1.0.0"
    assert data["status"] == "online"
    assert data["environment"] == "testing"
    assert data["documentation_url"] == "/docs"
    assert data["api_prefix"] == "/api/v1"


def test_root_endpoint(client: TestClient) -> None:
    """Verify GET / returns root system summary."""
    response = client.get("/")
    assert response.status_code == 200

    data = response.json()
    assert data["name"] == "Lumora Campus OS API"
    assert data["status"] == "online"
    assert data["api"] == "/api/v1"
