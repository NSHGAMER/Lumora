"""Comprehensive tests for Phase 2B.4: Backend Authorization & Current User Foundation.

Validates:
1. GET /api/v1/auth/me authentication and response contract:
   - Missing Authorization header returns HTTP 401
   - Malformed Authorization header returns HTTP 401
   - Wrong authentication scheme (e.g. Basic, Token) returns HTTP 401
   - Invalid / garbage JWT returns HTTP 401
   - Expired access JWT returns HTTP 401
   - Invalid issuer returns HTTP 401
   - Invalid audience returns HTTP 401
   - Missing 'sub' claim returns HTTP 401
   - Nonexistent user ID returns HTTP 401
   - Inactive / deactivated user returns HTTP 401
   - Valid authenticated user returns HTTP 200
   - Response matches UserResponse schema; excludes password_hash and secrets
2. Reusable get_current_user and get_current_active_user dependency contracts
3. Reusable role authorization dependencies (require_role, require_roles):
   - All 5 canonical roles: student, faculty, admin, management, staff
   - Authorized role succeeds with HTTP 200
   - Unauthorized role receives HTTP 403 Forbidden
   - Unauthenticated request receives HTTP 401 Unauthorized
   - Multi-role dependencies (require_roles("admin", "management")) allow permitted roles and reject others
   - Backend database record is authoritative: forged JWT role claim cannot elevate privileges
   - RoleChecker rejects invalid/unrecognized canonical roles on construction
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, status
from fastapi.testclient import TestClient
import jwt
import pytest

from app.core.config import Settings, get_settings
from app.core.security import create_access_token, hash_password
from app.dependencies.auth import (
    RoleChecker,
    get_current_active_user,
    get_current_user,
    require_role,
    require_roles,
)
from app.dependencies.database import get_user_repository
from app.main import create_app
from app.schemas.user import UserDocument, UserResponse, normalize_email, normalize_institutional_id


# ==============================================================================
# In-Memory Test User Repository
# ==============================================================================

class InMemoryUserRepository:
    """In-memory UserRepository for deterministic, database-free testing."""

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


# ==============================================================================
# Test Fixtures
# ==============================================================================

@pytest.fixture
def now_utc() -> datetime:
    return datetime.now(timezone.utc)


@pytest.fixture
def test_users(now_utc: datetime) -> dict[str, UserDocument]:
    """Provide a dictionary of users representing all 5 canonical roles plus an inactive user."""
    pw_hash = hash_password("ValidPassword123!")
    return {
        "student": UserDocument(
            _id="usr_student_1",
            institutional_id="STU-2026-001",
            institutional_email="student@lumora.edu",
            normalized_email="student@lumora.edu",
            full_name="Alice Student",
            role="student",
            password_hash=pw_hash,
            is_active=True,
            created_at=now_utc,
            updated_at=now_utc,
        ),
        "faculty": UserDocument(
            _id="usr_faculty_1",
            institutional_id="FAC-2026-001",
            institutional_email="faculty@lumora.edu",
            normalized_email="faculty@lumora.edu",
            full_name="Dr. Bob Faculty",
            role="faculty",
            password_hash=pw_hash,
            is_active=True,
            created_at=now_utc,
            updated_at=now_utc,
        ),
        "admin": UserDocument(
            _id="usr_admin_1",
            institutional_id="ADM-2026-001",
            institutional_email="admin@lumora.edu",
            normalized_email="admin@lumora.edu",
            full_name="Carol Administrator",
            role="admin",
            password_hash=pw_hash,
            is_active=True,
            created_at=now_utc,
            updated_at=now_utc,
        ),
        "management": UserDocument(
            _id="usr_mgmt_1",
            institutional_id="MGT-2026-001",
            institutional_email="mgmt@lumora.edu",
            normalized_email="mgmt@lumora.edu",
            full_name="Dave Management",
            role="management",
            password_hash=pw_hash,
            is_active=True,
            created_at=now_utc,
            updated_at=now_utc,
        ),
        "staff": UserDocument(
            _id="usr_staff_1",
            institutional_id="STF-2026-001",
            institutional_email="staff@lumora.edu",
            normalized_email="staff@lumora.edu",
            full_name="Eve Staff",
            role="staff",
            password_hash=pw_hash,
            is_active=True,
            created_at=now_utc,
            updated_at=now_utc,
        ),
        "inactive": UserDocument(
            _id="usr_inactive_1",
            institutional_id="STU-2026-099",
            institutional_email="inactive@lumora.edu",
            normalized_email="inactive@lumora.edu",
            full_name="Deactivated User",
            role="student",
            password_hash=pw_hash,
            is_active=False,
            created_at=now_utc,
            updated_at=now_utc,
        ),
    }


@pytest.fixture
def auth_client(test_users: dict[str, UserDocument], test_settings: Settings) -> TestClient:
    """Create test client with isolated InMemoryUserRepository and RBAC test routes."""
    user_repo = InMemoryUserRepository(initial_users=list(test_users.values()))
    app = create_app(test_settings)
    app.dependency_overrides[get_user_repository] = lambda: user_repo

    # Mount minimal internal test routes to verify RBAC dependencies
    test_router = APIRouter(prefix="/api/v1/test", tags=["Test Protected"])

    @test_router.get("/student-only")
    async def student_endpoint(user: UserDocument = Depends(require_role("student"))):
        return {"access": "granted", "role": user.role}

    @test_router.get("/faculty-only")
    async def faculty_endpoint(user: UserDocument = Depends(require_role("faculty"))):
        return {"access": "granted", "role": user.role}

    @test_router.get("/admin-only")
    async def admin_endpoint(user: UserDocument = Depends(require_role("admin"))):
        return {"access": "granted", "role": user.role}

    @test_router.get("/management-only")
    async def management_endpoint(user: UserDocument = Depends(require_role("management"))):
        return {"access": "granted", "role": user.role}

    @test_router.get("/staff-only")
    async def staff_endpoint(user: UserDocument = Depends(require_role("staff"))):
        return {"access": "granted", "role": user.role}

    @test_router.get("/admin-or-management")
    async def admin_or_management_endpoint(
        user: UserDocument = Depends(require_roles("admin", "management"))
    ):
        return {"access": "granted", "role": user.role}

    @test_router.get("/active-user-alias")
    async def active_user_endpoint(user: UserDocument = Depends(get_current_active_user)):
        return {"active": user.is_active, "id": user.id}

    app.include_router(test_router)

    with TestClient(app, base_url="http://testserver") as client:
        yield client


# ==============================================================================
# Helper to Generate Tokens for Tests
# ==============================================================================

def make_token(
    user_id: str,
    role: str,
    settings: Settings,
    expires_delta: Optional[timedelta] = None,
    issuer: Optional[str] = None,
    audience: Optional[str] = None,
    custom_claims: Optional[dict] = None,
) -> str:
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta if expires_delta is not None else timedelta(minutes=15))
    payload = {
        "sub": str(user_id),
        "role": str(role),
        "iss": issuer or settings.jwt_issuer,
        "aud": audience or settings.jwt_audience,
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
    }
    if custom_claims:
        payload.update(custom_claims)
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


# ==============================================================================
# PART A & B: GET /api/v1/auth/me & get_current_user Tests
# ==============================================================================

def test_auth_me_missing_authorization_header(auth_client: TestClient) -> None:
    """Verify HTTP 401 when Authorization header is absent."""
    resp = auth_client.get("/api/v1/auth/me")
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED
    data = resp.json()
    assert data["success"] is False
    assert data["error"]["code"] == "UNAUTHORIZED"
    assert "Bearer token required" in data["error"]["message"]


def test_auth_me_malformed_authorization_header(auth_client: TestClient) -> None:
    """Verify HTTP 401 when Authorization header does not contain exactly two parts."""
    resp = auth_client.get("/api/v1/auth/me", headers={"Authorization": "Bearer"})
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    resp2 = auth_client.get("/api/v1/auth/me", headers={"Authorization": "Bearer token extra"})
    assert resp2.status_code == status.HTTP_401_UNAUTHORIZED


def test_auth_me_wrong_authentication_scheme(auth_client: TestClient) -> None:
    """Verify HTTP 401 when Authorization scheme is not Bearer."""
    resp = auth_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Basic dXNlcm5hbWU6cGFzc3dvcmQ="},
    )
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Invalid authentication scheme" in resp.json()["error"]["message"]


def test_auth_me_invalid_jwt_signature(auth_client: TestClient) -> None:
    """Verify HTTP 401 when token signature is corrupt or invalid."""
    resp = auth_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.jwt.signature_here"},
    )
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Invalid or malformed access token" in resp.json()["error"]["message"]


def test_auth_me_expired_jwt(auth_client: TestClient, test_settings: Settings) -> None:
    """Verify HTTP 401 when access token has expired."""
    expired_token = make_token(
        user_id="usr_student_1",
        role="student",
        settings=test_settings,
        expires_delta=timedelta(seconds=-10),
    )
    resp = auth_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Access token has expired" in resp.json()["error"]["message"]


def test_auth_me_invalid_issuer(auth_client: TestClient, test_settings: Settings) -> None:
    """Verify HTTP 401 when issuer claim does not match configuration."""
    bad_iss_token = make_token(
        user_id="usr_student_1",
        role="student",
        settings=test_settings,
        issuer="untrusted-external-issuer",
    )
    resp = auth_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {bad_iss_token}"},
    )
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Invalid or malformed access token" in resp.json()["error"]["message"]


def test_auth_me_invalid_audience(auth_client: TestClient, test_settings: Settings) -> None:
    """Verify HTTP 401 when audience claim does not match configuration."""
    bad_aud_token = make_token(
        user_id="usr_student_1",
        role="student",
        settings=test_settings,
        audience="wrong-audience",
    )
    resp = auth_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {bad_aud_token}"},
    )
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Invalid or malformed access token" in resp.json()["error"]["message"]


def test_auth_me_missing_sub_claim(auth_client: TestClient, test_settings: Settings) -> None:
    """Verify HTTP 401 when token lacks a 'sub' claim."""
    now = datetime.now(timezone.utc)
    payload = {
        "role": "student",
        "iss": test_settings.jwt_issuer,
        "aud": test_settings.jwt_audience,
        "exp": int((now + timedelta(minutes=10)).timestamp()),
        "iat": int(now.timestamp()),
    }
    no_sub_token = jwt.encode(payload, test_settings.jwt_secret_key, algorithm=test_settings.jwt_algorithm)

    resp = auth_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {no_sub_token}"},
    )
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED


def test_auth_me_nonexistent_user(auth_client: TestClient, test_settings: Settings) -> None:
    """Verify HTTP 401 when 'sub' refers to an ID that does not exist in the database."""
    token = make_token(
        user_id="usr_nonexistent_9999",
        role="student",
        settings=test_settings,
    )
    resp = auth_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Authenticated user no longer exists" in resp.json()["error"]["message"]


def test_auth_me_inactive_user(auth_client: TestClient, test_settings: Settings) -> None:
    """Verify HTTP 401 when authenticated user account has is_active=False."""
    token = make_token(
        user_id="usr_inactive_1",
        role="student",
        settings=test_settings,
    )
    resp = auth_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED
    assert "User account is deactivated" in resp.json()["error"]["message"]


def test_auth_me_success_student(
    auth_client: TestClient,
    test_users: dict[str, UserDocument],
    test_settings: Settings,
) -> None:
    """Verify successful profile retrieval for authenticated student."""
    user = test_users["student"]
    token = create_access_token(subject=str(user.id), role=user.role, settings=test_settings)

    resp = auth_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()

    # Validate returned fields match UserResponse contract
    assert data["id"] == str(user.id)
    assert data["institutional_id"] == "STU-2026-001"
    assert data["institutional_email"] == "student@lumora.edu"
    assert data["full_name"] == "Alice Student"
    assert data["role"] == "student"
    assert data["is_active"] is True

    # SECURITY INVARIANTS: Exclude passwords, hashes, tokens, database internals
    assert "password" not in data
    assert "password_hash" not in data
    assert "normalized_email" not in data
    assert "refresh_token" not in data
    assert "token_hash" not in data


def test_auth_me_success_faculty(
    auth_client: TestClient,
    test_users: dict[str, UserDocument],
    test_settings: Settings,
) -> None:
    """Verify successful profile retrieval for authenticated faculty."""
    user = test_users["faculty"]
    token = create_access_token(subject=str(user.id), role=user.role, settings=test_settings)

    resp = auth_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert data["id"] == str(user.id)
    assert data["role"] == "faculty"
    assert data["full_name"] == "Dr. Bob Faculty"


def test_active_user_alias_dependency(
    auth_client: TestClient,
    test_users: dict[str, UserDocument],
    test_settings: Settings,
) -> None:
    """Verify get_current_active_user alias dependency functions identically."""
    user = test_users["student"]
    token = create_access_token(subject=str(user.id), role=user.role, settings=test_settings)

    resp = auth_client.get(
        "/api/v1/test/active-user-alias",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert data["active"] is True
    assert data["id"] == str(user.id)


# ==============================================================================
# PART C: Role Authorization (require_role, require_roles) Tests
# ==============================================================================

@pytest.mark.parametrize(
    "role_key,endpoint",
    [
        ("student", "/api/v1/test/student-only"),
        ("faculty", "/api/v1/test/faculty-only"),
        ("admin", "/api/v1/test/admin-only"),
        ("management", "/api/v1/test/management-only"),
        ("staff", "/api/v1/test/staff-only"),
    ],
)
def test_all_five_canonical_roles_authorized(
    auth_client: TestClient,
    test_users: dict[str, UserDocument],
    test_settings: Settings,
    role_key: str,
    endpoint: str,
) -> None:
    """Verify each of the 5 canonical roles successfully accesses its permitted endpoint."""
    user = test_users[role_key]
    token = create_access_token(subject=str(user.id), role=user.role, settings=test_settings)

    resp = auth_client.get(endpoint, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json() == {"access": "granted", "role": role_key}


@pytest.mark.parametrize(
    "user_role_key,endpoint",
    [
        ("student", "/api/v1/test/faculty-only"),
        ("student", "/api/v1/test/admin-only"),
        ("student", "/api/v1/test/management-only"),
        ("student", "/api/v1/test/staff-only"),
        ("faculty", "/api/v1/test/student-only"),
        ("faculty", "/api/v1/test/admin-only"),
        ("staff", "/api/v1/test/admin-only"),
        ("management", "/api/v1/test/staff-only"),
    ],
)
def test_unauthorized_role_receives_403(
    auth_client: TestClient,
    test_users: dict[str, UserDocument],
    test_settings: Settings,
    user_role_key: str,
    endpoint: str,
) -> None:
    """Verify that authenticated users with unauthorized roles receive HTTP 403 Forbidden."""
    user = test_users[user_role_key]
    token = create_access_token(subject=str(user.id), role=user.role, settings=test_settings)

    resp = auth_client.get(endpoint, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == status.HTTP_403_FORBIDDEN
    data = resp.json()
    assert data["success"] is False
    assert data["error"]["code"] == "ACCESS_FORBIDDEN"
    assert "insufficient role permissions" in data["error"]["message"]


def test_unauthenticated_request_to_protected_role_endpoint_returns_401(
    auth_client: TestClient,
) -> None:
    """Verify that unauthenticated requests to role-protected endpoints fail with HTTP 401, not 403."""
    endpoints = [
        "/api/v1/test/student-only",
        "/api/v1/test/faculty-only",
        "/api/v1/test/admin-only",
        "/api/v1/test/management-only",
        "/api/v1/test/staff-only",
        "/api/v1/test/admin-or-management",
    ]
    for ep in endpoints:
        resp = auth_client.get(ep)
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED
        assert resp.json()["error"]["code"] == "UNAUTHORIZED"


def test_multi_role_dependency_allowed_roles(
    auth_client: TestClient,
    test_users: dict[str, UserDocument],
    test_settings: Settings,
) -> None:
    """Verify require_roles("admin", "management") allows both admin and management roles."""
    for role_key in ["admin", "management"]:
        user = test_users[role_key]
        token = create_access_token(subject=str(user.id), role=user.role, settings=test_settings)
        resp = auth_client.get(
            "/api/v1/test/admin-or-management",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"access": "granted", "role": role_key}


def test_multi_role_dependency_rejected_roles(
    auth_client: TestClient,
    test_users: dict[str, UserDocument],
    test_settings: Settings,
) -> None:
    """Verify require_roles("admin", "management") rejects student, faculty, and staff."""
    for role_key in ["student", "faculty", "staff"]:
        user = test_users[role_key]
        token = create_access_token(subject=str(user.id), role=user.role, settings=test_settings)
        resp = auth_client.get(
            "/api/v1/test/admin-or-management",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == status.HTTP_403_FORBIDDEN


def test_backend_database_role_is_authoritative_prevents_jwt_role_spoofing(
    auth_client: TestClient,
    test_users: dict[str, UserDocument],
    test_settings: Settings,
) -> None:
    """Verify that if a JWT claims 'role: admin' but the user document in MongoDB has 'role: student',
    the backend enforces the database role and rejects the request with HTTP 403 Forbidden.
    """
    student_user = test_users["student"]
    assert student_user.role == "student"

    # Forged JWT claiming 'role: admin' for a student's user ID
    spoofed_token = make_token(
        user_id=str(student_user.id),
        role="admin",  # Forged claim in token
        settings=test_settings,
    )

    # Attempting to access admin-only endpoint
    resp = auth_client.get(
        "/api/v1/test/admin-only",
        headers={"Authorization": f"Bearer {spoofed_token}"},
    )

    # Must be rejected based on the database user document
    assert resp.status_code == status.HTTP_403_FORBIDDEN
    assert "insufficient role permissions" in resp.json()["error"]["message"]


def test_role_checker_rejects_invalid_canonical_role() -> None:
    """Verify RoleChecker raises ValueError if configured with a non-canonical role."""
    with pytest.raises(ValueError, match="Invalid canonical role"):
        RoleChecker(allowed_roles={"superadmin", "guest"})
