"""Product schemas — request & response models."""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    """POST /stores/{store_id}/products"""

    name: str = Field(..., min_length=1, max_length=255, description="اسم المنتج")
    description: str | None = None
    short_description: str | None = Field(None, max_length=500)
    category_id: uuid.UUID | None = None

    # Pricing
    price: Decimal = Field(..., gt=0, decimal_places=2, description="السعر")
    compare_at_price: Decimal | None = Field(None, gt=0, decimal_places=2)
    cost_price: Decimal | None = Field(None, ge=0, decimal_places=2)
    currency: str = Field(default="SAR", pattern="^[A-Z]{3}$")

    # Inventory
    sku: str | None = Field(None, max_length=100)
    barcode: str | None = Field(None, max_length=100)
    stock_quantity: int = Field(default=0, ge=0)
    track_inventory: bool = True
    allow_backorder: bool = False

    # Media
    image_url: str | None = Field(None, max_length=500)
    images: list[str] = Field(default=[])

    # SEO
    meta_title: str | None = Field(None, max_length=255)
    meta_description: str | None = Field(None, max_length=500)

    # Attributes
    attributes: dict | None = Field(default={})

    # Physical
    weight: Decimal | None = Field(None, ge=0)
    weight_unit: str = Field(default="kg", pattern="^(kg|g|lb|oz)$")

    # Flags
    is_active: bool = True
    is_featured: bool = False
    sort_order: int = Field(default=0, ge=0)


class ProductUpdate(BaseModel):
    """PATCH /products/{id}"""

    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    short_description: str | None = Field(None, max_length=500)
    category_id: uuid.UUID | None = None

    price: Decimal | None = Field(None, gt=0, decimal_places=2)
    compare_at_price: Decimal | None = Field(None, ge=0, decimal_places=2)
    cost_price: Decimal | None = Field(None, ge=0, decimal_places=2)

    sku: str | None = Field(None, max_length=100)
    stock_quantity: int | None = Field(None, ge=0)
    track_inventory: bool | None = None
    allow_backorder: bool | None = None

    image_url: str | None = Field(None, max_length=500)
    images: list[str] | None = None

    meta_title: str | None = Field(None, max_length=255)
    meta_description: str | None = Field(None, max_length=500)

    attributes: dict | None = None
    weight: Decimal | None = Field(None, ge=0)
    weight_unit: str | None = Field(None, pattern="^(kg|g|lb|oz)$")

    is_active: bool | None = None
    is_featured: bool | None = None
    sort_order: int | None = Field(None, ge=0)


class ProductResponse(BaseModel):
    id: uuid.UUID
    store_id: uuid.UUID
    category_id: uuid.UUID | None = None
    name: str
    slug: str
    description: str | None = None
    short_description: str | None = None
    price: Decimal
    compare_at_price: Decimal | None = None
    cost_price: Decimal | None = None
    currency: str
    sku: str | None = None
    barcode: str | None = None
    stock_quantity: int
    track_inventory: bool
    allow_backorder: bool
    image_url: str | None = None
    images: list | None = None
    meta_title: str | None = None
    meta_description: str | None = None
    attributes: dict | None = None
    weight: Decimal | None = None
    weight_unit: str
    is_active: bool
    is_featured: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int
