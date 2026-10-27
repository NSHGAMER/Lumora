from copy import deepcopy
import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from app.schemas.academic import Catalog, Session
from app.services.scheduling import generate_schedule, validate_schedule


def example_catalog():
    return {"classes": [{"id": "a", "name": "BCA", "semester": "3", "section": "A"},
                        {"id": "b", "name": "BCA", "semester": "3", "section": "B"}],
            "rooms": [{"id": "r1", "name": "Room 1", "kind": "lecture"}, {"id": "lab", "name": "Lab", "kind": "lab"}],
            "periods": [{"id": "p1", "start": "09:00", "end": "10:00"}, {"id": "p2", "start": "10:00", "end": "11:00"}, {"id": "p3", "start": "11:15", "end": "12:15"}],
            "teachers": [{"user_id": "teacher", "max_periods": 12, "unavailable": []}],
            "subjects": [{"id": "math", "name": "Mathematics", "class_id": "a", "teacher_id": "teacher", "weekly_periods": 2, "block_size": 1, "kind": "lecture"},
                         {"id": "coding", "name": "Programming Lab", "class_id": "b", "teacher_id": "teacher", "weekly_periods": 2, "block_size": 2, "kind": "lab"}],
            "enrollments": []}


def test_generated_schedule_is_complete_and_labs_consecutive():
    catalog = Catalog(**example_catalog())
    sessions = generate_schedule(catalog, [], "a")
    sessions = generate_schedule(catalog, sessions, "b")
    validate_schedule(catalog, sessions, complete=True)
    lab = next(s for s in sessions if s.subject_id == "coding")
    assert lab.period == 0  # Only 09:00 and 10:00 form a consecutive block.
    assert len(sessions) == 3


@pytest.mark.parametrize("conflict", ["room", "faculty", "class"])
def test_resource_conflicts(conflict):
    data = example_catalog()
    data["teachers"].append({"user_id": "other", "max_periods": 10, "unavailable": []})
    data["rooms"].append({"id": "r2", "name": "Room 2", "kind": "lecture"})
    data["subjects"].append({"id": "other", "name": "Other", "class_id": "a" if conflict == "class" else "b", "teacher_id": "teacher" if conflict == "faculty" else "other", "weekly_periods": 1, "block_size": 1, "kind": "lecture"})
    sessions = [Session(id="s1", subject_id="math", day="Monday", period=0, room_id="r1"),
                Session(id="s2", subject_id="other", day="Monday", period=0, room_id="r1" if conflict == "room" else "r2")]
    with pytest.raises(HTTPException, match=conflict):
        validate_schedule(Catalog(**data), sessions)


@pytest.mark.parametrize("period", [1, 2])
def test_lab_cannot_cross_break_or_day_end(period):
    with pytest.raises(HTTPException):
        validate_schedule(Catalog(**example_catalog()), [Session(id="lab", subject_id="coding", day="Monday", period=period, room_id="lab")])


def test_faculty_availability_and_workload():
    data = example_catalog()
    data["teachers"][0]["unavailable"] = [{"day": "Monday", "period": 0}]
    session = Session(id="s1", subject_id="math", day="Monday", period=0, room_id="r1")
    with pytest.raises(HTTPException, match="unavailable"):
        validate_schedule(Catalog(**data), [session])
    data["teachers"][0].update(unavailable=[], max_periods=1)
    with pytest.raises(HTTPException, match="workload"):
        validate_schedule(Catalog(**data), [session, session.model_copy(update={"id": "s2", "day": "Tuesday"})])


@pytest.mark.parametrize("change", ["duplicate", "unknown", "odd_lab", "overlap", "enrollment"])
def test_catalog_rejects_invalid_configuration(change):
    data = deepcopy(example_catalog())
    if change == "duplicate": data["classes"].append(data["classes"][0])
    if change == "unknown": data["subjects"][0]["teacher_id"] = "missing"
    if change == "odd_lab": data["subjects"][1]["weekly_periods"] = 3
    if change == "overlap": data["periods"][1]["start"] = "09:30"
    if change == "enrollment": data["enrollments"] = [{"user_id": "student", "class_id": "missing"}]
    with pytest.raises(ValidationError): Catalog(**data)


def test_incomplete_timetable_cannot_publish():
    with pytest.raises(HTTPException, match="incomplete"):
        validate_schedule(Catalog(**example_catalog()), [], complete=True)


def test_unknown_class_and_impossible_workload():
    catalog = Catalog(**example_catalog())
    with pytest.raises(HTTPException, match="Unknown class"):
        generate_schedule(catalog, [], "unknown")
    catalog.teachers[0].max_periods = 1
    with pytest.raises(HTTPException, match="No valid timetable|timed out"):
        generate_schedule(catalog, [], "b")
