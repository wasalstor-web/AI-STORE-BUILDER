"""Review schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, field_validator


class ReviewCreate(BaseModel):
    product_id: UUID
    customer_name: str
    customer_email: str
    rating: int
    title: str | None = None
    comment: str | None = None

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v: int) -> int:
        if v < 1 or v > 5:
            raise ValueError("Rating must be between 1 and 5")
        return v


class ReviewResponse(BaseModel):
    id: UUID
    store_id: UUID
    product_id: UUID
    customer_name: str
    customer_email: str
    rating: int
    title: str | None = None
    comment: str | None = None
    is_approved: bool
    is_featured: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ReviewListResponse(BaseModel):
    reviews: list[ReviewResponse]
    total: int
    page: int
    per_page: int


class ReviewUpdate(BaseModel):
    is_approved: bool | None = None
    is_featured: bool | None = None
