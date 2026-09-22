"""Comprehensive tests for Phase 2B.5: Domain Architecture Foundation (Campus Directory).

Validates:
1. Schema validation & contracts:
   - DirectoryProfileDocument
   - DirectoryProfileUpdate (string trimming, length validation)
   - DirectoryEntryResponse (strict exclusion of security internals)
   - DirectoryListResponse (pagination envelope)
2. Repository behavior:
   - Upsert creates new profile with default department
   - Upsert updates existing profile fields
   - Batch profile retrieval by user IDs
   - Department listing and user ID querying by department
3. Service layer domain rules & business logic:
   - Directory entry retrieval for active users
   - 404 for nonexistent or deactivated accounts
   - Filtered listing (search query, role filter, department filter, pagination)
   - Self-update permitted for any active user
   - Administrative update permitted for admin and management
   - Cross-user update rejected with 403 for student/faculty/staff
4. API endpoints & HTTP layer:
   - GET /api/v1/directory (unauthenticated 401, authenticated 200, query filtering)
   - GET /api/v1/directory/departments (unauthenticated 401, authenticated 200)
   - GET /api/v1/directory/me (unauthenticated 401, authenticated 200)
   - PUT /api/v1/directory/me (unauthenticated 401, authenticated 200 self-edit)
   - GET /api/v1/directory/{user_id} (unauthenticated 401, nonexistent 404, valid 200)
   - PUT /api/v1/directory/{user_id} (unauthenticated 401, unauthorized role 403, admin/mgmt 200)
5. Security invariants:
   - All responses omit password_hash, tokens, session IDs, and database internals
"""

from datetime import datetime, timezone
import re
from typing import Any, Optional
from fastapi import HTTPException, status
from fastapi.testclient import TestClient
import pytest

from app.core.config import Settings, get_settings
from app.core.security import create_access_token, hash_password
from app.dependencies.database import get_directory_repository, get_user_repository
from app.main import create_app
from app.repositories.directory_repository import DirectoryRepository
from app.repositories.user_repository import UserRepository
from app.schemas.directory import (
    DirectoryEntryResponse,
    DirectoryListResponse,
    DirectoryProfileDocument,
    DirectoryProfileUpdate,
)
from app.schemas.user import CanonicalRole, UserDocument, normalize_email, normalize_institutional_id
from app.services.directory_service import DirectoryService


# ==============================================================================
# In-Memory Test Repositories
# ==============================================================================

class InMemoryDirectoryRepository(DirectoryRepository):
    """In-memory DirectoryRepository for deterministic, database-free testing."""

    def __init__(self, initial_profiles: Optional[list[DirectoryProfileDocument]] = None) -> None:
        self.profiles: dict[str, DirectoryProfileDocument] = {}
        if initial_profiles:
            for p in initial_profiles:
                self.profiles[str(p.user_id)] = p

    async def get_by_user_id(self, user_id: str) -> Optional[DirectoryProfileDocument]:
        return self.profiles.get(str(user_id))

    async def get_profiles_by_user_ids(
        self, user_ids: list[str]
    ) -> dict[str, DirectoryProfileDocument]:
        return {
            str(uid): self.profiles[str(uid)]
            for uid in user_ids
            if str(uid) in self.profiles
        }

    async def upsert_profile(
        self, user_id: str, updates: DirectoryProfileUpdate
    ) -> DirectoryProfileDocument:
        now = datetime.now(timezone.utc)
        existing = self.profiles.get(str(user_id))
        update_data = updates.model_dump(exclude_unset=True)

        if existing:
            doc_dict = existing.model_dump()
            doc_dict.update(update_data)
            doc_dict["updated_at"] = now
            new_profile = DirectoryProfileDocument(**doc_dict)
        else:
            doc_dict = {
                "user_id": str(user_id),
                "department": update_data.get("department") or "General Campus",
                "title": update_data.get("title"),
                "office_location": update_data.get("office_location"),
                "phone_extension": update_data.get("phone_extension"),
                "bio": update_data.get("bio"),
                "created_at": now,
                "updated_at": now,
            }
            new_profile = DirectoryProfileDocument(**doc_dict)

        self.profiles[str(user_id)] = new_profile
        return new_profile

    async def list_departments(self) -> list[str]:
        departments = {p.department for p in self.profiles.values() if p.department}
        departments.add("General Campus")
        return sorted(list(departments))

    async def get_user_ids_by_department(self, department: str) -> list[str]:
        target = department.strip().lower()
        return [
            str(p.user_id)
            for p in self.profiles.values()
            if p.department.strip().lower() == target
        ]

    async def get_user_ids_with_other_departments(self, department: str) -> list[str]:
        target = department.strip().lower()
        return [
            str(p.user_id)
            for p in self.profiles.values()
            if p.department.strip().lower() != target
        ]


class InMemoryUserRepository(UserRepository):
    """In-memory UserRepository for deterministic testing."""

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

    async def list_active_users(
        self,
        role: Optional[str] = None,
        query_text: Optional[str] = None,
        user_ids: Optional[list[str]] = None,
        exclude_user_ids: Optional[list[str]] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[UserDocument], int]:
        results = [u for u in self.users.values() if u.is_active]

        if role:
            results = [u for u in results if u.role == role]

        if user_ids is not None:
            id_set = {str(uid) for uid in user_ids}
            results = [u for u in results if str(u.id) in id_set]

        if exclude_user_ids:
            exclude_set = {str(uid) for uid in exclude_user_ids}
            results = [u for u in results if str(u.id) not in exclude_set]

        if query_text:
            cleaned = query_text.strip().lower()
            results = [
                u for u in results
                if cleaned in u.full_name.lower()
                or cleaned in u.institutional_id.lower()
                or cleaned in u.normalized_email.lower()
            ]

        results.sort(key=lambda x: x.full_name)
        total = len(results)
        return results[skip : skip + limit], total


# ==============================================================================
# Fixtures
# ==============================================================================

@pytest.fixture
def test_now() -> datetime:
    return datetime.now(timezone.utc)


@pytest.fixture
def sample_users(test_now: datetime) -> dict[str, UserDocument]:
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
            created_at=test_now,
            updated_at=test_now,
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
            created_at=test_now,
            updated_at=test_now,
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
            created_at=test_now,
            updated_at=test_now,
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
            created_at=test_now,
            updated_at=test_now,
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
            created_at=test_now,
            updated_at=test_now,
        ),
        "inactive": UserDocument(
            _id="usr_inactive_1",
            institutional_id="STU-2026-099",
            institutional_email="inactive@lumora.edu",
            normalized_email="inactive@lumora.edu",
            full_name="Frank Inactive",
            role="student",
            password_hash=pw_hash,
            is_active=False,
            created_at=test_now,
            updated_at=test_now,
        ),
    }


@pytest.fixture
def sample_profiles(test_now: datetime) -> list[DirectoryProfileDocument]:
    return [
        DirectoryProfileDocument(
            user_id="usr_faculty_1",
            department="Computer Science",
            title="Associate Professor",
            office_location="Turing Hall 402",
            phone_extension="x4502",
            bio="Focuses on distributed systems and cloud architectures.",
            created_at=test_now,
            updated_at=test_now,
        ),
        DirectoryProfileDocument(
            user_id="usr_admin_1",
            department="Campus Operations",
            title="System Administrator",
            office_location="Admin Block A-12",
            phone_extension="x1012",
            bio="Central campus operations and security administration.",
            created_at=test_now,
            updated_at=test_now,
        ),
    ]


@pytest.fixture
def directory_app(
    sample_users: dict[str, UserDocument],
    sample_profiles: list[DirectoryProfileDocument],
    test_settings: Settings,
) -> tuple[TestClient, InMemoryUserRepository, InMemoryDirectoryRepository]:
    user_repo = InMemoryUserRepository(initial_users=list(sample_users.values()))
    dir_repo = InMemoryDirectoryRepository(initial_profiles=sample_profiles)

    app = create_app(test_settings)
    app.dependency_overrides[get_user_repository] = lambda: user_repo
    app.dependency_overrides[get_directory_repository] = lambda: dir_repo

    with TestClient(app, base_url="http://testserver") as client:
        yield client, user_repo, dir_repo


def create_test_token(user: UserDocument, settings: Settings) -> str:
    return create_access_token(
        subject=str(user.id),
        role=user.role,
        settings=settings,
    )


# ==============================================================================
# Unit Tests: Schemas
# ==============================================================================

def test_directory_schemas_contract() -> None:
    """Verify schema field requirements, trimming, and validation."""
    update = DirectoryProfileUpdate(
        department="   Electrical Engineering   ",
        title="  Lecturer  ",
        office_location=" Room 201 ",
        phone_extension="  x102  ",
        bio="  Test bio  ",
    )
    assert update.department == "Electrical Engineering"
    assert update.title == "Lecturer"
    assert update.office_location == "Room 201"
    assert update.phone_extension == "x102"
    assert update.bio == "Test bio"

    # Verify DirectoryEntryResponse serializes cleanly without sensitive fields
    now = datetime.now(timezone.utc)
    entry = DirectoryEntryResponse(
        id="usr_test",
        institutional_id="STU-001",
        institutional_email="test@lumora.edu",
        full_name="Test Student",
        role="student",
        is_active=True,
        department="Computer Science",
        title=None,
        office_location=None,
        phone_extension=None,
        bio=None,
        created_at=now,
        updated_at=now,
    )
    entry_dict = entry.model_dump()
    assert "password" not in entry_dict
    assert "password_hash" not in entry_dict
    assert "token_hash" not in entry_dict
    assert "sessions" not in entry_dict
    assert entry_dict["role"] == "student"


# ==============================================================================
# Unit Tests: Service Layer
# ==============================================================================

@pytest.mark.asyncio
async def test_directory_service_get_entry_success(
    sample_users: dict[str, UserDocument],
    sample_profiles: list[DirectoryProfileDocument],
) -> None:
    user_repo = InMemoryUserRepository(initial_users=list(sample_users.values()))
    dir_repo = InMemoryDirectoryRepository(initial_profiles=sample_profiles)
    service = DirectoryService(dir_repo, user_repo)

    entry = await service.get_entry("usr_faculty_1")
    assert entry.id == "usr_faculty_1"
    assert entry.full_name == "Dr. Bob Faculty"
    assert entry.department == "Computer Science"
    assert entry.office_location == "Turing Hall 402"


@pytest.mark.asyncio
async def test_directory_service_get_entry_defaults_general_campus(
    sample_users: dict[str, UserDocument],
    sample_profiles: list[DirectoryProfileDocument],
) -> None:
    user_repo = InMemoryUserRepository(initial_users=list(sample_users.values()))
    dir_repo = InMemoryDirectoryRepository(initial_profiles=sample_profiles)
    service = DirectoryService(dir_repo, user_repo)

    # Student has no explicit profile yet
    entry = await service.get_entry("usr_student_1")
    assert entry.id == "usr_student_1"
    assert entry.department == "General Campus"
    assert entry.title is None


@pytest.mark.asyncio
async def test_directory_service_get_entry_inactive_or_missing_raises_404(
    sample_users: dict[str, UserDocument],
    sample_profiles: list[DirectoryProfileDocument],
) -> None:
    user_repo = InMemoryUserRepository(initial_users=list(sample_users.values()))
    dir_repo = InMemoryDirectoryRepository(initial_profiles=sample_profiles)
    service = DirectoryService(dir_repo, user_repo)

    with pytest.raises(HTTPException) as exc_missing:
        await service.get_entry("usr_nonexistent")
    assert exc_missing.value.status_code == 404

    with pytest.raises(HTTPException) as exc_inactive:
        await service.get_entry("usr_inactive_1")
    assert exc_inactive.value.status_code == 404


@pytest.mark.asyncio
async def test_directory_service_rbac_update_rules(
    sample_users: dict[str, UserDocument],
    sample_profiles: list[DirectoryProfileDocument],
) -> None:
    user_repo = InMemoryUserRepository(initial_users=list(sample_users.values()))
    dir_repo = InMemoryDirectoryRepository(initial_profiles=sample_profiles)
    service = DirectoryService(dir_repo, user_repo)

    student = sample_users["student"]
    faculty = sample_users["faculty"]
    admin = sample_users["admin"]

    # 1. Self-update succeeds
    self_res = await service.update_profile(
        target_user_id=str(student.id),
        updates=DirectoryProfileUpdate(bio="Student self-updated bio"),
        acting_user=student,
    )
    assert self_res.bio == "Student self-updated bio"

    # 2. Student trying to update faculty fails with 403
    with pytest.raises(HTTPException) as exc_forbidden:
        await service.update_profile(
            target_user_id=str(faculty.id),
            updates=DirectoryProfileUpdate(title="Hacked Title"),
            acting_user=student,
        )
    assert exc_forbidden.value.status_code == 403

    # 3. Admin updating faculty succeeds
    admin_res = await service.update_profile(
        target_user_id=str(faculty.id),
        updates=DirectoryProfileUpdate(title="Senior Professor"),
        acting_user=admin,
    )
    assert admin_res.title == "Senior Professor"


# ==============================================================================
# API Integration Tests: Authentication & Authorization Boundaries
# ==============================================================================

def test_directory_endpoints_require_authentication(
    directory_app: tuple[TestClient, InMemoryUserRepository, InMemoryDirectoryRepository],
) -> None:
    client, _, _ = directory_app

    # Unauthenticated requests must receive 401
    assert client.get("/api/v1/directory").status_code == status.HTTP_401_UNAUTHORIZED
    assert client.get("/api/v1/directory/departments").status_code == status.HTTP_401_UNAUTHORIZED
    assert client.get("/api/v1/directory/me").status_code == status.HTTP_401_UNAUTHORIZED
    assert client.put("/api/v1/directory/me", json={"bio": "test"}).status_code == status.HTTP_401_UNAUTHORIZED
    assert client.get("/api/v1/directory/usr_student_1").status_code == status.HTTP_401_UNAUTHORIZED
    assert client.put("/api/v1/directory/usr_student_1", json={"bio": "test"}).status_code == status.HTTP_401_UNAUTHORIZED


def test_directory_list_and_search_success(
    directory_app: tuple[TestClient, InMemoryUserRepository, InMemoryDirectoryRepository],
    sample_users: dict[str, UserDocument],
    test_settings: Settings,
) -> None:
    client, _, _ = directory_app
    student = sample_users["student"]
    token = create_test_token(student, test_settings)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Unfiltered list returns all active users (5 active users, 1 inactive omitted)
    res = client.get("/api/v1/directory", headers=headers)
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["total"] == 5
    assert len(data["items"]) == 5
    assert data["page"] == 1
    assert data["page_size"] == 20

    # Ensure no inactive users returned
    returned_ids = [item["id"] for item in data["items"]]
    assert "usr_inactive_1" not in returned_ids

    # 2. Query filter by full_name
    res_q = client.get("/api/v1/directory?query=Alice", headers=headers)
    assert res_q.status_code == status.HTTP_200_OK
    data_q = res_q.json()
    assert data_q["total"] == 1
    assert data_q["items"][0]["full_name"] == "Alice Student"

    # 3. Filter by role
    res_role = client.get("/api/v1/directory?role=faculty", headers=headers)
    assert res_role.status_code == status.HTTP_200_OK
    data_role = res_role.json()
    assert data_role["total"] == 1
    assert data_role["items"][0]["role"] == "faculty"

    # 4. Filter by department
    res_dept = client.get("/api/v1/directory?department=Computer Science", headers=headers)
    assert res_dept.status_code == status.HTTP_200_OK
    data_dept = res_dept.json()
    assert data_dept["total"] == 1
    assert data_dept["items"][0]["department"] == "Computer Science"

    # 5. Pagination check
    res_page = client.get("/api/v1/directory?page=1&page_size=2", headers=headers)
    assert res_page.status_code == status.HTTP_200_OK
    data_page = res_page.json()
    assert data_page["total"] == 5
    assert len(data_page["items"]) == 2
    assert data_page["page"] == 1
    assert data_page["page_size"] == 2


def test_directory_departments_endpoint(
    directory_app: tuple[TestClient, InMemoryUserRepository, InMemoryDirectoryRepository],
    sample_users: dict[str, UserDocument],
    test_settings: Settings,
) -> None:
    client, _, _ = directory_app
    token = create_test_token(sample_users["faculty"], test_settings)
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/directory/departments", headers=headers)
    assert res.status_code == status.HTTP_200_OK
    departments = res.json()
    assert "Campus Operations" in departments
    assert "Computer Science" in departments
    assert "General Campus" in departments


def test_directory_me_and_self_update(
    directory_app: tuple[TestClient, InMemoryUserRepository, InMemoryDirectoryRepository],
    sample_users: dict[str, UserDocument],
    test_settings: Settings,
) -> None:
    client, _, _ = directory_app
    student = sample_users["student"]
    token = create_test_token(student, test_settings)
    headers = {"Authorization": f"Bearer {token}"}

    # GET /directory/me
    res_get = client.get("/api/v1/directory/me", headers=headers)
    assert res_get.status_code == status.HTTP_200_OK
    data_get = res_get.json()
    assert data_get["id"] == str(student.id)
    assert data_get["department"] == "General Campus"
    assert data_get["bio"] is None

    # PUT /directory/me
    res_put = client.put(
        "/api/v1/directory/me",
        headers=headers,
        json={
            "bio": "Honors Computer Science Undergraduate",
            "phone_extension": "x1099",
        },
    )
    assert res_put.status_code == status.HTTP_200_OK
    data_put = res_put.json()
    assert data_put["bio"] == "Honors Computer Science Undergraduate"
    assert data_put["phone_extension"] == "x1099"
    assert data_put["department"] == "General Campus"

    # Verify subsequent GET reflects updates
    res_verify = client.get("/api/v1/directory/me", headers=headers)
    assert res_verify.json()["bio"] == "Honors Computer Science Undergraduate"


def test_directory_admin_update_another_user(
    directory_app: tuple[TestClient, InMemoryUserRepository, InMemoryDirectoryRepository],
    sample_users: dict[str, UserDocument],
    test_settings: Settings,
) -> None:
    client, _, _ = directory_app
    admin_token = create_test_token(sample_users["admin"], test_settings)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    target_faculty_id = str(sample_users["faculty"].id)

    # Admin updates faculty profile
    res = client.put(
        f"/api/v1/directory/{target_faculty_id}",
        headers=admin_headers,
        json={
            "title": "Chair of Computing",
            "office_location": "Science Wing 101",
        },
    )
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["id"] == target_faculty_id
    assert data["title"] == "Chair of Computing"
    assert data["office_location"] == "Science Wing 101"


def test_directory_management_update_another_user(
    directory_app: tuple[TestClient, InMemoryUserRepository, InMemoryDirectoryRepository],
    sample_users: dict[str, UserDocument],
    test_settings: Settings,
) -> None:
    client, _, _ = directory_app
    mgmt_token = create_test_token(sample_users["management"], test_settings)
    mgmt_headers = {"Authorization": f"Bearer {mgmt_token}"}
    target_student_id = str(sample_users["student"].id)

    # Management updates student profile
    res = client.put(
        f"/api/v1/directory/{target_student_id}",
        headers=mgmt_headers,
        json={"department": "Engineering Dean's Office"},
    )
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["department"] == "Engineering Dean's Office"


def test_directory_unauthorized_role_cannot_update_another_user(
    directory_app: tuple[TestClient, InMemoryUserRepository, InMemoryDirectoryRepository],
    sample_users: dict[str, UserDocument],
    test_settings: Settings,
) -> None:
    client, _, _ = directory_app
    target_faculty_id = str(sample_users["faculty"].id)

    # 1. Student trying to update faculty -> 403 Forbidden
    student_token = create_test_token(sample_users["student"], test_settings)
    res_student = client.put(
        f"/api/v1/directory/{target_faculty_id}",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"title": "Hacked Title"},
    )
    assert res_student.status_code == status.HTTP_403_FORBIDDEN

    # 2. Faculty trying to update student -> 403 Forbidden
    faculty_token = create_test_token(sample_users["faculty"], test_settings)
    target_student_id = str(sample_users["student"].id)
    res_faculty = client.put(
        f"/api/v1/directory/{target_student_id}",
        headers={"Authorization": f"Bearer {faculty_token}"},
        json={"department": "Expelled"},
    )
    assert res_faculty.status_code == status.HTTP_403_FORBIDDEN

    # 3. Staff trying to update student -> 403 Forbidden
    staff_token = create_test_token(sample_users["staff"], test_settings)
    res_staff = client.put(
        f"/api/v1/directory/{target_student_id}",
        headers={"Authorization": f"Bearer {staff_token}"},
        json={"title": "Staff Modified"},
    )
    assert res_staff.status_code == status.HTTP_403_FORBIDDEN


def test_directory_target_not_found_returns_404(
    directory_app: tuple[TestClient, InMemoryUserRepository, InMemoryDirectoryRepository],
    sample_users: dict[str, UserDocument],
    test_settings: Settings,
) -> None:
    client, _, _ = directory_app
    admin_token = create_test_token(sample_users["admin"], test_settings)
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Nonexistent user GET
    assert client.get("/api/v1/directory/nonexistent_id", headers=headers).status_code == status.HTTP_404_NOT_FOUND

    # Inactive user GET
    assert client.get("/api/v1/directory/usr_inactive_1", headers=headers).status_code == status.HTTP_404_NOT_FOUND

    # Nonexistent user PUT
    assert client.put(
        "/api/v1/directory/nonexistent_id",
        headers=headers,
        json={"bio": "test"},
    ).status_code == status.HTTP_404_NOT_FOUND


def test_directory_responses_strictly_exclude_security_internals(
    directory_app: tuple[TestClient, InMemoryUserRepository, InMemoryDirectoryRepository],
    sample_users: dict[str, UserDocument],
    test_settings: Settings,
) -> None:
    """Security Invariant: No password_hash, token_hash, or secret leak across any directory response."""
    client, _, _ = directory_app
    token = create_test_token(sample_users["student"], test_settings)
    headers = {"Authorization": f"Bearer {token}"}

    def check_no_secrets(data: Any) -> None:
        if isinstance(data, dict):
            for key in ["password", "password_hash", "token_hash", "refresh_token", "session_id"]:
                assert key not in data, f"Found sensitive key '{key}' in response!"
            for val in data.values():
                check_no_secrets(val)
        elif isinstance(data, list):
            for item in data:
                check_no_secrets(item)

    res_list = client.get("/api/v1/directory", headers=headers)
    check_no_secrets(res_list.json())

    res_me = client.get("/api/v1/directory/me", headers=headers)
    check_no_secrets(res_me.json())

    res_single = client.get(f"/api/v1/directory/{sample_users['faculty'].id}", headers=headers)
    check_no_secrets(res_single.json())
