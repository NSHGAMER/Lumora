"""Campus Directory API endpoints for Lumora Campus OS.

Phase 2B.5 Implementation:
- Layered architecture: Router -> Auth Dependency -> Service -> Repository -> MongoDB Atlas
- Reuses authenticated User identity without document duplication
- Exposes campus-specific directory profile extensions (department, office, bio, title)
- Role boundaries:
  - All active authenticated users can view/search directory and update their own profile.
  - Administrative updates to other profiles are restricted to 'admin' and 'management'.
  - Unauthenticated requests receive 401 Unauthorized.
  - Unauthorized roles receive 403 Forbidden.
  - Security internals (password_hash, tokens, sessions) are strictly omitted.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status

from app.dependencies.auth import get_current_active_user, require_roles
from app.dependencies.directory import get_directory_service
from app.schemas.directory import (
    DirectoryEntryResponse,
    DirectoryListResponse,
    DirectoryProfileUpdate,
)
from app.schemas.response import ErrorResponse
from app.schemas.user import CanonicalRole, UserDocument
from app.services.directory_service import DirectoryService

router = APIRouter(prefix="/directory", tags=["Campus Directory"])


@router.get(
    "",
    response_model=DirectoryListResponse,
    summary="Search and browse campus directory entries",
    description="Retrieve paginated active campus directory members with optional query, role, and department filters.",
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": ErrorResponse,
            "description": "Authentication token missing, invalid, or expired.",
        },
    },
)
async def list_directory(
    query: Optional[str] = Query(None, description="Search by name, ID, or institutional email"),
    role: Optional[CanonicalRole] = Query(None, description="Filter by canonical campus role"),
    department: Optional[str] = Query(None, description="Filter by campus department"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(20, ge=1, le=100, description="Results per page limit"),
    current_user: UserDocument = Depends(get_current_active_user),
    service: DirectoryService = Depends(get_directory_service),
) -> DirectoryListResponse:
    """List directory entries matching query filters."""
    role_str = str(role) if role else None
    return await service.list_entries(
        query=query,
        role=role_str,
        department=department,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/departments",
    response_model=list[str],
    summary="List campus departments",
    description="Retrieve distinct list of campus academic and administrative departments.",
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": ErrorResponse,
            "description": "Authentication token missing, invalid, or expired.",
        },
    },
)
async def list_departments(
    current_user: UserDocument = Depends(get_current_active_user),
    service: DirectoryService = Depends(get_directory_service),
) -> list[str]:
    """List all campus departments."""
    return await service.list_departments()


@router.get(
    "/me",
    response_model=DirectoryEntryResponse,
    summary="Get current user's directory profile",
    description="Retrieve the campus directory entry for the currently authenticated active user.",
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": ErrorResponse,
            "description": "Authentication token missing, invalid, or expired.",
        },
    },
)
async def get_my_directory_entry(
    current_user: UserDocument = Depends(get_current_active_user),
    service: DirectoryService = Depends(get_directory_service),
) -> DirectoryEntryResponse:
    """Return directory entry for current active user."""
    return await service.get_entry(user_id=str(current_user.id))


@router.put(
    "/me",
    response_model=DirectoryEntryResponse,
    summary="Update current user's directory profile",
    description="Update campus profile details (department, title, office location, phone, bio) for current user.",
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": ErrorResponse,
            "description": "Authentication token missing, invalid, or expired.",
        },
    },
)
async def update_my_directory_profile(
    updates: DirectoryProfileUpdate,
    current_user: UserDocument = Depends(get_current_active_user),
    service: DirectoryService = Depends(get_directory_service),
) -> DirectoryEntryResponse:
    """Update directory profile for current active user."""
    return await service.update_profile(
        target_user_id=str(current_user.id),
        updates=updates,
        acting_user=current_user,
    )


@router.get(
    "/{user_id}",
    response_model=DirectoryEntryResponse,
    summary="Get directory profile by user ID",
    description="Retrieve the campus directory entry for a specific active member.",
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": ErrorResponse,
            "description": "Authentication token missing, invalid, or expired.",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": ErrorResponse,
            "description": "Directory entry not found or user is inactive.",
        },
    },
)
async def get_directory_entry_by_id(
    user_id: str,
    current_user: UserDocument = Depends(get_current_active_user),
    service: DirectoryService = Depends(get_directory_service),
) -> DirectoryEntryResponse:
    """Return directory entry for target user ID."""
    return await service.get_entry(user_id=user_id)


@router.put(
    "/{user_id}",
    response_model=DirectoryEntryResponse,
    summary="Administratively update user directory profile",
    description="Update campus profile details for any user. Restricted to 'admin' and 'management' roles.",
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": ErrorResponse,
            "description": "Authentication token missing, invalid, or expired.",
        },
        status.HTTP_403_FORBIDDEN: {
            "model": ErrorResponse,
            "description": "Forbidden: Requires 'admin' or 'management' role.",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": ErrorResponse,
            "description": "Target user not found or inactive.",
        },
    },
)
async def update_user_directory_profile(
    user_id: str,
    updates: DirectoryProfileUpdate,
    current_user: UserDocument = Depends(require_roles("admin", "management")),
    service: DirectoryService = Depends(get_directory_service),
) -> DirectoryEntryResponse:
    """Administratively update a user's directory profile."""
    return await service.update_profile(
        target_user_id=user_id,
        updates=updates,
        acting_user=current_user,
    )
