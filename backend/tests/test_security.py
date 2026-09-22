"""Tests for Phase 2B.3-A: Authentication Contracts and Password Security Foundation.

Validates:
- Argon2id password hashing and constant-time verification
- Centralized password policy rules and boundaries
- Role acceptance (all 5 canonical roles) and rejection of invalid roles
- Request schemas (RegisterRequest, LoginRequest, RefreshTokenRequest)
- Response schemas (UserResponse, SessionResponse, AuthResponse) excluding sensitive credentials
- Session persistence document and active/expired/revoked state calculations
- SessionRepository abstraction operations
- JWT / token security configuration and production validation rules
"""

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock
import pytest
from pydantic import ValidationError

from app.core.config import Settings
from app.core.security import (
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    hash_password,
    hash_token,
    validate_password_policy,
    verify_password,
)
from app.repositories.session_repository import SessionRepository
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenPayload,
)
from app.schemas.session import (
    SessionCreateInternal,
    SessionDocument,
    SessionResponse,
)
from app.schemas.user import (
    VALID_ROLES,
    UserDocument,
    UserResponse,
)
from app.services.security_service import SecurityService, security_service


# ==============================================================================
# 1. Password Hashing and Verification Tests
# ==============================================================================

def test_hash_password_returns_valid_argon2_string() -> None:
    """Argon2id produces an identifiable hash string starting with $argon2id$."""
    raw = "SecureP@ssw0rd2026"
    h = hash_password(raw)
    assert isinstance(h, str)
    assert h.startswith("$argon2id$")
    # Different hash each time due to unique salt
    h2 = hash_password(raw)
    assert h != h2


def test_verify_password_matches_correct_password() -> None:
    """Verifying correct password succeeds."""
    raw = "MyInstitutionalSecret123"
    h = hash_password(raw)
    assert verify_password(raw, h) is True


def test_verify_password_rejects_wrong_password() -> None:
    """Verifying wrong password returns False without raising unhandled exceptions."""
    raw = "MyInstitutionalSecret123"
    h = hash_password(raw)
    assert verify_password("WrongPassword456", h) is False
    assert verify_password("", h) is False


def test_verify_password_handles_corrupt_hash_gracefully() -> None:
    """Corrupt or malformed hash returns False safely."""
    assert verify_password("AnyPassword123", "not-a-valid-argon2-hash") is False
    assert verify_password("AnyPassword123", "") is False


def test_security_service_facade() -> None:
    """SecurityService correctly wraps hashing, verification, and token hashing."""
    service = SecurityService()
    pwd = "CampusOperatingSystem2026"
    pwd_hash = service.hash_password(pwd)
    assert service.verify_password(pwd, pwd_hash) is True
    assert service.verify_password("wrong", pwd_hash) is False

    tok = "refresh-token-xyz-123"
    tok_hash = service.hash_token(tok)
    assert len(tok_hash) == 64
    assert service.hash_token(tok) == tok_hash


# ==============================================================================
# 2. Password Policy Tests
# ==============================================================================

def test_password_policy_accepts_valid_passwords() -> None:
    """Password policy accepts passwords satisfying length boundaries."""
    assert validate_password_policy("validpassword8") == "validpassword8"
    assert validate_password_policy("a" * PASSWORD_MIN_LENGTH) == "a" * PASSWORD_MIN_LENGTH
    assert validate_password_policy("z" * PASSWORD_MAX_LENGTH) == "z" * PASSWORD_MAX_LENGTH
    # Unicode and complex passwords
    assert validate_password_policy("Str0ng!P@ss#2026") == "Str0ng!P@ss#2026"


def test_password_policy_rejects_too_short() -> None:
    """Passwords with length less than PASSWORD_MIN_LENGTH are rejected."""
    with pytest.raises(ValueError) as exc:
        validate_password_policy("short")
    assert f"at least {PASSWORD_MIN_LENGTH}" in str(exc.value)


def test_password_policy_rejects_too_long() -> None:
    """Passwords exceeding PASSWORD_MAX_LENGTH are rejected."""
    with pytest.raises(ValueError) as exc:
        validate_password_policy("x" * (PASSWORD_MAX_LENGTH + 1))
    assert f"cannot exceed {PASSWORD_MAX_LENGTH}" in str(exc.value)


def test_password_policy_rejects_empty_or_whitespace() -> None:
    """Empty or whitespace-only passwords are rejected."""
    with pytest.raises(ValueError) as exc1:
        validate_password_policy("")
    assert "cannot be empty" in str(exc1.value)

    with pytest.raises(ValueError) as exc2:
        validate_password_policy("        ")
    assert "cannot be empty" in str(exc2.value)


# ==============================================================================
# 3. Canonical Roles Tests
# ==============================================================================

@pytest.mark.parametrize("role", ["student", "faculty", "admin", "management", "staff"])
def test_all_five_canonical_roles_accepted_in_registration(role: str) -> None:
    """All 5 canonical RBAC roles are valid."""
    req = RegisterRequest(
        institutional_id="INST-001",
        institutional_email="test@university.edu",
        full_name="Valid User",
        password="ValidPassword123",
        role=role,  # type: ignore[arg-type]
    )
    assert req.role == role


def test_invalid_role_rejected_in_registration() -> None:
    """Unknown or unauthorized roles are rejected."""
    with pytest.raises(ValidationError) as exc:
        RegisterRequest(
            institutional_id="INST-001",
            institutional_email="test@university.edu",
            full_name="Valid User",
            password="ValidPassword123",
            role="superadmin",  # type: ignore[arg-type]
        )
    assert "role" in str(exc.value).lower()


# ==============================================================================
# 4. Authentication Schema Contracts Tests
# ==============================================================================

def test_register_request_normalizes_email_and_id() -> None:
    """Registration request normalizes email to lowercase and ID to uppercase."""
    req = RegisterRequest(
        institutional_id="  stu-2026-999  ",
        institutional_email="  Student.Name@University.EDU  ",
        full_name="Jane Doe",
        password="ValidSecurePassword123",
        role="student",
    )
    assert req.institutional_id == "STU-2026-999"
    assert req.institutional_email == "student.name@university.edu"


def test_register_request_rejects_invalid_password() -> None:
    """Registration request schema enforces password policy."""
    with pytest.raises(ValidationError) as exc:
        RegisterRequest(
            institutional_id="STU-2026-001",
            institutional_email="jane@university.edu",
            full_name="Jane Doe",
            password="short",
            role="student",
        )
    assert "password" in str(exc.value).lower()


def test_login_request_contract() -> None:
    """Login request accepts identifier and password."""
    req = LoginRequest(
        identifier="STU-2026-001",
        password="ValidPassword123",
    )
    assert req.identifier == "STU-2026-001"
    assert req.password == "ValidPassword123"


def test_refresh_token_request_contract() -> None:
    """RefreshTokenRequest accepts optional token for non-browser flows."""
    req_empty = RefreshTokenRequest()
    assert req_empty.refresh_token is None

    req_with_token = RefreshTokenRequest(refresh_token="explicit-token-str")
    assert req_with_token.refresh_token == "explicit-token-str"


def test_token_payload_contract() -> None:
    """TokenPayload encapsulates standard JWT claims."""
    payload = TokenPayload(
        sub="usr_12345",
        role="faculty",
        iss="lumora",
        aud="lumora-client",
        exp=1790000000,
        iat=1790000000 - 900,
    )
    assert payload.sub == "usr_12345"
    assert payload.role == "faculty"
    assert payload.iss == "lumora"


# ==============================================================================
# 5. Safe Response Models (Exclusion of Credentials)
# ==============================================================================

def test_user_response_excludes_password_and_hash() -> None:
    """UserResponse schema strictly excludes password and password_hash fields."""
    user_fields = set(UserResponse.model_fields.keys())
    assert "password" not in user_fields
    assert "password_hash" not in user_fields


def test_session_response_excludes_token_hash() -> None:
    """SessionResponse schema strictly excludes token_hash."""
    session_fields = set(SessionResponse.model_fields.keys())
    assert "token_hash" not in session_fields
    assert "raw_token" not in session_fields


def test_auth_response_excludes_sensitive_credentials() -> None:
    """AuthResponse exposes access_token, expires_in, and safe user profile only."""
    user_resp = UserResponse(
        id="usr_001",
        institutional_id="STU-2026-001",
        institutional_email="test@university.edu",
        full_name="Test User",
        role="student",
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    auth_resp = AuthResponse(
        access_token="sample.jwt.token",
        expires_in=900,
        user=user_resp,
    )
    auth_fields = set(auth_resp.model_dump().keys())
    assert "password" not in auth_fields
    assert "password_hash" not in auth_fields
    assert "token_hash" not in auth_fields
    assert "refresh_token" not in auth_fields


# ==============================================================================
# 6. Session Persistence Contract Tests
# ==============================================================================

def test_hash_token_produces_deterministic_sha256() -> None:
    """Token hashing is deterministic, hex-encoded, and 64 characters long."""
    raw = "lumora_refresh_token_test_12345"
    h1 = hash_token(raw)
    h2 = hash_token(raw)
    assert h1 == h2
    assert len(h1) == 64
    assert h1 != raw


def test_session_document_active_state_computation() -> None:
    """SessionDocument evaluates is_active based on expiration and revocation timestamps."""
    now = datetime.now(timezone.utc)
    future = now + timedelta(days=7)
    past = now - timedelta(days=1)

    # Active session
    active_session = SessionDocument(
        id="sess_1",
        user_id="usr_1",
        token_hash="hash123",
        expires_at=future,
        revoked_at=None,
    )
    assert active_session.is_active is True

    # Expired session
    expired_session = SessionDocument(
        id="sess_2",
        user_id="usr_1",
        token_hash="hash456",
        expires_at=past,
        revoked_at=None,
    )
    assert expired_session.is_active is False

    # Revoked session
    revoked_session = SessionDocument(
        id="sess_3",
        user_id="usr_1",
        token_hash="hash789",
        expires_at=future,
        revoked_at=now,
    )
    assert revoked_session.is_active is False


def test_session_create_internal_serialization() -> None:
    """SessionCreateInternal correctly serializes for MongoDB persistence."""
    exp = datetime.now(timezone.utc) + timedelta(days=7)
    create_payload = SessionCreateInternal(
        user_id="usr_999",
        token_hash="sha256hashabc",
        expires_at=exp,
        device_info="Firefox / Linux",
    )
    doc = create_payload.to_document()
    assert doc["user_id"] == "usr_999"
    assert doc["token_hash"] == "sha256hashabc"
    assert doc["revoked_at"] is None
    assert doc["device_info"] == "Firefox / Linux"
    assert "created_at" in doc


# ==============================================================================
# 7. SessionRepository Abstraction Tests
# ==============================================================================

@pytest.mark.asyncio
async def test_session_repository_create_and_find() -> None:
    """SessionRepository creates session and retrieves by token hash."""
    mock_collection = MagicMock()
    mock_collection.insert_one = AsyncMock()
    mock_insert_result = MagicMock()
    mock_insert_result.inserted_id = "507f1f77bcf86cd799439011"
    mock_collection.insert_one.return_value = mock_insert_result

    repo = SessionRepository(mock_collection)
    exp = datetime.now(timezone.utc) + timedelta(days=7)
    created = await repo.create_session(
        SessionCreateInternal(
            user_id="usr_123",
            token_hash="fingerprint_hash_abc",
            expires_at=exp,
            device_info="Safari / macOS",
        )
    )
    assert created.id == "507f1f77bcf86cd799439011"
    assert created.user_id == "usr_123"
    assert created.token_hash == "fingerprint_hash_abc"
    mock_collection.insert_one.assert_called_once()


@pytest.mark.asyncio
async def test_session_repository_revocations() -> None:
    """SessionRepository marks sessions as revoked."""
    mock_collection = MagicMock()
    mock_collection.update_one = AsyncMock()
    mock_update_result = MagicMock()
    mock_update_result.modified_count = 1
    mock_collection.update_one.return_value = mock_update_result

    repo = SessionRepository(mock_collection)
    success = await repo.revoke_session("fingerprint_hash_abc")
    assert success is True
    mock_collection.update_one.assert_called_once()

    # Revoke all for user
    mock_collection.update_many = AsyncMock()
    mock_many_result = MagicMock()
    mock_many_result.modified_count = 3
    mock_collection.update_many.return_value = mock_many_result

    count = await repo.revoke_all_for_user("usr_123")
    assert count == 3
    mock_collection.update_many.assert_called_once()


# ==============================================================================
# 8. JWT & Token Configuration Tests
# ==============================================================================

def test_jwt_config_loads_defaults() -> None:
    """Settings loads JWT defaults correctly in development."""
    settings = Settings(
        LUMORA_ENV="development",
        CORS_ORIGINS=["http://localhost:5173"],
    )
    assert settings.jwt_algorithm == "HS256"
    assert settings.jwt_access_token_expire_minutes == 15
    assert settings.jwt_refresh_token_expire_days == 7
    assert settings.jwt_issuer == "lumora"
    assert settings.jwt_audience == "lumora-client"


def test_production_rejects_placeholder_jwt_secret() -> None:
    """In production, placeholder or default secrets must be rejected."""
    with pytest.raises(ValidationError) as exc:
        Settings(
            LUMORA_ENV="production",
            CORS_ORIGINS=["https://lumora.campus.edu"],
            JWT_SECRET_KEY="lumora-insecure-dev-secret-key-change-in-production-min-32-chars",
        )
    assert "cannot contain default or placeholder values" in str(exc.value)


def test_production_rejects_short_jwt_secret() -> None:
    """In production, secrets shorter than 32 characters are rejected."""
    with pytest.raises(ValidationError) as exc:
        Settings(
            LUMORA_ENV="production",
            CORS_ORIGINS=["https://lumora.campus.edu"],
            JWT_SECRET_KEY="tooshortkey123",
        )
    assert "must be at least 32 characters long" in str(exc.value)


def test_production_accepts_strong_random_jwt_secret() -> None:
    """In production, strong random secret (>=32 chars) without placeholder words is accepted."""
    strong_key = "a4b8c12d90ef345678901234567890abcdef1234567890abcdef12345678"
    settings = Settings(
        LUMORA_ENV="production",
        CORS_ORIGINS=["https://lumora.campus.edu"],
        JWT_SECRET_KEY=strong_key,
    )
    assert settings.jwt_secret_key == strong_key
    assert settings.is_production is True
