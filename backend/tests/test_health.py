"""Test health endpoint functionality and response structure."""

from datetime import datetime
from fastapi.testclient import TestClient


def test_health_check_status_code(client: TestClient) -> None:
    """Verify GET /api/v1/health returns HTTP 200."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200


def test_health_check_payload_structure(client: TestClient) -> None:
    """Verify health check response conforms to HealthResponse schema."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert data["environment"] == "testing"
    assert data["version"] == "1.0.0"
    assert "timestamp" in data
    # Verify timestamp is valid ISO format
    parsed_dt = datetime.fromisoformat(data["timestamp"])
    assert parsed_dt is not None
    assert data["services"] == {"api": "operational"}
