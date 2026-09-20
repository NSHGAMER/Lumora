"""Test structured error responses and exception handlers."""

from fastapi.testclient import TestClient


def test_404_structured_error_response(client: TestClient) -> None:
    """Verify 404 response conforms to standard ErrorResponse envelope (RULE 11)."""
    response = client.get("/api/v1/non-existent-endpoint")
    assert response.status_code == 404

    data = response.json()
    assert data["success"] is False
    assert "error" in data
    assert data["error"]["code"] == "RESOURCE_NOT_FOUND"
    assert "message" in data["error"]
