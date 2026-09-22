"""MongoDB Atlas persistence layer and connection lifecycle manager.

Provides:
- Single application-scoped AsyncMongoClient connection pool
- Graceful connection verification and index creation on startup
- Truthful health inspection (connected / disconnected / unconfigured)
- Idempotent index management with stable index names
"""

import asyncio
import logging
from typing import Optional
from pymongo import ASCENDING, DESCENDING, AsyncMongoClient, IndexModel
from pymongo.asynchronous.collection import AsyncCollection
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

from app.core.config import Settings

logger = logging.getLogger("lumora.database")

# Stable index definitions for canonical collections
USER_INDEXES = [
    IndexModel(
        [("normalized_email", ASCENDING)],
        unique=True,
        name="idx_users_normalized_email_unique",
    ),
    IndexModel(
        [("institutional_id", ASCENDING)],
        unique=True,
        name="idx_users_institutional_id_unique",
    ),
    IndexModel(
        [("role", ASCENDING)],
        name="idx_users_role",
    ),
    IndexModel(
        [("created_at", DESCENDING)],
        name="idx_users_created_at",
    ),
]

SESSION_INDEXES = [
    IndexModel(
        [("user_id", ASCENDING)],
        name="idx_sessions_user_id",
    ),
    IndexModel(
        [("token_hash", ASCENDING)],
        unique=True,
        name="idx_sessions_token_hash_unique",
    ),
    IndexModel(
        [("expires_at", ASCENDING)],
        name="idx_sessions_expires_at",
    ),
]

DIRECTORY_INDEXES = [
    IndexModel(
        [("user_id", ASCENDING)],
        unique=True,
        name="idx_directory_user_id_unique",
    ),
    IndexModel(
        [("department", ASCENDING)],
        name="idx_directory_department",
    ),
]


class DatabaseManager:
    """Manages the application-scoped MongoDB client, connection pool, and collection access."""

    def __init__(self) -> None:
        self._client: Optional[AsyncMongoClient] = None
        self._database: Optional[AsyncDatabase] = None
        self._is_connected: bool = False
        self._last_error: Optional[str] = None
        self._is_configured: bool = False

    @property
    def is_connected(self) -> bool:
        """True if the database is connected and responsive."""
        return self._is_connected

    @property
    def is_configured(self) -> bool:
        """True if a valid MongoDB URI is specified in settings."""
        return self._is_configured

    @property
    def database(self) -> Optional[AsyncDatabase]:
        """Access the initialized application database."""
        return self._database

    @property
    def client(self) -> Optional[AsyncMongoClient]:
        """Access the raw client pool."""
        return self._client

    async def connect(self, settings: Settings) -> None:
        """Initialize connection pool, verify connectivity, and ensure indexes."""
        self._is_configured = settings.has_mongodb_configured

        if not self._is_configured:
            logger.info(
                "MongoDB Atlas is unconfigured in current environment [%s]. Running in development-safe mode.",
                settings.environment,
            )
            self._is_connected = False
            self._database = None
            self._client = None
            self._last_error = None
            return

        try:
            logger.info(
                "Connecting to MongoDB Atlas at [%s], database: [%s]...",
                settings.mongodb_uri[:25] + "..." if settings.mongodb_uri else "None",
                settings.mongodb_database,
            )
            self._client = AsyncMongoClient(
                settings.mongodb_uri,
                serverSelectionTimeoutMS=settings.mongodb_server_selection_timeout_ms,
                minPoolSize=settings.mongodb_min_pool_size,
                maxPoolSize=settings.mongodb_max_pool_size,
            )
            self._database = self._client[settings.mongodb_database]

            # Verify connectivity via admin ping
            is_alive = await self.ping()
            if not is_alive:
                self._is_connected = False
                logger.warning("MongoDB Atlas ping failed: %s", self._last_error)
                if settings.is_production:
                    raise ConnectionFailure(self._last_error or "MongoDB ping failed")
                return

            self._is_connected = True
            self._last_error = None
            logger.info("Successfully connected to MongoDB Atlas database: [%s]", settings.mongodb_database)

            # Ensure collection indexes idempotently
            await self.ensure_indexes()

        except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
            self._is_connected = False
            self._last_error = str(exc)
            logger.warning("MongoDB Atlas connection could not be established: %s", exc)
            if settings.is_production:
                raise
        except Exception as exc:
            self._is_connected = False
            self._last_error = str(exc)
            logger.error("Unexpected error during MongoDB initialization: %s", exc)
            if settings.is_production:
                raise

    async def ping(self) -> bool:
        """Send a ping command to verify connection responsiveness."""
        if not self._client:
            return False
        try:
            res = await self._client.admin.command("ping")
            return bool(res.get("ok") == 1)
        except Exception as exc:
            self._is_connected = False
            self._last_error = str(exc)
            return False

    async def ensure_indexes(self) -> None:
        """Create or verify canonical indexes idempotently."""
        if self._database is None:
            return

        try:
            users_col: AsyncCollection = self._database["users"]
            await users_col.create_indexes(USER_INDEXES)
            logger.info("Ensured %d indexes on 'users' collection.", len(USER_INDEXES))

            sessions_col: AsyncCollection = self._database["sessions"]
            await sessions_col.create_indexes(SESSION_INDEXES)
            logger.info("Ensured %d indexes on 'sessions' collection.", len(SESSION_INDEXES))

            directory_col: AsyncCollection = self._database["directory_profiles"]
            await directory_col.create_indexes(DIRECTORY_INDEXES)
            logger.info("Ensured %d indexes on 'directory_profiles' collection.", len(DIRECTORY_INDEXES))
        except Exception as exc:
            logger.error("Failed to ensure collection indexes: %s", exc)
            raise

    async def disconnect(self) -> None:
        """Close client pool gracefully during application shutdown."""
        if self._client:
            logger.info("Closing MongoDB connection pool...")
            await self._client.close()
            self._client = None
            self._database = None
            self._is_connected = False
            logger.info("MongoDB connection pool closed.")

    def get_collection(self, name: str) -> AsyncCollection:
        """Retrieve a collection from the active database."""
        if self._database is None:
            raise RuntimeError(
                f"Database is not connected. Cannot access collection '{name}'. "
                "Ensure MONGODB_URI is configured and database is online."
            )
        return self._database[name]

    def get_health_status(self) -> dict[str, str]:
        """Return truthful database health report."""
        if not self._is_configured:
            return {
                "state": "unconfigured",
                "details": "MongoDB URI is unconfigured for this environment.",
            }
        if self._is_connected:
            return {
                "state": "connected",
                "details": "MongoDB Atlas connection pool is operational.",
            }
        return {
            "state": "disconnected",
            "details": f"Database unreachable. Error: {self._last_error or 'Unknown connection fault'}",
        }


# Global singleton instance for application lifespan
db_manager = DatabaseManager()
