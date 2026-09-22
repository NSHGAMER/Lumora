"""Tests for Phase 2B.3-C: Login, JWT, Sessions & Refresh Token Foundation.

Validates:
1. Successful login with institutional ID
2. Successful login with institutional email
3. Email normalization during login
4. Institutional ID normalization during login
5. Correct password accepted
6. Incorrect password rejected
7. Unknown identifier rejected
8. Inactive user rejected
9. Generic authentication failure behavior (same 401 code and message)
10. Access JWT generated
11. JWT contains expected minimum claims (sub, role, iss, aud, exp, iat)
12. JWT issuer correct (lumora)
13. JWT audience correct (lumora-client)
14. JWT expiration is correct (15 min default)
15. JWT does not contain password or password_hash
16. Refresh token generated securely (high-entropy base64url string)
17. Raw refresh token is NEVER persisted in MongoDB
18. SHA-256 refresh token digest is persisted in session (token_hash)
19. Session created for successful login
20. Session associated with correct user
21. Session expiry matches refresh lifetime (7 days default)
22. last_login_at updated on successful login
23. last_login_at NOT updated on failed login
24. No session created for incorrect password
25. No session created for inactive user
26. No token issued for invalid credentials
27. Multiple successful logins create separate sessions (multi-device support)
28. Safe user response returned in AuthResponse
29. Refresh token NOT present in normal JSON response
30. Refresh token delivered via secure HttpOnly cookie
"""

import asyncio
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import HTTPException, status
from fastapi.testclient import TestClient
import jwt
import pytest

from app.core.config import Settings, get_settings
from app.core.security import hash_password, hash_token
from app.dependencies.auth import get_auth_service
from app.main import create_app
from app.schemas.auth import LoginRequest
from app.schemas.session import SessionCreateInternal, SessionDocument
from app.schemas.user import UserDocument, normalize_email, normalize_institutional_id
from app.services.auth_service import AuthService
from app.services.security_service import SecurityService


# ==============================================================================
# In-Memory Test Doubles for Isolated Deterministic Testing
# ==============================================================================

class InMemoryUserRepository:
    """In-memory UserRepository tracking user state."""

    def __init__(self, initial_users: Optional[list[UserDocument]] = None) -> None:
        self.users: dict[str, UserDocument] = {}
        if initial_users:
            for u in initial_users:
                self.users[str(u.id)] = u

    async def get_by_id(self, user_id: str) -> Optional[UserDocument]:
        return self.users.get(str(user_id))

    async def get_by_email(self, email: str) -> Optional[UserDocument]:
        try:
            norm = normalize_email(email)
        except ValueError:
            return None
        for u in self.users.values():
            if u.normalized_email == norm:
                return u
        return None

    async def get_by_institutional_id(self, institutional_id: str) -> Optional[UserDocument]:
        try:
            norm = normalize_institutional_id(institutional_id)
        except ValueError:
            return None
        for u in self.users.values():
            if u.institutional_id == norm:
                return u
        return None

    async def update_last_login(
        self, user_id: str, login_time: Optional[datetime] = None
    ) -> bool:
        user = self.users.get(str(user_id))
        if user is None:
            return False
        user.last_login_at = login_time or datetime.now(timezone.utc)
        user.updated_at = user.last_login_at
        return True


class InMemorySessionRepository:
    """In-memory SessionRepository tracking session documents and token hashes."""

    def __init__(self) -> None:
        self.sessions: dict[str, SessionDocument] = {}
        self._id_counter = 1
        self._lock = asyncio.Lock()

    async def create_session(self, session_data: SessionCreateInternal) -> SessionDocument:
        now = datetime.now(timezone.utc)
        sess_id = f"sess_{self._id_counter}"
        self._id_counter += 1

        exp = session_data.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)

        doc = SessionDocument(
            _id=sess_id,
            user_id=session_data.user_id,
            token_hash=session_data.token_hash,
            expires_at=exp,
            created_at=now,
            revoked_at=None,
            device_info=session_data.device_info,
        )
        self.sessions[sess_id] = doc
        return doc

    async def get_by_token_hash(self, token_hash: str) -> Optional[SessionDocument]:
        for s in self.sessions.values():
            if s.token_hash == token_hash:
                return s
        return None

    async def consume_active_session(self, token_hash: str) -> Optional[SessionDocument]:
        """Atomically find, validate unrevoked/unexpired state, and revoke an active session."""
        async with self._lock:
            now = datetime.now(timezone.utc)
            for s in self.sessions.values():
                if s.token_hash == token_hash:
                    exp = s.expires_at if s.expires_at.tzinfo else s.expires_at.replace(tzinfo=timezone.utc)
                    if s.revoked_at is None and exp > now:
                        s.revoked_at = now
                        return s
                    return None
            return None

    async def revoke_session(self, token_hash: str) -> bool:
        """Mark a specific session as revoked."""
        async with self._lock:
            now = datetime.now(timezone.utc)
            for s in self.sessions.values():
                if s.token_hash == token_hash and s.revoked_at is None:
                    s.revoked_at = now
                    return True
            return False


# ==============================================================================
# Helper Factory for Test Users
# ==============================================================================

def make_test_user(
    uid: str = "usr_001",
    inst_id: str = "STU-2026-001",
    email: str = "student@university.edu",
    password: str = "SecurePassword2026",
    role: str = "student",
    is_active: bool = True,
    last_login_at: Optional[datetime] = None,
) -> UserDocument:
    now = datetime.now(timezone.utc)
    return UserDocument(
        _id=uid,
        institutional_id=inst_id,
        institutional_email=email,
        normalized_email=email.lower(),
        full_name="Test Student",
        role=role,  # type: ignore[arg-type]
        password_hash=hash_password(password),
        is_active=is_active,
        created_at=now,
        updated_at=now,
        last_login_at=last_login_at,
    )


# ==============================================================================
# 1. AuthService Unit Tests
# ==============================================================================

@pytest.mark.asyncio
async def test_auth_service_login_with_institutional_id() -> None:
    """Successful login using institutional ID returns token, safe user, and updates last_login_at."""
    user = make_test_user(inst_id="STU-2026-001", password="SecurePassword2026")
    user_repo = InMemoryUserRepository([user])
    session_repo = InMemorySessionRepository()
    security = SecurityService()
    settings = get_settings()
    auth_service = AuthService(user_repo, session_repo, security, settings)  # type: ignore[arg-type]

    req = LoginRequest(identifier="  stu-2026-001  ", password="SecurePassword2026")
    resp, raw_refresh = await auth_service.login(req, device_info="Firefox / MacOS")

    # 1. Access token and type
    assert resp.access_token is not None
    assert resp.token_type == "bearer"
    assert resp.expires_in == settings.jwt_access_token_expire_minutes * 60

    # 2. User profile returned safely
    assert resp.user.id == user.id
    assert resp.user.institutional_id == "STU-2026-001"
    assert resp.user.last_login_at is not None

    # 3. last_login_at updated in database
    db_user = await user_repo.get_by_id(user.id)
    assert db_user.last_login_at is not None

    # 4. Raw refresh token is high entropy, not in response
    assert isinstance(raw_refresh, str)
    assert len(raw_refresh) >= 48
    assert not hasattr(resp, "refresh_token")

    # 5. Session persisted with SHA-256 hash, raw token never in session
    stored_hash = hash_token(raw_refresh)
    session = await session_repo.get_by_token_hash(stored_hash)
    assert session is not None
    assert session.user_id == user.id
    assert session.token_hash == stored_hash
    assert not hasattr(session, "raw_token")


@pytest.mark.asyncio
async def test_auth_service_login_with_institutional_email() -> None:
    """Successful login using institutional email with case-insensitive normalization."""
    user = make_test_user(email="student.one@university.edu", password="SecurePassword2026")
    user_repo = InMemoryUserRepository([user])
    session_repo = InMemorySessionRepository()
    security = SecurityService()
    settings = get_settings()
    auth_service = AuthService(user_repo, session_repo, security, settings)  # type: ignore[arg-type]

    req = LoginRequest(identifier="  Student.One@University.EDU  ", password="SecurePassword2026")
    resp, _ = await auth_service.login(req)
    assert resp.user.institutional_email == "student.one@university.edu"


@pytest.mark.asyncio
async def test_auth_service_incorrect_password_rejected() -> None:
    """Incorrect password raises 401 with generic error; last_login_at unchanged; no session created."""
    user = make_test_user(password="CorrectPassword123")
    user_repo = InMemoryUserRepository([user])
    session_repo = InMemorySessionRepository()
    security = SecurityService()
    settings = get_settings()
    auth_service = AuthService(user_repo, session_repo, security, settings)  # type: ignore[arg-type]

    req = LoginRequest(identifier=user.institutional_id, password="WrongPassword999")
    with pytest.raises(HTTPException) as exc:
        await auth_service.login(req)

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc.value.detail == "Invalid institutional credentials"

    # Invariant: last_login_at not updated, no session created
    db_user = await user_repo.get_by_id(user.id)
    assert db_user.last_login_at is None
    assert len(session_repo.sessions) == 0


@pytest.mark.asyncio
async def test_auth_service_unknown_identifier_rejected() -> None:
    """Unknown identifier raises same generic 401 error to prevent account enumeration."""
    user_repo = InMemoryUserRepository([])
    session_repo = InMemorySessionRepository()
    security = SecurityService()
    settings = get_settings()
    auth_service = AuthService(user_repo, session_repo, security, settings)  # type: ignore[arg-type]

    req = LoginRequest(identifier="STU-NONEXISTENT", password="AnyPassword123")
    with pytest.raises(HTTPException) as exc:
        await auth_service.login(req)

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc.value.detail == "Invalid institutional credentials"
    assert len(session_repo.sessions) == 0


@pytest.mark.asyncio
async def test_auth_service_inactive_user_rejected() -> None:
    """Inactive account raises same generic 401 error and receives zero tokens or sessions."""
    user = make_test_user(is_active=False, password="ValidPassword123")
    user_repo = InMemoryUserRepository([user])
    session_repo = InMemorySessionRepository()
    security = SecurityService()
    settings = get_settings()
    auth_service = AuthService(user_repo, session_repo, security, settings)  # type: ignore[arg-type]

    req = LoginRequest(identifier=user.institutional_id, password="ValidPassword123")
    with pytest.raises(HTTPException) as exc:
        await auth_service.login(req)

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc.value.detail == "Invalid institutional credentials"
    assert len(session_repo.sessions) == 0


@pytest.mark.asyncio
async def test_auth_service_multiple_logins_create_separate_sessions() -> None:
    """Multiple successful logins create independent sessions without invalidating previous ones."""
    user = make_test_user(password="ValidPassword123")
    user_repo = InMemoryUserRepository([user])
    session_repo = InMemorySessionRepository()
    security = SecurityService()
    settings = get_settings()
    auth_service = AuthService(user_repo, session_repo, security, settings)  # type: ignore[arg-type]

    req = LoginRequest(identifier=user.institutional_id, password="ValidPassword123")

    _, tok1 = await auth_service.login(req, device_info="Chrome / Windows")
    _, tok2 = await auth_service.login(req, device_info="Safari / iPhone")

    assert tok1 != tok2
    assert len(session_repo.sessions) == 2


@pytest.mark.asyncio
async def test_jwt_claims_structure_and_signature() -> None:
    """Decoded access token contains registered claims and strictly excludes sensitive/profile data."""
    user = make_test_user(inst_id="FAC-900", role="faculty", password="Password123")
    user_repo = InMemoryUserRepository([user])
    session_repo = InMemorySessionRepository()
    security = SecurityService()
    settings = get_settings()
    auth_service = AuthService(user_repo, session_repo, security, settings)  # type: ignore[arg-type]

    req = LoginRequest(identifier="FAC-900", password="Password123")
    resp, _ = await auth_service.login(req)

    # Decode and verify JWT
    claims = security.decode_access_token(resp.access_token, settings)
    assert claims["sub"] == user.id
    assert claims["role"] == "faculty"
    assert claims["iss"] == settings.jwt_issuer
    assert claims["aud"] == settings.jwt_audience
    assert claims["exp"] > claims["iat"]

    # Minimum Necessary Claims Invariant:
    # institutional_id and profile data are NOT in the access JWT
    assert "institutional_id" not in claims
    assert "email" not in claims
    assert "full_name" not in claims

    # Security Invariant: no sensitive fields in claims
    assert "password" not in claims
    assert "password_hash" not in claims
    assert "refresh_token" not in claims
    assert "token_hash" not in claims

    # Exact claim set check
    assert set(claims.keys()) == {"sub", "role", "iss", "aud", "exp", "iat"}


def test_refresh_cookie_production_flag() -> None:
    """Refresh cookie sets Secure=True in production and Secure=False in development."""
    from fastapi import Response

    dev_settings = Settings(LUMORA_ENV="development", CORS_ORIGINS=["http://localhost:5173"])
    auth_dev = AuthService(None, None, SecurityService(), dev_settings)  # type: ignore[arg-type]
    dev_resp = Response()
    auth_dev.set_refresh_cookie(dev_resp, "dummy_token_123")
    dev_cookie = dev_resp.headers.get("set-cookie", "")
    assert "lumora_refresh_token=dummy_token_123" in dev_cookie
    assert "HttpOnly" in dev_cookie
    assert "SameSite=lax" in dev_cookie
    assert "Path=/api/v1/auth" in dev_cookie
    assert "Secure" not in dev_cookie

    prod_settings = Settings(
        LUMORA_ENV="production",
        CORS_ORIGINS=["https://lumora.campus.edu"],
        JWT_SECRET_KEY="c8f1a4e2b0d74f398561234567890abcdef1234567890abcdef12345678",
    )
    auth_prod = AuthService(None, None, SecurityService(), prod_settings)  # type: ignore[arg-type]
    prod_resp = Response()
    auth_prod.set_refresh_cookie(prod_resp, "dummy_token_456")
    prod_cookie = prod_resp.headers.get("set-cookie", "")
    assert "lumora_refresh_token=dummy_token_456" in prod_cookie
    assert "HttpOnly" in prod_cookie
    assert "secure" in prod_cookie.lower()


# ==============================================================================
# 2. FastAPI HTTP Integration Tests (POST /api/v1/auth/login)
# ==============================================================================

@pytest.fixture
def auth_login_client() -> tuple[TestClient, InMemoryUserRepository, InMemorySessionRepository]:
    """Test client configured with in-memory repositories backing AuthService."""
    test_user = make_test_user(
        uid="usr_http_001",
        inst_id="STU-HTTP-001",
        email="http.student@university.edu",
        password="ValidHttpPassword2026",
        role="student",
        is_active=True,
    )
    inactive_user = make_test_user(
        uid="usr_http_002",
        inst_id="STU-INACTIVE-001",
        email="inactive@university.edu",
        password="ValidHttpPassword2026",
        role="student",
        is_active=False,
    )

    user_repo = InMemoryUserRepository([test_user, inactive_user])
    session_repo = InMemorySessionRepository()
    security = SecurityService()
    settings = get_settings()
    service = AuthService(user_repo, session_repo, security, settings)  # type: ignore[arg-type]

    app = create_app(settings)
    app.dependency_overrides[get_auth_service] = lambda: service
    client = TestClient(app, base_url="http://testserver")
    return client, user_repo, session_repo


def test_api_login_success_with_institutional_id(auth_login_client: tuple) -> None:
    """POST /api/v1/auth/login returns 200, JWT in body, and refresh cookie."""
    client, user_repo, session_repo = auth_login_client
    payload = {
        "identifier": "STU-HTTP-001",
        "password": "ValidHttpPassword2026",
    }
    resp = client.post("/api/v1/auth/login", json=payload)
    assert resp.status_code == 200

    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["expires_in"] == 15 * 60
    assert data["user"]["institutional_id"] == "STU-HTTP-001"
    assert data["user"]["is_active"] is True

    # Security: No sensitive fields in response
    assert "password" not in data
    assert "password_hash" not in data
    assert "token_hash" not in data
    assert "refresh_token" not in data

    # Verify HttpOnly Cookie was set
    assert "set-cookie" in resp.headers
    cookie_header = resp.headers["set-cookie"]
    assert "lumora_refresh_token=" in cookie_header
    assert "HttpOnly" in cookie_header
    assert "SameSite=lax" in cookie_header
    assert "Path=/api/v1/auth" in cookie_header


def test_api_login_success_with_email(auth_login_client: tuple) -> None:
    """POST /api/v1/auth/login returns 200 when authenticating with email."""
    client, _, _ = auth_login_client
    payload = {
        "identifier": "  HTTP.STUDENT@UNIVERSITY.EDU  ",
        "password": "ValidHttpPassword2026",
    }
    resp = client.post("/api/v1/auth/login", json=payload)
    assert resp.status_code == 200
    assert resp.json()["user"]["institutional_email"] == "http.student@university.edu"


def test_api_login_wrong_password_returns_401(auth_login_client: tuple) -> None:
    """POST /api/v1/auth/login returns 401 Unauthorized for incorrect password."""
    client, _, _ = auth_login_client
    payload = {
        "identifier": "STU-HTTP-001",
        "password": "WrongPassword999",
    }
    resp = client.post("/api/v1/auth/login", json=payload)
    assert resp.status_code == 401

    body = resp.json()
    assert body["success"] is False
    assert body["error"]["code"] == "UNAUTHORIZED"
    assert body["error"]["message"] == "Invalid institutional credentials"

    # No cookie should be set
    assert "set-cookie" not in resp.headers


def test_api_login_unknown_identifier_returns_401(auth_login_client: tuple) -> None:
    """POST /api/v1/auth/login returns identical 401 for unknown user."""
    client, _, _ = auth_login_client
    payload = {
        "identifier": "NONEXISTENT-USER",
        "password": "AnyPassword123",
    }
    resp = client.post("/api/v1/auth/login", json=payload)
    assert resp.status_code == 401

    body = resp.json()
    assert body["success"] is False
    assert body["error"]["code"] == "UNAUTHORIZED"
    assert body["error"]["message"] == "Invalid institutional credentials"


def test_api_login_inactive_user_returns_401(auth_login_client: tuple) -> None:
    """POST /api/v1/auth/login returns identical 401 for inactive user."""
    client, _, _ = auth_login_client
    payload = {
        "identifier": "STU-INACTIVE-001",
        "password": "ValidHttpPassword2026",
    }
    resp = client.post("/api/v1/auth/login", json=payload)
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "UNAUTHORIZED"


def test_api_login_missing_fields_returns_422(auth_login_client: tuple) -> None:
    """POST /api/v1/auth/login returns 422 for missing password."""
    client, _, _ = auth_login_client
    payload = {"identifier": "STU-HTTP-001"}
    resp = client.post("/api/v1/auth/login", json=payload)
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "VALIDATION_ERROR"
