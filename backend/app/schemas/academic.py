"""Academic contracts. All identity references point to canonical Lumora users."""
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator

Day = Literal["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class Period(StrictModel):
    id: str = Field(min_length=1, max_length=40)
    start: str = Field(pattern=r"^(?:[01]\d|2[0-3]):[0-5]\d$")
    end: str = Field(pattern=r"^(?:[01]\d|2[0-3]):[0-5]\d$")


class AcademicClass(StrictModel):
    id: str = Field(min_length=1, max_length=60)
    name: str = Field(min_length=1, max_length=100)
    semester: str = Field(min_length=1, max_length=60)
    section: str = Field(min_length=1, max_length=40)


class Room(StrictModel):
    id: str = Field(min_length=1, max_length=60)
    name: str = Field(min_length=1, max_length=100)
    kind: Literal["lecture", "lab"] = "lecture"


class Slot(StrictModel):
    day: Day
    period: int = Field(ge=0, le=11)


class Teacher(StrictModel):
    user_id: str = Field(min_length=1, max_length=80)
    max_periods: int = Field(default=24, ge=1, le=72)
    unavailable: list[Slot] = Field(default_factory=list, max_length=72)


class Subject(StrictModel):
    id: str = Field(min_length=1, max_length=60)
    name: str = Field(min_length=1, max_length=120)
    class_id: str
    teacher_id: str
    weekly_periods: int = Field(ge=1, le=30)
    block_size: int = Field(default=1, ge=1, le=4)
    kind: Literal["lecture", "lab"] = "lecture"


class Enrollment(StrictModel):
    user_id: str
    class_id: str


class Catalog(StrictModel):
    classes: list[AcademicClass] = Field(default_factory=list, max_length=100)
    rooms: list[Room] = Field(default_factory=list, max_length=100)
    periods: list[Period] = Field(default_factory=list, max_length=12)
    teachers: list[Teacher] = Field(default_factory=list, max_length=200)
    subjects: list[Subject] = Field(default_factory=list, max_length=1000)
    enrollments: list[Enrollment] = Field(default_factory=list, max_length=5000)

    @model_validator(mode="after")
    def validate_catalog(self):
        for items, key in [(self.classes, "id"), (self.rooms, "id"), (self.periods, "id"),
                           (self.teachers, "user_id"), (self.subjects, "id"), (self.enrollments, "user_id")]:
            ids = [getattr(x, key) for x in items]
            if len(set(ids)) != len(ids):
                raise ValueError(f"Duplicate {key} in catalog")
        classes = {x.id for x in self.classes}
        teachers = {x.user_id for x in self.teachers}
        for index, period in enumerate(self.periods):
            if period.start >= period.end or (index and period.start < self.periods[index - 1].end):
                raise ValueError("Periods must be ordered, non-overlapping and end after they start")
        for subject in self.subjects:
            if subject.class_id not in classes or subject.teacher_id not in teachers:
                raise ValueError("Subject references an unknown class or faculty allocation")
            if subject.weekly_periods % subject.block_size:
                raise ValueError("Weekly periods must be divisible by consecutive block size")
        if any(x.class_id not in classes for x in self.enrollments):
            raise ValueError("Enrollment references an unknown class")
        if any(s.period >= len(self.periods) for t in self.teachers for s in t.unavailable):
            raise ValueError("Unavailable period is outside the calendar")
        return self


class Session(StrictModel):
    id: str
    subject_id: str
    day: Day
    period: int = Field(ge=0, le=11)
    room_id: str


class Revision(StrictModel):
    revision: int = Field(ge=0)


class CatalogUpdate(Revision):
    catalog: Catalog


class GenerateRequest(Revision):
    class_id: str


class SessionMove(Revision):
    day: Day
    period: int = Field(ge=0, le=11)
    room_id: str


class ChangeRequest(SessionMove):
    session_id: str
    reason: str = Field(min_length=8, max_length=600)


class Decision(Revision):
    status: Literal["approved", "rejected"]
