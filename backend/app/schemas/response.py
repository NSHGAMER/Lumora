"""Standardized response envelope schemas for Lumora backend.

Adheres to RULE 11:
Backend errors must return standardized, structured JSON error responses with
clear machine-readable error codes and safe human-readable messages.
"""

from typing import Any, Optional
from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    """Machine-readable and human-safe error payload."""

    code: str = Field(description="Unique machine-readable error classification code")
    message: str = Field(description="Human-readable safe explanation of the error condition")
    details: Optional[Any] = Field(default=None, description="Granular error diagnostics or field validation issues")


class ErrorResponse(BaseModel):
    """Envelope returned for all API error exceptions."""

    success: bool = Field(default=False, description="Flag indicating failure")
    error: ErrorDetail = Field(description="Structured error information")


class StandardResponse(BaseModel):
    """Standardized wrapper for non-trivial domain responses."""

    success: bool = Field(default=True, description="Flag indicating success")
    data: Optional[Any] = Field(default=None, description="Primary payload data")
