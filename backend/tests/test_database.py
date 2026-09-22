"""Tests for MongoDB configuration, lifecycle, index definitions, and health behavior."""

import os
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from app.core.config import Settings
from app.core.database import DatabaseManager, USER_INDEXES, SESSION_INDEXES


def test_mongodb_configuration_defaults() -> None:
    """Verify default MongoDB settings when unconfigured."""
    settings = Settings(
        LUMORA_ENV="development",
        CORS_ORIGINS=["http://localhost:5173"],
    )
    assert settings.mongodb_database == "lumora"
    assert settings.has_mongodb_configured is False
    assert settings.mongodb_min_pool_size == 5
    assert settings.mongodb_max_pool_size == 50


def test_mongodb_configuration_valid_uri() -> None:
    """Verify settings detects valid MongoDB URI."""
    settings = Settings(
        LUMORA_ENV="development",
        CORS_ORIGINS=["http://localhost:5173"],
        MONGODB_URI="mongodb+srv://admin:secret@cluster0.abc.mongodb.net/lumora",
        MONGODB_DATABASE="lumora_prod",
    )
    assert settings.has_mongodb_configured is True
    assert settings.mongodb_database == "lumora_prod"


def test_mongodb_configuration_placeholder_rejected() -> None:
    """Verify placeholder URI template is considered unconfigured."""
    settings = Settings(
        LUMORA_ENV="development",
        CORS_ORIGINS=["http://localhost:5173"],
        MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>/<database>",
    )
    assert settings.has_mongodb_configured is False


def test_database_index_definitions() -> None:
    """Verify stable index definitions and uniqueness invariants."""
    index_names = [idx.document["name"] for idx in USER_INDEXES]
    assert "idx_users_normalized_email_unique" in index_names
    assert "idx_users_institutional_id_unique" in index_names
    assert "idx_users_role" in index_names
    assert "idx_users_created_at" in index_names

    # Check unique flag on email and institutional ID indexes
    for idx in USER_INDEXES:
        name = idx.document["name"]
        if name in ("idx_users_normalized_email_unique", "idx_users_institutional_id_unique"):
            assert idx.document.get("unique") is True

    # Check session indexes
    session_names = [idx.document["name"] for idx in SESSION_INDEXES]
    assert "idx_sessions_user_id" in session_names
    assert "idx_sessions_token_hash_unique" in session_names
    assert "idx_sessions_expires_at" in session_names


@pytest.mark.asyncio
async def test_unconfigured_database_lifecycle() -> None:
    """Verify database manager behaves safely when MongoDB is unconfigured."""
    manager = DatabaseManager()
    settings = Settings(
        LUMORA_ENV="development",
        CORS_ORIGINS=["http://localhost:5173"],
        MONGODB_URI=None,
    )

    await manager.connect(settings)
    assert manager.is_connected is False
    assert manager.is_configured is False
    assert manager.database is None
    assert manager.client is None

    health = manager.get_health_status()
    assert health["state"] == "unconfigured"
    assert "unconfigured" in health["details"]

    await manager.disconnect()
    assert manager.is_connected is False


@pytest.mark.asyncio
async def test_database_connected_lifecycle_mocked() -> None:
    """Verify successful database lifecycle and index creation using mock client."""
    manager = DatabaseManager()
    settings = Settings(
        LUMORA_ENV="development",
        CORS_ORIGINS=["http://localhost:5173"],
        MONGODB_URI="mongodb://localhost:27017/lumora",
    )

    mock_client = MagicMock()
    mock_db = MagicMock()
    mock_users_col = MagicMock()
    mock_sessions_col = MagicMock()

    mock_users_col.create_indexes = AsyncMock(return_value=["idx1", "idx2"])
    mock_sessions_col.create_indexes = AsyncMock(return_value=["sidx1"])
    mock_db.__getitem__.side_effect = lambda name: mock_users_col if name == "users" else mock_sessions_col
    mock_client.__getitem__.return_value = mock_db
    mock_client.admin.command = AsyncMock(return_value={"ok": 1})
    mock_client.close = AsyncMock()

    with patch("app.core.database.AsyncMongoClient", return_value=mock_client):
        await manager.connect(settings)

        assert manager.is_connected is True
        assert manager.is_configured is True
        assert manager.database is not None

        # Verify ping succeeded
        assert await manager.ping() is True

        # Verify indexes were ensured
        mock_users_col.create_indexes.assert_awaited_once()
        mock_sessions_col.create_indexes.assert_awaited_once()

        # Check health report
        health = manager.get_health_status()
        assert health["state"] == "connected"

        # Check collection access
        col = manager.get_collection("users")
        assert col == mock_users_col

        # Test disconnect
        await manager.disconnect()
        mock_client.close.assert_awaited_once()
        assert manager.is_connected is False


@pytest.mark.asyncio
async def test_database_connection_failure_handling() -> None:
    """Verify disconnected state handling when ping fails."""
    manager = DatabaseManager()
    settings = Settings(
        LUMORA_ENV="development",
        CORS_ORIGINS=["http://localhost:5173"],
        MONGODB_URI="mongodb://localhost:27017/lumora",
    )

    mock_client = MagicMock()
    mock_client.admin.command = AsyncMock(side_effect=Exception("Connection refused"))

    with patch("app.core.database.AsyncMongoClient", return_value=mock_client):
        await manager.connect(settings)
        assert manager.is_connected is False

        health = manager.get_health_status()
        assert health["state"] == "disconnected"
        assert "Connection refused" in health["details"]


@pytest.mark.skipif(
    not bool(os.getenv("TEST_LIVE_MONGODB")),
    reason="Live MongoDB Atlas integration test requires TEST_LIVE_MONGODB=1",
)
@pytest.mark.asyncio
async def test_live_mongodb_atlas_integration() -> None:
    """Optional live integration test against actual Atlas cluster (environment-controlled)."""
    settings = Settings()
    if not settings.has_mongodb_configured:
        pytest.skip("No live MONGODB_URI provided in environment")
    manager = DatabaseManager()
    await manager.connect(settings)
    assert manager.is_connected is True
    assert await manager.ping() is True
    await manager.disconnect()

