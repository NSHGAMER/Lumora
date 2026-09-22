from app.dependencies.database import (
    get_database,
    get_session_repository,
    get_user_repository,
)
from app.services.security_service import SecurityService, security_service


def get_security_service() -> SecurityService:
    """Dependency provider returning the singleton SecurityService."""
    return security_service


__all__ = [
    "get_database",
    "get_user_repository",
    "get_session_repository",
    "get_security_service",
]
