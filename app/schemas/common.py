"""Shared response wrapper."""

from typing import Any

from pydantic import BaseModel


class APIResponse(BaseModel):
    """Standard API response envelope."""

    success: bool = True
    message: str = ""
    data: Any | None = None
