"""Tenant schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class TenantUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=255)
    plan: str | None = Field(None, pattern="^(free|pro|enterprise)$")
    settings: dict | None = None


class TenantResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    plan: str
    is_active: bool
    settings: dict | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
