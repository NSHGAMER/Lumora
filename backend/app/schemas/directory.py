"""Campus Directory domain schemas for Lumora Phase 2B.5.

Establishes:
- Campus-specific profile data (department, title, office, bio)
- Separation between internal document schema and public API response
- Strict exclusion of security internals (password_hash, tokens, sessions)
- Typed request contracts for self-updates and administrative edits
"""

from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import CanonicalRole


class DirectoryProfileDocument(BaseModel):
    """Internal MongoDB representation in 'directory_profiles' collection."""

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: Optional[str] = Field(default=None, alias="_id", description="MongoDB ObjectId string")
    user_id: str = Field(description="Foreign reference to users._id")
    department: str = Field(default="General Campus", description="Academic or administrative department")
    title: Optional[str] = Field(default=None, description="Official campus designation or rank")
    office_location: Optional[str] = Field(default=None, description="Physical campus office/room locator")
    phone_extension: Optional[str] = Field(default=None, description="Campus telephone extension")
    bio: Optional[str] = Field(default=None, description="Brief academic/professional biography")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Profile creation timestamp",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Profile last update timestamp",
    )


class DirectoryProfileUpdate(BaseModel):
    """Client request schema for updating campus directory information."""

    model_config = ConfigDict(str_strip_whitespace=True)

    department: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100,
        description="Department or faculty division",
    )
    title: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Official title, role rank, or designation",
    )
    office_location: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Campus building room or laboratory locator",
    )
    phone_extension: Optional[str] = Field(
        default=None,
        max_length=50,
        description="Internal campus phone extension or desk number",
    )
    bio: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Short biographical summary or academic interests",
    )


class DirectoryEntryResponse(BaseModel):
    """Public campus directory entry model returned by API endpoints.

    SECURITY INVARIANT:
    Strictly excludes password_hash, tokens, session IDs, and database internals.
    """

    model_config = ConfigDict(from_attributes=True)

    id: str = Field(description="Unique system user identifier")
    institutional_id: str = Field(description="Official student ID or faculty identifier")
    institutional_email: str = Field(description="Official university email address")
    full_name: str = Field(description="Full legal or professional name")
    role: CanonicalRole = Field(description="Assigned RBAC role")
    is_active: bool = Field(description="Account active status")
    department: str = Field(description="Campus department or academic division")
    title: Optional[str] = Field(default=None, description="Designation or academic title")
    office_location: Optional[str] = Field(default=None, description="Office or workstation locator")
    phone_extension: Optional[str] = Field(default=None, description="Internal campus phone number")
    bio: Optional[str] = Field(default=None, description="Brief academic or role biography")
    created_at: datetime = Field(description="User creation timestamp")
    updated_at: datetime = Field(description="Profile update timestamp")


class DirectoryListResponse(BaseModel):
    """Paginated response envelope for directory search and browsing."""

    items: List[DirectoryEntryResponse] = Field(description="List of matching directory entries")
    total: int = Field(description="Total number of matching active records")
    page: int = Field(description="Current page index (1-based)")
    page_size: int = Field(description="Page size limit")
