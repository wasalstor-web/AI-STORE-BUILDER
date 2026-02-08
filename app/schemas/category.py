"""Category schemas — request & response models."""

import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    """POST /stores/{store_id}/categories"""
    name: str = Field(..., min_length=1, max_length=255, description="اسم القسم")
    description: Optional[str] = Field(None, max_length=1000)
    image_url: Optional[str] = Field(None, max_length=500)
    parent_id: Optional[uuid.UUID] = None
    sort_order: int = Field(default=0, ge=0)
    is_active: bool = True


class CategoryUpdate(BaseModel):
    """PATCH /categories/{id}"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    image_url: Optional[str] = Field(None, max_length=500)
    parent_id: Optional[uuid.UUID] = None
    sort_order: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class CategoryResponse(BaseModel):
    id: uuid.UUID
    store_id: uuid.UUID
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[uuid.UUID] = None
    sort_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CategoryListResponse(BaseModel):
    items: List[CategoryResponse]
    total: int
