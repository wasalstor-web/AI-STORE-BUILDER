"""Order schemas — request & response models."""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field

# ── Cart / Checkout ──


class CartItem(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(..., gt=0, le=100)
    attributes: dict | None = Field(default={})


class CheckoutRequest(BaseModel):
    """POST /stores/{store_id}/checkout"""

    items: list[CartItem] = Field(..., min_length=1)
    customer_name: str = Field(..., min_length=2, max_length=255)
    customer_email: EmailStr
    customer_phone: str | None = Field(None, pattern=r"^\+?\d{8,15}$")
    shipping_address: dict = Field(
        ..., description="{ street, city, state, postal_code, country }"
    )
    payment_method: str = Field(default="cod", pattern="^(cod|mada|visa|apple_pay|stc_pay)$")
    customer_notes: str | None = Field(None, max_length=1000)


class OrderUpdateRequest(BaseModel):
    """PATCH /orders/{id} — admin updates"""

    status: str | None = Field(
        None,
        pattern="^(pending|paid|processing|shipped|delivered|completed|cancelled|refunded)$",
    )
    payment_status: str | None = Field(
        None,
        pattern="^(unpaid|paid|refunded|partially_refunded)$",
    )
    tracking_number: str | None = Field(None, max_length=255)
    shipping_method: str | None = Field(None, max_length=100)
    admin_notes: str | None = Field(None, max_length=2000)


# ── Responses ──


class OrderItemResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID | None = None
    product_name: str
    product_sku: str | None = None
    product_image: str | None = None
    quantity: int
    unit_price: Decimal
    total_price: Decimal
    attributes: dict | None = None

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: uuid.UUID
    store_id: uuid.UUID
    order_number: str
    customer_name: str
    customer_email: str
    customer_phone: str | None = None
    shipping_address: dict | None = None
    subtotal: Decimal
    shipping_cost: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    total: Decimal
    currency: str
    status: str
    payment_method: str | None = None
    payment_status: str
    tracking_number: str | None = None
    shipping_method: str | None = None
    customer_notes: str | None = None
    admin_notes: str | None = None
    items: list[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int
    page: int
    page_size: int


class OrderSummary(BaseModel):
    """Quick stats for dashboard"""

    total_orders: int
    total_revenue: Decimal
    pending_orders: int
    completed_orders: int
