"""Shared response wrapper."""

from typing import Any, Optional
from pydantic import BaseModel


class APIResponse(BaseModel):
    """Standard API response envelope."""
    success: bool = True
    message: str = ""
    data: Optional[Any] = None
