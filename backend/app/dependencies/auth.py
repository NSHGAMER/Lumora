"""Authentication and registration dependency providers for FastAPI dependency injection."""

from fastapi import Depends

from app.core.config import Settings, get_settings
from app.dependencies.database import get_session_repository, get_user_repository
from app.repositories.session_repository import SessionRepository
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.services.registration_service import RegistrationService
from app.services.security_service import SecurityService, security_service


def get_security_service() -> SecurityService:
    """Provide singleton SecurityService instance."""
    return security_service


def get_registration_service(
    user_repo: UserRepository = Depends(get_user_repository),
    sec_service: SecurityService = Depends(get_security_service),
) -> RegistrationService:
    """Provide RegistrationService injected with repositories and security services."""
    return RegistrationService(
        user_repository=user_repo,
        security_service=sec_service,
    )


def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repository),
    session_repo: SessionRepository = Depends(get_session_repository),
    sec_service: SecurityService = Depends(get_security_service),
    settings: Settings = Depends(get_settings),
) -> AuthService:
    """Provide AuthService injected with repositories, security primitives, and settings."""
    return AuthService(
        user_repository=user_repo,
        session_repository=session_repo,
        security_service=sec_service,
        settings=settings,
    )
