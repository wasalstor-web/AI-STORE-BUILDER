"""Product schemas — request & response models."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List

from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    """POST /stores/{store_id}/products"""
    name: str = Field(..., min_length=1, max_length=255, description="اسم المنتج")
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    category_id: Optional[uuid.UUID] = None

    # Pricing
    price: Decimal = Field(..., gt=0, decimal_places=2, description="السعر")
    compare_at_price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    cost_price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    currency: str = Field(default="SAR", pattern="^[A-Z]{3}$")

    # Inventory
    sku: Optional[str] = Field(None, max_length=100)
    barcode: Optional[str] = Field(None, max_length=100)
    stock_quantity: int = Field(default=0, ge=0)
    track_inventory: bool = True
    allow_backorder: bool = False

    # Media
    image_url: Optional[str] = Field(None, max_length=500)
    images: List[str] = Field(default=[])

    # SEO
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = Field(None, max_length=500)

    # Attributes
    attributes: Optional[dict] = Field(default={})

    # Physical
    weight: Optional[Decimal] = Field(None, ge=0)
    weight_unit: str = Field(default="kg", pattern="^(kg|g|lb|oz)$")

    # Flags
    is_active: bool = True
    is_featured: bool = False
    sort_order: int = Field(default=0, ge=0)


class ProductUpdate(BaseModel):
    """PATCH /products/{id}"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    category_id: Optional[uuid.UUID] = None

    price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    compare_at_price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    cost_price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)

    sku: Optional[str] = Field(None, max_length=100)
    stock_quantity: Optional[int] = Field(None, ge=0)
    track_inventory: Optional[bool] = None
    allow_backorder: Optional[bool] = None

    image_url: Optional[str] = Field(None, max_length=500)
    images: Optional[List[str]] = None

    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = Field(None, max_length=500)

    attributes: Optional[dict] = None
    weight: Optional[Decimal] = Field(None, ge=0)
    weight_unit: Optional[str] = Field(None, pattern="^(kg|g|lb|oz)$")

    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    sort_order: Optional[int] = Field(None, ge=0)


class ProductResponse(BaseModel):
    id: uuid.UUID
    store_id: uuid.UUID
    category_id: Optional[uuid.UUID] = None
    name: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Decimal
    compare_at_price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    currency: str
    sku: Optional[str] = None
    barcode: Optional[str] = None
    stock_quantity: int
    track_inventory: bool
    allow_backorder: bool
    image_url: Optional[str] = None
    images: Optional[list] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    attributes: Optional[dict] = None
    weight: Optional[Decimal] = None
    weight_unit: str
    is_active: bool
    is_featured: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
