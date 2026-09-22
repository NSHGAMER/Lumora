"""Campus directory domain service.

Coordinates between UserRepository and DirectoryRepository to provide:
- Directory search, pagination, and role/department filtering
- Profile retrieval by user ID
- Profile update (self-edit or administrative edit)
- Composite responses merging User identity with Campus Profile information
- Domain-level business rule and authorization boundary enforcement
"""

from typing import Optional
from fastapi import HTTPException, status

from app.repositories.directory_repository import DirectoryRepository
from app.repositories.user_repository import UserRepository
from app.schemas.directory import (
    DirectoryEntryResponse,
    DirectoryListResponse,
    DirectoryProfileUpdate,
)
from app.schemas.user import CanonicalRole, UserDocument


class DirectoryService:
    """Domain service managing campus directory business logic and access boundaries."""

    def __init__(
        self,
        directory_repository: DirectoryRepository,
        user_repository: UserRepository,
    ) -> None:
        self.directory_repository = directory_repository
        self.user_repository = user_repository

    async def get_entry(self, user_id: str) -> DirectoryEntryResponse:
        """Fetch composite directory entry for an active campus member."""
        user = await self.user_repository.get_by_id(user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Directory entry not found",
            )

        profile = await self.directory_repository.get_by_user_id(user_id)
        return DirectoryEntryResponse(
            id=str(user.id),
            institutional_id=user.institutional_id,
            institutional_email=user.institutional_email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            department=profile.department if profile else "General Campus",
            title=profile.title if profile else None,
            office_location=profile.office_location if profile else None,
            phone_extension=profile.phone_extension if profile else None,
            bio=profile.bio if profile else None,
            created_at=user.created_at,
            updated_at=profile.updated_at if profile else user.created_at,
        )

    async def list_entries(
        self,
        query: Optional[str] = None,
        role: Optional[str] = None,
        department: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> DirectoryListResponse:
        """List active directory members with optional query, role, and department filters."""
        clean_page = max(1, page)
        clean_page_size = min(max(1, page_size), 100)
        skip = (clean_page - 1) * clean_page_size

        if department:
            dept_clean = department.strip()
            if dept_clean.lower() == "general campus":
                excluded_ids = await self.directory_repository.get_user_ids_with_other_departments(
                    "General Campus"
                )
                users, total = await self.user_repository.list_active_users(
                    role=role,
                    query_text=query,
                    exclude_user_ids=excluded_ids,
                    skip=skip,
                    limit=clean_page_size,
                )
            else:
                matching_ids = await self.directory_repository.get_user_ids_by_department(dept_clean)
                if not matching_ids:
                    return DirectoryListResponse(
                        items=[],
                        total=0,
                        page=clean_page,
                        page_size=clean_page_size,
                    )
                users, total = await self.user_repository.list_active_users(
                    role=role,
                    query_text=query,
                    user_ids=matching_ids,
                    skip=skip,
                    limit=clean_page_size,
                )
        else:
            users, total = await self.user_repository.list_active_users(
                role=role,
                query_text=query,
                skip=skip,
                limit=clean_page_size,
            )

        user_ids = [str(u.id) for u in users if u.id]
        profiles_map = await self.directory_repository.get_profiles_by_user_ids(user_ids)

        items = [
            DirectoryEntryResponse(
                id=str(u.id),
                institutional_id=u.institutional_id,
                institutional_email=u.institutional_email,
                full_name=u.full_name,
                role=u.role,
                is_active=u.is_active,
                department=(
                    profiles_map[str(u.id)].department
                    if str(u.id) in profiles_map
                    else "General Campus"
                ),
                title=profiles_map[str(u.id)].title if str(u.id) in profiles_map else None,
                office_location=(
                    profiles_map[str(u.id)].office_location
                    if str(u.id) in profiles_map
                    else None
                ),
                phone_extension=(
                    profiles_map[str(u.id)].phone_extension
                    if str(u.id) in profiles_map
                    else None
                ),
                bio=profiles_map[str(u.id)].bio if str(u.id) in profiles_map else None,
                created_at=u.created_at,
                updated_at=(
                    profiles_map[str(u.id)].updated_at
                    if str(u.id) in profiles_map
                    else u.created_at
                ),
            )
            for u in users
        ]

        return DirectoryListResponse(
            items=items,
            total=total,
            page=clean_page,
            page_size=clean_page_size,
        )

    async def update_profile(
        self,
        target_user_id: str,
        updates: DirectoryProfileUpdate,
        acting_user: UserDocument,
    ) -> DirectoryEntryResponse:
        """Update a directory profile.
        
        Rules:
        - Any active user may update their own profile.
        - Updating another user's profile requires 'admin' or 'management' role.
        - Target user must exist and be active.
        """
        target_user = await self.user_repository.get_by_id(target_user_id)
        if not target_user or not target_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target directory entry not found",
            )

        is_self = str(acting_user.id) == str(target_user.id)
        acting_role = (
            acting_user.role.value
            if hasattr(acting_user.role, "value")
            else str(acting_user.role)
        )

        if not is_self and acting_role not in ("admin", "management"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to modify another user's directory profile",
            )

        profile = await self.directory_repository.upsert_profile(target_user_id, updates)

        return DirectoryEntryResponse(
            id=str(target_user.id),
            institutional_id=target_user.institutional_id,
            institutional_email=target_user.institutional_email,
            full_name=target_user.full_name,
            role=target_user.role,
            is_active=target_user.is_active,
            department=profile.department,
            title=profile.title,
            office_location=profile.office_location,
            phone_extension=profile.phone_extension,
            bio=profile.bio,
            created_at=target_user.created_at,
            updated_at=profile.updated_at,
        )

    async def list_departments(self) -> list[str]:
        """Fetch distinct campus departments."""
        return await self.directory_repository.list_departments()
