"""Tests for User models, canonical RBAC role validation, normalization, and UserRepository."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock
from bson import ObjectId
import pytest
from pydantic import ValidationError

from app.repositories.user_repository import UserRepository
from app.schemas.user import (
    VALID_ROLES,
    UserCreateInternal,
    UserDocument,
    UserResponse,
    normalize_email,
    normalize_institutional_id,
)


def test_email_normalization() -> None:
    """Verify deterministic email normalization rules."""
    assert normalize_email("  Student.One@Campus.EDU  ") == "student.one@campus.edu"
    assert normalize_email("FACULTY@lumora.org") == "faculty@lumora.org"

    # Invalid email formats
    with pytest.raises(ValueError):
        normalize_email("not-an-email")
    with pytest.raises(ValueError):
        normalize_email("missing-domain@")
    with pytest.raises(ValueError):
        normalize_email("@domain.com")


def test_institutional_id_normalization() -> None:
    """Verify deterministic institutional identifier normalization rules."""
    assert normalize_institutional_id("  stu-2026-001  ") == "STU-2026-001"
    assert normalize_institutional_id("fac   dept  42") == "FAC DEPT 42"
    assert normalize_institutional_id("adm-999") == "ADM-999"

    # Reject identifiers shorter than 3 characters
    with pytest.raises(ValueError):
        normalize_institutional_id("AB")
    with pytest.raises(ValueError):
        normalize_institutional_id("   ")


def test_canonical_roles_membership() -> None:
    """Verify all 5 canonical roles are recognized."""
    expected = {"student", "faculty", "admin", "management", "staff"}
    assert VALID_ROLES == expected


def test_user_document_role_validation() -> None:
    """Verify that UserDocument accepts all 5 canonical roles and rejects invalid ones."""
    for role in VALID_ROLES:
        doc = UserDocument(
            institutional_id="ID-100",
            institutional_email="test@campus.edu",
            normalized_email="test@campus.edu",
            full_name="Valid User",
            role=role,  # type: ignore
            password_hash="$argon2id$mockhash",
        )
        assert doc.role == role
        assert doc.is_active is True  # Immediate activation invariant

    # Reject invalid role
    with pytest.raises(ValidationError):
        UserDocument(
            institutional_id="ID-100",
            institutional_email="test@campus.edu",
            normalized_email="test@campus.edu",
            full_name="Invalid User",
            role="superadmin",  # type: ignore
            password_hash="$argon2id$mockhash",
        )


def test_user_response_excludes_password_hash() -> None:
    """CRITICAL SECURITY INVARIANT: UserResponse must never contain password_hash."""
    doc = UserDocument(
        id=str(ObjectId()),
        institutional_id="STU-001",
        institutional_email="stu@lumora.edu",
        normalized_email="stu@lumora.edu",
        full_name="Student Test",
        role="student",
        password_hash="$argon2id$secret_stored_hash",
        is_active=True,
    )

    response = UserResponse.model_validate(doc.model_dump())
    response_dict = response.model_dump()

    assert "password_hash" not in response_dict
    assert response_dict["id"] == doc.id
    assert response_dict["institutional_id"] == "STU-001"
    assert response_dict["role"] == "student"
    assert response_dict["is_active"] is True


def test_user_create_internal_serialization() -> None:
    """Verify UserCreateInternal normalizes fields when serializing for MongoDB."""
    create_dto = UserCreateInternal(
        institutional_id="  stu-2026-999  ",
        institutional_email="  MyEmail@College.EDU  ",
        full_name="  Alex Morgan  ",
        role="student",
        password_hash="$argon2id$secret",
    )

    mongo_doc = create_dto.to_document()
    assert mongo_doc["institutional_id"] == "STU-2026-999"
    assert mongo_doc["normalized_email"] == "myemail@college.edu"
    assert mongo_doc["institutional_email"] == "MyEmail@College.EDU"
    assert mongo_doc["full_name"] == "Alex Morgan"
    assert mongo_doc["role"] == "student"
    assert mongo_doc["is_active"] is True
    assert mongo_doc["last_login_at"] is None


@pytest.mark.asyncio
async def test_user_repository_crud_operations() -> None:
    """Verify UserRepository persistence methods using an AsyncMock collection."""
    mock_col = MagicMock()
    repo = UserRepository(mock_col)

    test_oid = ObjectId()
    sample_doc = {
        "_id": test_oid,
        "institutional_id": "STU-101",
        "institutional_email": "jane@campus.edu",
        "normalized_email": "jane@campus.edu",
        "full_name": "Jane Doe",
        "role": "student",
        "password_hash": "$argon2id$dummy",
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "last_login_at": None,
    }

    # Test get_by_id
    mock_col.find_one = AsyncMock(return_value=dict(sample_doc))
    user = await repo.get_by_id(str(test_oid))
    assert user is not None
    assert user.id == str(test_oid)
    assert user.full_name == "Jane Doe"

    # Test get_by_email (with normalization)
    mock_col.find_one = AsyncMock(return_value=dict(sample_doc))
    user = await repo.get_by_email("  JANE@Campus.EDU  ")
    assert user is not None
    mock_col.find_one.assert_awaited_with({"normalized_email": "jane@campus.edu"})

    # Test get_by_institutional_id (with normalization)
    mock_col.find_one = AsyncMock(return_value=dict(sample_doc))
    user = await repo.get_by_institutional_id("  stu-101  ")
    assert user is not None
    mock_col.find_one.assert_awaited_with({"institutional_id": "STU-101"})

    # Test get_by_identifier with email
    user = await repo.get_by_identifier("jane@campus.edu")
    assert user is not None

    # Test get_by_identifier with institutional ID
    user = await repo.get_by_identifier("stu-101")
    assert user is not None

    # Test create_user
    mock_insert_res = MagicMock(inserted_id=test_oid)
    mock_col.insert_one = AsyncMock(return_value=mock_insert_res)

    create_input = UserCreateInternal(
        institutional_id="STU-102",
        institutional_email="bob@campus.edu",
        full_name="Bob Smith",
        role="student",
        password_hash="$argon2id$hash",
    )
    created = await repo.create_user(create_input)
    assert created.id == str(test_oid)
    assert created.institutional_id == "STU-102"
    mock_col.insert_one.assert_awaited_once()

    # Test update_last_login
    mock_update_res = MagicMock(modified_count=1)
    mock_col.update_one = AsyncMock(return_value=mock_update_res)
    success = await repo.update_last_login(str(test_oid))
    assert success is True
    mock_col.update_one.assert_awaited_once()

    # Test count
    mock_col.count_documents = AsyncMock(return_value=42)
    total = await repo.count()
    assert total == 42
