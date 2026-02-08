"""Store schemas — generation request & response."""

import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class BrandingConfig(BaseModel):
    primary_color: str = Field(default="#8B4513", description="اللون الأساسي")
    style: str = Field(default="modern", pattern="^(luxury|modern|minimal|classic)$")


class PaymentConfig(BaseModel):
    gateway: str = Field(default="moyasar", pattern="^(moyasar|tap|stripe)$")
    methods: List[str] = Field(default=["mada", "visa"])


class ShippingConfig(BaseModel):
    provider: str = Field(default="aramex", pattern="^(aramex|smsa|dhl|custom)$")
    zones: List[str] = Field(default=["SA"])


class StoreGenerateRequest(BaseModel):
    """Request body for POST /stores/generate"""
    name: str = Field(..., min_length=2, max_length=255, description="اسم المتجر")
    store_type: str = Field(..., min_length=2, max_length=100, description="نوع المتجر (مثل: عطور، ملابس)")
    language: str = Field(default="ar", pattern="^(ar|en|both)$")
    branding: Optional[BrandingConfig] = BrandingConfig()
    payment: Optional[PaymentConfig] = PaymentConfig()
    shipping: Optional[ShippingConfig] = ShippingConfig()
    features: Optional[List[str]] = Field(default=[])


class StoreUpdateRequest(BaseModel):
    """Request body for PATCH /stores/{id}"""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    language: Optional[str] = Field(None, pattern="^(ar|en|both)$")
    status: Optional[str] = Field(None, pattern="^(pending|generating|active|paused|archived)$")
    html_content: Optional[str] = Field(None, description="HTML content of the store")
    config: Optional[dict] = Field(None, description="Store configuration")
    layout: Optional[List[dict]] = Field(None, description="Editor layout sections")


class StoreResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    slug: str
    store_type: str
    language: str
    config: Optional[dict] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class StoreListResponse(BaseModel):
    stores: List[StoreResponse]
    total: int
