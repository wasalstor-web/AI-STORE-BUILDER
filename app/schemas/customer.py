"""Customer schemas."""

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, EmailStr


class CustomerResponse(BaseModel):
    id: UUID
    store_id: UUID
    name: str
    email: str
    phone: str | None = None
    total_orders: int = 0
    total_spent: Decimal = Decimal("0.00")
    last_order_date: datetime | None = None
    addresses: list[dict] | None = None
    tags: list[str] | None = None
    notes: str | None = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CustomerListResponse(BaseModel):
    customers: list[CustomerResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class CustomerUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    tags: list[str] | None = None
    notes: str | None = None
    is_active: bool | None = None


class CustomerStats(BaseModel):
    total_customers: int = 0
    new_customers_this_month: int = 0
    returning_customers: int = 0
    average_order_value: Decimal = Decimal("0.00")
