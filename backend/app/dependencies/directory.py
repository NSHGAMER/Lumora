"""Directory domain service dependency provider."""

from fastapi import Depends

from app.dependencies.database import get_directory_repository, get_user_repository
from app.repositories.directory_repository import DirectoryRepository
from app.repositories.user_repository import UserRepository
from app.services.directory_service import DirectoryService


def get_directory_service(
    directory_repo: DirectoryRepository = Depends(get_directory_repository),
    user_repo: UserRepository = Depends(get_user_repository),
) -> DirectoryService:
    """Provide DirectoryService injected with repositories."""
    return DirectoryService(
        directory_repository=directory_repo,
        user_repository=user_repo,
    )
