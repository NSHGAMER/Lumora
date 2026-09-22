"""Tests for Phase 2B.3-B: Registration Backend.

Validates:
1. Successful student registration (HTTP 201)
2. Successful faculty registration (HTTP 201)
3. Account is immediately active (is_active=True)
4. institutional_id is normalized (uppercase, stripped, collapsed)
5. email is normalized (lowercase, stripped)
6. Password stored strictly as Argon2id hash ($argon2id$)
7. Plaintext password is NEVER stored in database document
8. password_hash is strictly NOT returned in UserResponse
9. Public registration succeeds for 'student'
10. Public registration succeeds for 'faculty'
11. Admin public registration rejected (HTTP 403 Forbidden)
12. Management public registration rejected (HTTP 403 Forbidden)
13. Staff public registration rejected (HTTP 403 Forbidden)
14. Duplicate institutional ID rejected (HTTP 409 Conflict)
15. Duplicate email rejected (HTTP 409 Conflict)
16. DuplicateKeyError race condition handled safely (HTTP 409 Conflict)
17. Invalid password rejected (HTTP 422 - policy violation)
18. Invalid/unknown role rejected (HTTP 422 - canonical role violation)
19. Response does not contain password
20. Response does not contain password_hash
21. Response does not contain refresh token
22. Registration does not create a session
23. Registration does not issue JWT
24. last_login_at remains unset/null
25. created_at and updated_at are populated
"""

from datetime import datetime, timezone
from typing import Optional
from unittest.mock import AsyncMock, MagicMock
from fastapi import FastAPI, HTTPException, status
from fastapi.testclient import TestClient
import pytest
from pymongo.errors import DuplicateKeyError

from app.core.config import get_settings
from app.dependencies.auth import get_registration_service
from app.main import create_app
from app.repositories.user_repository import UserRepository
from app.schemas.auth import RegisterRequest
from app.schemas.user import (
    PUBLIC_REGISTRATION_ROLES,
    UserCreateInternal,
    UserDocument,
    UserResponse,
)
from app.services.registration_service import RegistrationService
from app.services.security_service import SecurityService


# ==============================================================================
# In-Memory Test Doubles for Isolated Deterministic Testing
# ==============================================================================

class InMemoryUserRepository:
    """In-memory UserRepository test double tracking stored documents."""

    def __init__(self) -> None:
        self.users: dict[str, UserDocument] = {}
        self._id_counter = 1

    async def get_by_id(self, user_id: str) -> Optional[UserDocument]:
        return self.users.get(user_id)

    async def get_by_email(self, email: str) -> Optional[UserDocument]:
        norm = email.strip().lower()
        for u in self.users.values():
            if u.normalized_email == norm:
                return u
        return None

    async def get_by_institutional_id(self, institutional_id: str) -> Optional[UserDocument]:
        norm = " ".join(institutional_id.strip().split()).upper()
        for u in self.users.values():
            if u.institutional_id == norm:
                return u
        return None

    async def create_user(self, user_data: UserCreateInternal) -> UserDocument:
        norm_email = user_data.institutional_email.strip().lower()
        norm_id = " ".join(user_data.institutional_id.strip().split()).upper()

        # Check for simulated duplicate key violation
        for u in self.users.values():
            if u.institutional_id == norm_id:
                raise DuplicateKeyError("E11000 duplicate key error: institutional_id")
            if u.normalized_email == norm_email:
                raise DuplicateKeyError("E11000 duplicate key error: normalized_email")

        now = datetime.now(timezone.utc)
        uid = f"usr_{self._id_counter}"
        self._id_counter += 1

        doc = UserDocument(
            _id=uid,
            institutional_id=norm_id,
            institutional_email=user_data.institutional_email.strip(),
            normalized_email=norm_email,
            full_name=user_data.full_name.strip(),
            role=user_data.role,
            password_hash=user_data.password_hash,
            is_active=user_data.is_active,
            created_at=now,
            updated_at=now,
            last_login_at=None,
        )
        self.users[uid] = doc
        return doc


# ==============================================================================
# 1. RegistrationService Unit Tests
# ==============================================================================

@pytest.mark.asyncio
async def test_successful_student_registration_service() -> None:
    """Student registration succeeds with normalized fields and immediate activation."""
    repo = InMemoryUserRepository()
    security = SecurityService()
    service = RegistrationService(user_repository=repo, security_service=security)  # type: ignore[arg-type]

    req = RegisterRequest(
        institutional_id="  stu-2026-001  ",
        institutional_email="  Student.One@University.edu  ",
        full_name="Student One",
        password="SecureP@ssw0rd2026",
        role="student",
    )

    resp = await service.register(req)

    # 1. Response validity
    assert isinstance(resp, UserResponse)
    assert resp.institutional_id == "STU-2026-001"
    assert resp.institutional_email == "student.one@university.edu"
    assert resp.role == "student"
    assert resp.is_active is True
    assert resp.last_login_at is None
    assert resp.created_at is not None
    assert resp.updated_at is not None

    # 2. Database state inspection
    stored = await repo.get_by_id(resp.id)
    assert stored is not None
    assert stored.institutional_id == "STU-2026-001"
    assert stored.normalized_email == "student.one@university.edu"
    assert stored.password_hash.startswith("$argon2id$")
    assert stored.password_hash != "SecureP@ssw0rd2026"
    assert not hasattr(stored, "password")


@pytest.mark.asyncio
async def test_successful_faculty_registration_service() -> None:
    """Faculty registration succeeds with normalized fields."""
    repo = InMemoryUserRepository()
    security = SecurityService()
    service = RegistrationService(user_repository=repo, security_service=security)  # type: ignore[arg-type]

    req = RegisterRequest(
        institutional_id="FAC-2026-042",
        institutional_email="professor.smith@university.edu",
        full_name="Prof. Smith",
        password="FacultySecurePassword123",
        role="faculty",
    )

    resp = await service.register(req)
    assert resp.role == "faculty"
    assert resp.is_active is True


@pytest.mark.asyncio
@pytest.mark.parametrize("privileged_role", ["admin", "management", "staff"])
async def test_privileged_roles_rejected_in_service(privileged_role: str) -> None:
    """Public self-registration for privileged roles is forbidden (HTTP 403)."""
    repo = InMemoryUserRepository()
    security = SecurityService()
    service = RegistrationService(user_repository=repo, security_service=security)  # type: ignore[arg-type]

    req = RegisterRequest(
        institutional_id="PRIV-001",
        institutional_email="priv@university.edu",
        full_name="Privileged User",
        password="ValidPassword123",
        role=privileged_role,  # type: ignore[arg-type]
    )

    with pytest.raises(HTTPException) as exc_info:
        await service.register(req)

    assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN
    assert "Public self-registration is restricted" in str(exc_info.value.detail)


@pytest.mark.asyncio
async def test_duplicate_institutional_id_rejected_in_service() -> None:
    """Duplicate institutional identifier returns 409 Conflict."""
    repo = InMemoryUserRepository()
    security = SecurityService()
    service = RegistrationService(user_repository=repo, security_service=security)  # type: ignore[arg-type]

    req1 = RegisterRequest(
        institutional_id="STU-DUPLICATE-01",
        institutional_email="first@university.edu",
        full_name="First User",
        password="ValidPassword123",
        role="student",
    )
    await service.register(req1)

    req2 = RegisterRequest(
        institutional_id="stu-duplicate-01",  # Same after normalization
        institutional_email="second@university.edu",
        full_name="Second User",
        password="ValidPassword123",
        role="student",
    )

    with pytest.raises(HTTPException) as exc_info:
        await service.register(req2)

    assert exc_info.value.status_code == status.HTTP_409_CONFLICT
    assert "institutional identifier is already registered" in str(exc_info.value.detail)


@pytest.mark.asyncio
async def test_duplicate_email_rejected_in_service() -> None:
    """Duplicate email returns 409 Conflict."""
    repo = InMemoryUserRepository()
    security = SecurityService()
    service = RegistrationService(user_repository=repo, security_service=security)  # type: ignore[arg-type]

    req1 = RegisterRequest(
        institutional_id="STU-001",
        institutional_email="shared@university.edu",
        full_name="First User",
        password="ValidPassword123",
        role="student",
    )
    await service.register(req1)

    req2 = RegisterRequest(
        institutional_id="STU-002",
        institutional_email="  SHARED@university.edu  ",  # Same after normalization
        full_name="Second User",
        password="ValidPassword123",
        role="student",
    )

    with pytest.raises(HTTPException) as exc_info:
        await service.register(req2)

    assert exc_info.value.status_code == status.HTTP_409_CONFLICT
    assert "institutional email is already registered" in str(exc_info.value.detail)


@pytest.mark.asyncio
async def test_duplicate_key_race_condition_handled() -> None:
    """Simulated MongoDB DuplicateKeyError race condition returns safe 409 Conflict."""
    mock_repo = MagicMock()
    mock_repo.get_by_institutional_id = AsyncMock(return_value=None)
    mock_repo.get_by_email = AsyncMock(return_value=None)
    mock_repo.create_user = AsyncMock(
        side_effect=DuplicateKeyError("E11000 duplicate key error collection: lumora.users index: idx_users_institutional_id_unique")
    )

    security = SecurityService()
    service = RegistrationService(user_repository=mock_repo, security_service=security)

    req = RegisterRequest(
        institutional_id="STU-RACE-001",
        institutional_email="race@university.edu",
        full_name="Race User",
        password="ValidPassword123",
        role="student",
    )

    with pytest.raises(HTTPException) as exc_info:
        await service.register(req)

    assert exc_info.value.status_code == status.HTTP_409_CONFLICT
    assert "institutional identifier is already registered" in str(exc_info.value.detail)


# ==============================================================================
# 2. FastAPI HTTP Endpoint Integration Tests
# ==============================================================================

@pytest.fixture
def auth_test_client() -> TestClient:
    """Test client with in-memory UserRepository backing RegistrationService."""
    settings = get_settings()
    app = create_app(settings)
    repo = InMemoryUserRepository()
    security = SecurityService()
    service = RegistrationService(user_repository=repo, security_service=security)  # type: ignore[arg-type]

    app.dependency_overrides[get_registration_service] = lambda: service
    client = TestClient(app, base_url="http://testserver")
    return client


def test_api_register_student_success(auth_test_client: TestClient) -> None:
    """POST /api/v1/auth/register returns 201 and safe UserResponse for valid student."""
    payload = {
        "institutional_id": "STU-API-2026",
        "institutional_email": "api.student@university.edu",
        "full_name": "API Student",
        "password": "ValidCampusPassword2026",
        "role": "student",
    }
    resp = auth_test_client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 201

    data = resp.json()
    assert data["institutional_id"] == "STU-API-2026"
    assert data["institutional_email"] == "api.student@university.edu"
    assert data["full_name"] == "API Student"
    assert data["role"] == "student"
    assert data["is_active"] is True
    assert data["last_login_at"] is None
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data

    # Security invariants: No sensitive fields in response
    assert "password" not in data
    assert "password_hash" not in data
    assert "token_hash" not in data
    assert "access_token" not in data
    assert "refresh_token" not in data

    # No session cookie issued
    assert "set-cookie" not in resp.headers


def test_api_register_faculty_success(auth_test_client: TestClient) -> None:
    """POST /api/v1/auth/register returns 201 for faculty registration."""
    payload = {
        "institutional_id": "FAC-API-2026",
        "institutional_email": "api.faculty@university.edu",
        "full_name": "API Faculty",
        "password": "ValidFacultyPassword2026",
        "role": "faculty",
    }
    resp = auth_test_client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 201
    assert resp.json()["role"] == "faculty"


@pytest.mark.parametrize("privileged_role", ["admin", "management", "staff"])
def test_api_register_privileged_roles_forbidden(
    auth_test_client: TestClient, privileged_role: str
) -> None:
    """POST /api/v1/auth/register returns 403 Forbidden for privileged roles."""
    payload = {
        "institutional_id": f"PRIV-{privileged_role.upper()}",
        "institutional_email": f"{privileged_role}@university.edu",
        "full_name": "Privileged Staff",
        "password": "ValidSecurePassword123",
        "role": privileged_role,
    }
    resp = auth_test_client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 403

    body = resp.json()
    assert body["success"] is False
    assert body["error"]["code"] == "ACCESS_FORBIDDEN"
    assert "restricted" in body["error"]["message"].lower()


def test_api_register_duplicate_institutional_id_conflict(auth_test_client: TestClient) -> None:
    """POST /api/v1/auth/register returns 409 Conflict on duplicate institutional ID."""
    payload1 = {
        "institutional_id": "STU-DUP-ID",
        "institutional_email": "user1@university.edu",
        "full_name": "User One",
        "password": "ValidPassword123",
        "role": "student",
    }
    r1 = auth_test_client.post("/api/v1/auth/register", json=payload1)
    assert r1.status_code == 201

    payload2 = {
        "institutional_id": "stu-dup-id",  # case-insensitive match
        "institutional_email": "user2@university.edu",
        "full_name": "User Two",
        "password": "ValidPassword123",
        "role": "student",
    }
    r2 = auth_test_client.post("/api/v1/auth/register", json=payload2)
    assert r2.status_code == 409
    body = r2.json()
    assert body["success"] is False
    assert body["error"]["code"] == "RESOURCE_CONFLICT"
    assert "institutional identifier" in body["error"]["message"].lower()


def test_api_register_duplicate_email_conflict(auth_test_client: TestClient) -> None:
    """POST /api/v1/auth/register returns 409 Conflict on duplicate email."""
    payload1 = {
        "institutional_id": "STU-DUP-EMAIL-1",
        "institutional_email": "duplicate@university.edu",
        "full_name": "User One",
        "password": "ValidPassword123",
        "role": "student",
    }
    r1 = auth_test_client.post("/api/v1/auth/register", json=payload1)
    assert r1.status_code == 201

    payload2 = {
        "institutional_id": "STU-DUP-EMAIL-2",
        "institutional_email": "  DUPLICATE@university.edu  ",
        "full_name": "User Two",
        "password": "ValidPassword123",
        "role": "student",
    }
    r2 = auth_test_client.post("/api/v1/auth/register", json=payload2)
    assert r2.status_code == 409
    body = r2.json()
    assert body["success"] is False
    assert body["error"]["code"] == "RESOURCE_CONFLICT"
    assert "institutional email" in body["error"]["message"].lower()


def test_api_register_invalid_password_rejected(auth_test_client: TestClient) -> None:
    """POST /api/v1/auth/register returns 422 for password shorter than policy minimum (8)."""
    payload = {
        "institutional_id": "STU-POLICY-01",
        "institutional_email": "policy@university.edu",
        "full_name": "Short Password User",
        "password": "short",
        "role": "student",
    }
    resp = auth_test_client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 422
    body = resp.json()
    assert body["success"] is False
    assert body["error"]["code"] == "VALIDATION_ERROR"


def test_api_register_invalid_role_rejected(auth_test_client: TestClient) -> None:
    """POST /api/v1/auth/register returns 422 for non-canonical role."""
    payload = {
        "institutional_id": "STU-ROLE-01",
        "institutional_email": "role@university.edu",
        "full_name": "Invalid Role User",
        "password": "ValidPassword123",
        "role": "superadmin",
    }
    resp = auth_test_client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 422
    body = resp.json()
    assert body["success"] is False
    assert body["error"]["code"] == "VALIDATION_ERROR"


def test_api_register_missing_required_field(auth_test_client: TestClient) -> None:
    """POST /api/v1/auth/register returns 422 when password is missing."""
    payload = {
        "institutional_id": "STU-MISSING-01",
        "institutional_email": "missing@university.edu",
        "full_name": "Missing Field User",
        "role": "student",
    }
    resp = auth_test_client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 422
    body = resp.json()
    assert body["success"] is False
    assert body["error"]["code"] == "VALIDATION_ERROR"
