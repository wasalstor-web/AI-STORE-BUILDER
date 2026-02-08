"""Order schemas — request & response models."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List

from pydantic import BaseModel, Field, EmailStr


# ── Cart / Checkout ──

class CartItem(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(..., gt=0, le=100)
    attributes: Optional[dict] = Field(default={})


class CheckoutRequest(BaseModel):
    """POST /stores/{store_id}/checkout"""
    items: List[CartItem] = Field(..., min_length=1)
    customer_name: str = Field(..., min_length=2, max_length=255)
    customer_email: EmailStr
    customer_phone: Optional[str] = Field(None, pattern=r"^\+?\d{8,15}$")
    shipping_address: dict = Field(
        ..., description="{ street, city, state, postal_code, country }"
    )
    payment_method: str = Field(
        default="cod", pattern="^(cod|mada|visa|apple_pay|stc_pay)$"
    )
    customer_notes: Optional[str] = Field(None, max_length=1000)


class OrderUpdateRequest(BaseModel):
    """PATCH /orders/{id} — admin updates"""
    status: Optional[str] = Field(
        None,
        pattern="^(pending|paid|processing|shipped|delivered|completed|cancelled|refunded)$",
    )
    payment_status: Optional[str] = Field(
        None,
        pattern="^(unpaid|paid|refunded|partially_refunded)$",
    )
    tracking_number: Optional[str] = Field(None, max_length=255)
    shipping_method: Optional[str] = Field(None, max_length=100)
    admin_notes: Optional[str] = Field(None, max_length=2000)


# ── Responses ──

class OrderItemResponse(BaseModel):
    id: uuid.UUID
    product_id: Optional[uuid.UUID] = None
    product_name: str
    product_sku: Optional[str] = None
    product_image: Optional[str] = None
    quantity: int
    unit_price: Decimal
    total_price: Decimal
    attributes: Optional[dict] = None

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: uuid.UUID
    store_id: uuid.UUID
    order_number: str
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    shipping_address: Optional[dict] = None
    subtotal: Decimal
    shipping_cost: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    total: Decimal
    currency: str
    status: str
    payment_method: Optional[str] = None
    payment_status: str
    tracking_number: Optional[str] = None
    shipping_method: Optional[str] = None
    customer_notes: Optional[str] = None
    admin_notes: Optional[str] = None
    items: List[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    items: List[OrderResponse]
    total: int
    page: int
    page_size: int


class OrderSummary(BaseModel):
    """Quick stats for dashboard"""
    total_orders: int
    total_revenue: Decimal
    pending_orders: int
    completed_orders: int
