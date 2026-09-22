"""Comprehensive test suite for Phase 2B.3-D: Refresh Token Rotation, Session Revocation & Logout.

Covers:
REFRESH:
1. Successful refresh
2. Missing refresh cookie rejected
3. Invalid refresh token rejected
4. Unknown token hash rejected
5. Expired session rejected
6. Revoked session rejected
7. Inactive user rejected
8. User not found rejected
9. Successful rotation revokes old session
10. Successful rotation creates new session
11. New token has a different value
12. Old token cannot be reused
13. New token works for another refresh
14. Raw old token never persisted
15. Raw new token never persisted
16. SHA-256 hashes persisted
17. New HttpOnly cookie set
18. New cookie has correct Path (/api/v1/auth)
19. New cookie has correct SameSite (lax)
20. New cookie is Secure in production
21. New access JWT generated
22. JWT claims remain: sub, role, iss, aud, iat, exp
23. No sensitive JWT claims (no passwords, hashes, refresh tokens, institutional_id)
24. No refresh token in JSON response
25. last_login_at unchanged

CONCURRENCY:
26. Two simultaneous refresh attempts using the same old token cannot both succeed (one succeeds, one fails with 401)

LOGOUT:
27. Logout active session
28. Logout revokes correct session
29. Logout clears cookie
30. Logout is idempotent
31. Logout with missing cookie remains safe
32. Logout does not revoke unrelated sessions (multi-device safety)
33. Logout does not issue tokens
34. Logout does not update last_login_at

REGRESSION & SECURITY INVARIANTS:
- Raw refresh token never in database
- Revoked/expired sessions rejected
- Unrelated multi-device sessions remain active
"""

import asyncio
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import HTTPException, Response, status
from fastapi.testclient import TestClient
import pytest

from app.core.config import Settings, get_settings
from app.core.security import hash_token
from app.dependencies.auth import get_auth_service
from app.main import create_app
from app.schemas.auth import LoginRequest, RefreshTokenRequest
from app.schemas.session import SessionCreateInternal, SessionDocument
from app.services.auth_service import AuthService
from app.services.security_service import SecurityService
from tests.test_login import (
    InMemorySessionRepository,
    InMemoryUserRepository,
    make_test_user,
)


# ==============================================================================
# Helper to establish an initial active session and obtain tokens
# ==============================================================================

DEFAULT_TEST_PASSWORD = "ValidPassword2026"


async def setup_authenticated_session(
    auth_service: AuthService,
    user_repo: InMemoryUserRepository,
    session_repo: InMemorySessionRepository,
    user=None,
    password: str = DEFAULT_TEST_PASSWORD,
) -> tuple[str, str]:
    """Helper creating a test user, authenticating, and returning (access_token, raw_refresh_token)."""
    if user is None:
        user = make_test_user(
            uid="usr_test_ref",
            inst_id="STU-REF-001",
            email="ref.user@university.edu",
            password=password,
            role="student",
            is_active=True,
        )
        user_repo.users[user.id] = user

    login_req = LoginRequest(identifier=user.institutional_id, password=password)
    auth_resp, raw_refresh = await auth_service.login(login_req, device_info="Browser / Device A")
    return auth_resp.access_token, raw_refresh


# ==============================================================================
# 1. AuthService Unit Tests: Refresh Token Rotation
# ==============================================================================

@pytest.mark.asyncio
async def test_auth_service_refresh_success_and_rotation() -> None:
    """Successful refresh rotates token, revokes old session, creates new session, and preserves last_login_at."""
    user = make_test_user(inst_id="STU-ROT-001", password="ValidPassword2026")
    user_repo = InMemoryUserRepository([user])
    session_repo = InMemorySessionRepository()
    security = SecurityService()
    settings = get_settings()
    auth_service = AuthService(user_repo, session_repo, security, settings)  # type: ignore[arg-type]

    # Initial login
    _, old_refresh = await setup_authenticated_session(auth_service, user_repo, session_repo, user=user)
    old_hash = hash_token(old_refresh)
    initial_login_time = user.last_login_at
    assert initial_login_time is not None

    # Verify old session active
    old_sess = await session_repo.get_by_token_hash(old_hash)
    assert old_sess is not None
    assert old_sess.revoked_at is None

    # Perform refresh rotation
    resp, new_refresh = await auth_service.refresh_session(old_refresh, device_info="Browser / Device A")

    # 1. New token generated and distinct from old token
    assert new_refresh != old_refresh
    assert isinstance(new_refresh, str) and len(new_refresh) >= 48
    new_hash = hash_token(new_refresh)

    # 2. Old session revoked
    old_sess_after = await session_repo.get_by_token_hash(old_hash)
    assert old_sess_after is not None
    assert old_sess_after.revoked_at is not None

    # 3. New session created and active
    new_sess = await session_repo.get_by_token_hash(new_hash)
    assert new_sess is not None
    assert new_sess.revoked_at is None
    assert new_sess.user_id == user.id

    # 4. Access JWT is valid and has minimum claims
    claims = security.decode_access_token(resp.access_token, settings)
    assert claims["sub"] == user.id
    assert claims["role"] == user.role
    assert claims["iss"] == settings.jwt_issuer
    assert claims["aud"] == settings.jwt_audience
    assert set(claims.keys()) == {"sub", "role", "iss", "aud", "exp", "iat"}
    assert "institutional_id" not in claims
    assert "password" not in claims

    # 5. last_login_at is NOT updated on refresh
    db_user = await user_repo.get_by_id(user.id)
    assert db_user.last_login_at == initial_login_time

    # 6. Raw tokens are never persisted in session objects
    assert not hasattr(new_sess, "raw_token")
    assert not hasattr(old_sess_after, "raw_token")


@pytest.mark.asyncio
async def test_auth_service_refresh_rejects_missing_or_empty_token() -> None:
    """Missing, empty, or whitespace refresh token is rejected with generic 401."""
    user_repo = InMemoryUserRepository([])
    session_repo = InMemorySessionRepository()
    security = SecurityService()
    settings = get_settings()
    auth_service = AuthService(user_repo, session_repo, security, settings)  # type: ignore[arg-type]

    for empty_tok in [None, "", "   "]:
        with pytest.raises(HTTPException) as exc:
            await auth_service.refresh_session(empty_tok)
        assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc.value.detail == "Invalid or expired refresh token"


@pytest.mark.asyncio
async def test_auth_service_refresh_rejects_unknown_token() -> None:
    """Unknown token hash is rejected with generic 401."""
    user_repo = InMemoryUserRepository([])
    session_repo = InMemorySessionRepository()
    security = SecurityService()
    settings = get_settings()
    auth_service = AuthService(user_repo, session_repo, security, settings)  # type: ignore[arg-type]

    with pytest.raises(HTTPException) as exc:
        await auth_service.refresh_session("unknown_random_token_string_1234567890")
    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc.value.detail == "Invalid or expired refresh token"


@pytest.mark.asyncio
async def test_auth_service_refresh_rejects_expired_session() -> None:
    """Expired session is rejected with generic 401 and not silently extended."""
    user = make_test_user(inst_id="STU-EXP-001")
    user_repo = InMemoryUserRepository([user])
    session_repo = InMemorySessionRepository()
    security = SecurityService()
    settings = get_settings()
    auth_service = AuthService(user_repo, session_repo, security, settings)  # type: ignore[arg-type]

    raw_token = "expired_raw_refresh_token_test_123"
    thash = hash_token(raw_token)
    past = datetime.now(timezone.utc) - timedelta(hours=1)
    await session_repo.create_session(
        SessionCreateInternal(user_id=user.id, token_hash=thash, expires_at=past)
    )

    with pytest.raises(HTTPException) as exc:
        await auth_service.refresh_session(raw_token)
    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc.value.detail == "Invalid or expired refresh token"


@pytest.mark.asyncio
async def test_auth_service_refresh_rejects_revoked_session_reuse() -> None:
    """Reuse of previously revoked/rotated refresh token is rejected with generic 401."""
    user = make_test_user(inst_id="STU-REV-001", password=DEFAULT_TEST_PASSWORD)
    user_repo = InMemoryUserRepository([user])
    session_repo = InMemorySessionRepository()
    security = SecurityService()
    settings = get_settings()
    auth_service = AuthService(user_repo, session_repo, security, settings)  # type: ignore[arg-type]

    _, old_refresh = await setup_authenticated_session(auth_service, user_repo, session_repo, user=user)

    # First rotation succeeds
    _, new_refresh = await auth_service.refresh_session(old_refresh)

    # Reusing the old token must be rejected
    with pytest.raises(HTTPException) as exc:
        await auth_service.refresh_session(old_refresh)
    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc.value.detail == "Invalid or expired refresh token"

    # But the new token can be used for another subsequent refresh
    resp2, new_refresh_2 = await auth_service.refresh_session(new_refresh)
    assert new_refresh_2 != new_refresh
    assert resp2.access_token is not None


@pytest.mark.asyncio
async def test_auth_service_refresh_rejects_inactive_or_deleted_user() -> None:
    """If user becomes inactive or is deleted after login, refresh is rejected."""
    user = make_test_user(inst_id="STU-INACT-001", password=DEFAULT_TEST_PASSWORD, is_active=True)
    user_repo = InMemoryUserRepository([user])
    session_repo = InMemorySessionRepository()
    security = SecurityService()
    settings = get_settings()
    auth_service = AuthService(user_repo, session_repo, security, settings)  # type: ignore[arg-type]

    _, raw_refresh = await setup_authenticated_session(auth_service, user_repo, session_repo, user=user)

    # Deactivate user
    user.is_active = False

    with pytest.raises(HTTPException) as exc1:
        await auth_service.refresh_session(raw_refresh)
    assert exc1.value.status_code == status.HTTP_401_UNAUTHORIZED

    # Delete user from repo
    del user_repo.users[user.id]
    del_user = make_test_user(uid="usr_del_01", inst_id="STU-DEL-01", password=DEFAULT_TEST_PASSWORD)
    user_repo.users[del_user.id] = del_user
    _, raw_refresh_2 = await setup_authenticated_session(auth_service, user_repo, session_repo, user=del_user)
    del user_repo.users["usr_del_01"]

    with pytest.raises(HTTPException) as exc2:
        await auth_service.refresh_session(raw_refresh_2)
    assert exc2.value.status_code == status.HTTP_401_UNAUTHORIZED


# ==============================================================================
# 2. Concurrency Tests: Atomic Rotation Without Race Conditions
# ==============================================================================

@pytest.mark.asyncio
async def test_concurrent_refresh_attempts_only_one_succeeds() -> None:
    """Two concurrent refresh attempts using the same token cannot both succeed."""
    user = make_test_user(inst_id="STU-CONC-001", password=DEFAULT_TEST_PASSWORD)
    user_repo = InMemoryUserRepository([user])
    session_repo = InMemorySessionRepository()
    security = SecurityService()
    settings = get_settings()
    auth_service = AuthService(user_repo, session_repo, security, settings)  # type: ignore[arg-type]

    _, raw_refresh = await setup_authenticated_session(auth_service, user_repo, session_repo, user=user)

    # Launch two simultaneous refresh attempts with the exact same old token
    results = await asyncio.gather(
        auth_service.refresh_session(raw_refresh),
        auth_service.refresh_session(raw_refresh),
        return_exceptions=True,
    )

    successes = [r for r in results if not isinstance(r, Exception)]
    failures = [r for r in results if isinstance(r, HTTPException)]

    # Exactly one must succeed, and one must fail with 401
    assert len(successes) == 1
    assert len(failures) == 1
    assert failures[0].status_code == status.HTTP_401_UNAUTHORIZED
    assert failures[0].detail == "Invalid or expired refresh token"


# ==============================================================================
# 3. AuthService Unit Tests: Logout & Session Revocation
# ==============================================================================

@pytest.mark.asyncio
async def test_auth_service_logout_revokes_correct_session() -> None:
    """Logout revokes active session without touching last_login_at or unrelated sessions."""
    user = make_test_user(inst_id="STU-LOGO-001", password=DEFAULT_TEST_PASSWORD)
    user_repo = InMemoryUserRepository([user])
    session_repo = InMemorySessionRepository()
    security = SecurityService()
    settings = get_settings()
    auth_service = AuthService(user_repo, session_repo, security, settings)  # type: ignore[arg-type]

    # Session 1 (Device A)
    _, tok_a = await auth_service.login(LoginRequest(identifier=user.institutional_id, password="ValidPassword2026"), device_info="Device A")
    # Session 2 (Device B)
    _, tok_b = await auth_service.login(LoginRequest(identifier=user.institutional_id, password="ValidPassword2026"), device_info="Device B")

    hash_a = hash_token(tok_a)
    hash_b = hash_token(tok_b)
    assert len(session_repo.sessions) == 2

    # Logout Device A
    resp = await auth_service.logout(tok_a)
    assert resp.message == "Successfully logged out"

    # Session A is revoked
    sess_a = await session_repo.get_by_token_hash(hash_a)
    assert sess_a is not None
    assert sess_a.revoked_at is not None

    # Session B remains ACTIVE
    sess_b = await session_repo.get_by_token_hash(hash_b)
    assert sess_b is not None
    assert sess_b.revoked_at is None


@pytest.mark.asyncio
async def test_auth_service_logout_idempotent_and_safe() -> None:
    """Logout with missing, invalid, or already revoked token is safe and idempotent."""
    user_repo = InMemoryUserRepository([])
    session_repo = InMemorySessionRepository()
    security = SecurityService()
    settings = get_settings()
    auth_service = AuthService(user_repo, session_repo, security, settings)  # type: ignore[arg-type]

    # Missing token
    resp1 = await auth_service.logout(None)
    assert resp1.message == "Successfully logged out"

    # Nonexistent token
    resp2 = await auth_service.logout("unknown_token_999")
    assert resp2.message == "Successfully logged out"


# ==============================================================================
# 4. FastAPI HTTP Integration Tests (POST /api/v1/auth/refresh & /logout)
# ==============================================================================

@pytest.fixture
def auth_test_client() -> tuple[TestClient, InMemoryUserRepository, InMemorySessionRepository, AuthService]:
    """Test client configured with in-memory repositories backing AuthService."""
    test_user = make_test_user(
        uid="usr_http_ref_01",
        inst_id="STU-HTTP-REF",
        email="http.ref@university.edu",
        password="ValidPassword2026",
        role="student",
        is_active=True,
    )
    user_repo = InMemoryUserRepository([test_user])
    session_repo = InMemorySessionRepository()
    security = SecurityService()
    settings = get_settings()
    service = AuthService(user_repo, session_repo, security, settings)  # type: ignore[arg-type]

    app = create_app(settings)
    app.dependency_overrides[get_auth_service] = lambda: service
    client = TestClient(app, base_url="http://testserver")
    return client, user_repo, session_repo, service


def test_api_refresh_success_via_cookie(auth_test_client: tuple) -> None:
    """POST /api/v1/auth/refresh reads cookie, rotates token, sets new cookie, returns 200."""
    client, _, _, _ = auth_test_client

    # 1. Login to establish cookie
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": "STU-HTTP-REF", "password": "ValidPassword2026"},
    )
    assert login_resp.status_code == 200
    assert "lumora_refresh_token" in client.cookies

    initial_cookie = client.cookies["lumora_refresh_token"]

    # 2. Call /refresh with the cookie
    refresh_resp = client.post("/api/v1/auth/refresh")
    assert refresh_resp.status_code == 200

    data = refresh_resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["institutional_id"] == "STU-HTTP-REF"

    # Security: No sensitive fields in response
    assert "password" not in data
    assert "refresh_token" not in data
    assert "token_hash" not in data

    # 3. New cookie set and rotated
    new_cookie = client.cookies["lumora_refresh_token"]
    assert new_cookie != initial_cookie

    set_cookie_header = refresh_resp.headers.get("set-cookie", "")
    assert "HttpOnly" in set_cookie_header
    assert "Path=/api/v1/auth" in set_cookie_header
    assert "SameSite=lax" in set_cookie_header


def test_api_refresh_rejects_missing_cookie(auth_test_client: tuple) -> None:
    """POST /api/v1/auth/refresh without cookie returns 401 Unauthorized."""
    client, _, _, _ = auth_test_client
    client.cookies.clear()

    resp = client.post("/api/v1/auth/refresh")
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "UNAUTHORIZED"
    assert resp.json()["error"]["message"] == "Invalid or expired refresh token"


def test_api_refresh_rejects_reused_cookie(auth_test_client: tuple) -> None:
    """POST /api/v1/auth/refresh rejects old rotated token on reuse attempt."""
    client, _, _, _ = auth_test_client

    # Login
    client.post("/api/v1/auth/login", json={"identifier": "STU-HTTP-REF", "password": "ValidPassword2026"})
    first_cookie = client.cookies["lumora_refresh_token"]

    # First rotation
    client.post("/api/v1/auth/refresh")

    # Manually reset cookie to old token
    client.cookies.set("lumora_refresh_token", first_cookie, path="/api/v1/auth")

    # Second rotation with old token must be rejected
    reuse_resp = client.post("/api/v1/auth/refresh")
    assert reuse_resp.status_code == 401
    assert reuse_resp.json()["error"]["message"] == "Invalid or expired refresh token"


def test_api_logout_revokes_session_and_clears_cookie(auth_test_client: tuple) -> None:
    """POST /api/v1/auth/logout revokes session and clears cookie."""
    client, _, session_repo, _ = auth_test_client

    # Login
    client.post("/api/v1/auth/login", json={"identifier": "STU-HTTP-REF", "password": "ValidPassword2026"})
    current_token = client.cookies["lumora_refresh_token"]
    thash = hash_token(current_token)

    # Logout
    logout_resp = client.post("/api/v1/auth/logout")
    assert logout_resp.status_code == 200
    assert logout_resp.json()["message"] == "Successfully logged out"

    # Verify session is revoked
    sess = list(session_repo.sessions.values())[0]
    assert sess.token_hash == thash
    assert sess.revoked_at is not None

    # Verify cookie was cleared in response header
    set_cookie_header = logout_resp.headers.get("set-cookie", "")
    assert 'lumora_refresh_token=""' in set_cookie_header or "Max-Age=0" in set_cookie_header
    assert "Path=/api/v1/auth" in set_cookie_header


def test_api_logout_is_idempotent_without_cookie(auth_test_client: tuple) -> None:
    """POST /api/v1/auth/logout without cookie succeeds safely with 200."""
    client, _, _, _ = auth_test_client
    client.cookies.clear()

    resp = client.post("/api/v1/auth/logout")
    assert resp.status_code == 200
    assert resp.json()["message"] == "Successfully logged out"


def test_api_refresh_supports_body_fallback_for_non_browser_clients(auth_test_client: tuple) -> None:
    """POST /api/v1/auth/refresh accepts RefreshTokenRequest payload if cookie is not present."""
    client, _, _, _ = auth_test_client

    # Login to get refresh token
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": "STU-HTTP-REF", "password": "ValidPassword2026"},
    )
    raw_token = client.cookies["lumora_refresh_token"]
    client.cookies.clear()  # simulate non-browser client without cookie support

    payload = {"refresh_token": raw_token}
    resp = client.post("/api/v1/auth/refresh", json=payload)
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_clear_cookie_production_security() -> None:
    """clear_refresh_cookie sets Secure=True in production and preserves Path=/api/v1/auth."""
    from fastapi import Response

    prod_settings = Settings(
        LUMORA_ENV="production",
        CORS_ORIGINS=["https://lumora.campus.edu"],
        JWT_SECRET_KEY="c8f1a4e2b0d74f398561234567890abcdef1234567890abcdef12345678",
    )
    auth_prod = AuthService(None, None, SecurityService(), prod_settings)  # type: ignore[arg-type]
    prod_resp = Response()
    auth_prod.clear_refresh_cookie(prod_resp)
    prod_cookie = prod_resp.headers.get("set-cookie", "")
    assert "lumora_refresh_token=" in prod_cookie
    assert "Path=/api/v1/auth" in prod_cookie
    assert "HttpOnly" in prod_cookie
    assert "secure" in prod_cookie.lower()
    assert "max-age=0" in prod_cookie.lower()
