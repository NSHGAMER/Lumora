"""Bounded scheduling search with a single validator shared by every write path."""
import random
import time
from collections import Counter
from uuid import uuid4
from fastapi import HTTPException
from app.schemas.academic import Catalog, DAYS, Session


def validate_schedule(catalog: Catalog, sessions: list[Session], complete: bool = False) -> None:
    subjects = {s.id: s for s in catalog.subjects}
    teachers = {t.user_id: t for t in catalog.teachers}
    rooms = {r.id: r for r in catalog.rooms}
    occupied: set[tuple] = set()
    counts: Counter = Counter()
    workload: Counter = Counter()
    ids = set()
    for session in sessions:
        if session.id in ids:
            raise HTTPException(409, "Duplicate session ID")
        ids.add(session.id)
        subject = subjects.get(session.subject_id)
        room = rooms.get(session.room_id)
        if not subject or not room or room.kind != subject.kind:
            raise HTTPException(409, "Unknown subject or incompatible room type")
        teacher = teachers[subject.teacher_id]
        end = session.period + subject.block_size
        if end > len(catalog.periods):
            raise HTTPException(409, "Consecutive session extends beyond the last period")
        for p in range(session.period, end):
            if p > session.period and catalog.periods[p - 1].end != catalog.periods[p].start:
                raise HTTPException(409, "Consecutive laboratory periods cannot cross a break")
            if any(x.day == session.day and x.period == p for x in teacher.unavailable):
                raise HTTPException(409, "Faculty is unavailable during this period")
            for kind, resource in [("class", subject.class_id), ("faculty", subject.teacher_id), ("room", session.room_id)]:
                key = (session.day, p, kind, resource)
                if key in occupied:
                    raise HTTPException(409, f"Scheduling conflict: {kind} is already occupied on {session.day}, period {p + 1}")
                occupied.add(key)
        counts[subject.id] += subject.block_size
        workload[subject.teacher_id] += subject.block_size
        if workload[subject.teacher_id] > teacher.max_periods:
            raise HTTPException(409, "Faculty weekly workload limit exceeded")
        if counts[subject.id] > subject.weekly_periods:
            raise HTTPException(409, "Subject weekly allocation exceeded")
    if complete and any(counts[s.id] != s.weekly_periods for s in catalog.subjects):
        raise HTTPException(409, "Generate every class before publication: subject allocations are incomplete")


def generate_schedule(catalog: Catalog, existing: list[Session], class_id: str) -> list[Session]:
    if class_id not in {c.id for c in catalog.classes}:
        raise HTTPException(422, "Unknown class")
    subjects = {s.id: s for s in catalog.subjects}
    retained = [s for s in existing if subjects[s.subject_id].class_id != class_id]
    tasks = [s for s in catalog.subjects if s.class_id == class_id
             for _ in range(s.weekly_periods // s.block_size)]
    if not tasks:
        raise HTTPException(409, "Allocate subjects and faculty to this class first")
    validate_schedule(catalog, retained)
    deadline = time.monotonic() + 5
    # A bounded randomized greedy search, not a proof of infeasibility.
    # Longer labs go first; every candidate uses the same conflict validator.
    for attempt in range(60):
        rng = random.Random(attempt)
        rng.shuffle(tasks)
        tasks.sort(key=lambda s: -s.block_size)
        result = list(retained)
        for subject in tasks:
            choices = [(d, p, r.id) for d in DAYS for p in range(len(catalog.periods))
                       for r in catalog.rooms if r.kind == subject.kind]
            rng.shuffle(choices)
            choices.sort(key=lambda choice: sum(x.day == choice[0] and x.subject_id == subject.id for x in result))
            for day, period, room_id in choices:
                if time.monotonic() > deadline:
                    raise HTTPException(409, "Scheduling search timed out. Reduce the allocation or adjust availability and retry.")
                candidate = Session(id=str(uuid4()), subject_id=subject.id, day=day, period=period, room_id=room_id)
                try:
                    validate_schedule(catalog, result + [candidate])
                except HTTPException:
                    continue
                result.append(candidate)
                break
            else:
                break
        else:
            return result
    raise HTTPException(409, "No valid timetable found within the search limit. Review rooms, availability, consecutive blocks and workload; a valid solution may still exist.")
