"""Database and repository dependency providers for FastAPI dependency injection."""

from fastapi import Depends, HTTPException, status
from pymongo.asynchronous.database import AsyncDatabase

from app.core.database import db_manager
from app.repositories.user_repository import UserRepository


def get_database() -> AsyncDatabase:
    """Provide the active MongoDB database instance to route handlers or services."""
    if not db_manager.is_connected or db_manager.database is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database persistence service is currently unavailable or unconfigured.",
        )
    return db_manager.database


def get_user_repository() -> UserRepository:
    """Provide UserRepository instance backed by the application's active users collection."""
    if not db_manager.is_connected or db_manager.database is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database persistence service is currently unavailable or unconfigured.",
        )
    users_col = db_manager.get_collection("users")
    return UserRepository(users_col)
