"""API Root Information schema."""

from pydantic import BaseModel, Field


class ApiInfoResponse(BaseModel):
    """Structured information response for the API root."""

    name: str = Field(description="Platform application title")
    version: str = Field(description="Semantic version of the API")
    status: str = Field(default="online", description="Operational state")
    environment: str = Field(description="Current deployment environment")
    documentation_url: str = Field(description="Interactive OpenAPI documentation path")
    api_prefix: str = Field(description="Current API version root prefix")
