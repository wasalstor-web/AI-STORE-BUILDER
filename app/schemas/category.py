"""Category schemas — request & response models."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    """POST /stores/{store_id}/categories"""

    name: str = Field(..., min_length=1, max_length=255, description="اسم القسم")
    description: str | None = Field(None, max_length=1000)
    image_url: str | None = Field(None, max_length=500)
    parent_id: uuid.UUID | None = None
    sort_order: int = Field(default=0, ge=0)
    is_active: bool = True


class CategoryUpdate(BaseModel):
    """PATCH /categories/{id}"""

    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, max_length=1000)
    image_url: str | None = Field(None, max_length=500)
    parent_id: uuid.UUID | None = None
    sort_order: int | None = Field(None, ge=0)
    is_active: bool | None = None


class CategoryResponse(BaseModel):
    id: uuid.UUID
    store_id: uuid.UUID
    name: str
    slug: str
    description: str | None = None
    image_url: str | None = None
    parent_id: uuid.UUID | None = None
    sort_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CategoryListResponse(BaseModel):
    items: list[CategoryResponse]
    total: int
