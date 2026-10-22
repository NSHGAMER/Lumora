from datetime import datetime
from typing import Literal
from pydantic import Field, model_validator
from app.schemas.academic import StrictModel
from app.schemas.user import CanonicalRole


class CampusRecord(StrictModel):
    kind: Literal["announcement", "event", "document"]
    title: str = Field(min_length=3, max_length=160)
    body: str = Field(min_length=5, max_length=20000)
    roles: list[CanonicalRole] = Field(min_length=1, max_length=5)
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    approved: bool = False

    @model_validator(mode="after")
    def dates(self):
        if self.kind == "event" and not self.starts_at:
            raise ValueError("Calendar events require a start time")
        for date in (self.starts_at, self.ends_at):
            if date and date.tzinfo is None:
                raise ValueError("Calendar times must include a timezone")
        if self.ends_at and (not self.starts_at or self.ends_at <= self.starts_at):
            raise ValueError("Event end must follow its start")
        return self


class WorkflowDefinition(StrictModel):
    name: str = Field(min_length=3, max_length=100)
    trigger: Literal["announcement.created", "timetable.published", "request.decided", "scheduled"]
    action: Literal["notify"] = "notify"
    enabled: bool = True
    max_attempts: int = Field(default=3, ge=1, le=5)
    run_at: datetime | None = None
    title: str = Field(default="Academic reminder", min_length=3, max_length=160)
    body: str = Field(default="Review your campus calendar.", min_length=5, max_length=1000)
    roles: list[CanonicalRole] = Field(default_factory=lambda: ["student", "faculty"], min_length=1, max_length=5)

    @model_validator(mode="after")
    def scheduled(self):
        if self.trigger == "scheduled" and (not self.run_at or not self.run_at.tzinfo):
            raise ValueError("Scheduled workflows require a timezone-aware run_at")
        return self
