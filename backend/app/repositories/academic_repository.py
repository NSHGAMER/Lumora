"""Atomic campus schedule aggregate; canonical users remain in users collection."""
from copy import deepcopy
from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError
from app.schemas.academic import Catalog


class AcademicRepository:
    def __init__(self, database):
        self.collection = database["timetable_plans"]

    async def read(self):
        doc = await self.collection.find_one({"_id": "campus"})
        return doc or {"_id": "campus", "revision": 0, "catalog": Catalog().model_dump(),
                       "draft": [], "published": None, "requests": [], "outbox": []}

    async def save(self, doc, revision):
        updated = deepcopy(doc)
        updated["revision"] = revision + 1
        try:
            result = await self.collection.replace_one(
                {"_id": "campus", "revision": revision}, updated, upsert=revision == 0)
        except DuplicateKeyError:
            raise HTTPException(409, "Timetable changed. Reload before editing.")
        if not result.matched_count and not result.upserted_id:
            raise HTTPException(409, "Timetable changed. Reload before editing.")
        return updated
