"""Coupon schemas."""

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, field_validator


class CouponCreate(BaseModel):
    code: str
    description: str | None = None
    discount_type: str = "percentage"  # percentage | fixed
    discount_value: Decimal
    min_order_amount: Decimal | None = None
    max_discount_amount: Decimal | None = None
    max_uses: int | None = None
    max_uses_per_customer: int | None = None
    starts_at: datetime | None = None
    expires_at: datetime | None = None
    is_active: bool = True

    @field_validator("code")
    @classmethod
    def normalize_code(cls, v: str) -> str:
        return v.strip().upper()

    @field_validator("discount_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in ("percentage", "fixed"):
            raise ValueError("discount_type must be 'percentage' or 'fixed'")
        return v

    @field_validator("discount_value")
    @classmethod
    def validate_value(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("discount_value must be positive")
        return v


class CouponUpdate(BaseModel):
    description: str | None = None
    discount_type: str | None = None
    discount_value: Decimal | None = None
    min_order_amount: Decimal | None = None
    max_discount_amount: Decimal | None = None
    max_uses: int | None = None
    max_uses_per_customer: int | None = None
    starts_at: datetime | None = None
    expires_at: datetime | None = None
    is_active: bool | None = None


class CouponResponse(BaseModel):
    id: UUID
    store_id: UUID
    code: str
    description: str | None = None
    discount_type: str
    discount_value: Decimal
    min_order_amount: Decimal | None = None
    max_discount_amount: Decimal | None = None
    max_uses: int | None = None
    used_count: int = 0
    max_uses_per_customer: int | None = None
    starts_at: datetime | None = None
    expires_at: datetime | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CouponListResponse(BaseModel):
    coupons: list[CouponResponse]
    total: int


class CouponValidateRequest(BaseModel):
    code: str
    order_amount: Decimal


class CouponValidateResponse(BaseModel):
    valid: bool
    discount_amount: Decimal = Decimal("0.00")
    message: str = ""
