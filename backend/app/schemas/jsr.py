from typing import Literal
from pydantic import Field
from app.schemas.academic import StrictModel


class ChatTurn(StrictModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(StrictModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[ChatTurn] = Field(default_factory=list, max_length=6)


class GeneratedAnswer(StrictModel):
    answer: str = Field(min_length=1, max_length=6000)
    source_ids: list[str] = Field(max_length=12)
    kind: Literal["retrieved_facts", "suggestion", "clarification"]
