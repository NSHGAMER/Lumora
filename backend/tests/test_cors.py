"""Test CORS middleware behavior and headers."""

from fastapi.testclient import TestClient


def test_cors_allowed_origin_headers(client: TestClient) -> None:
    """Verify that allowed origins receive appropriate CORS headers."""
    response = client.get(
        "/api/v1/health",
        headers={"Origin": "http://localhost:5173"},
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert response.headers.get("access-control-allow-credentials") == "true"


def test_cors_preflight_options_request(client: TestClient) -> None:
    """Verify preflight OPTIONS request returns valid CORS headers."""
    response = client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert "GET" in response.headers.get("access-control-allow-methods", "")


def test_cors_disallowed_origin(client: TestClient) -> None:
    """Verify disallowed origins do not receive access-control-allow-origin header."""
    response = client.get(
        "/api/v1/health",
        headers={"Origin": "http://malicious-external-site.com"},
    )
    assert response.status_code == 200
    assert "access-control-allow-origin" not in response.headers
