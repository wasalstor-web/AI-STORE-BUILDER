"""Order & OrderItem models — customer purchases."""

import uuid
from decimal import Decimal
from typing import Optional, List

from sqlalchemy import (
    String, ForeignKey, Integer, Text, Numeric, Uuid, JSON, Boolean
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, generate_uuid7


class Order(Base, TimestampMixin):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=generate_uuid7
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("tenants.id"), nullable=False, index=True
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Order number (human-readable)
    order_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )

    # Customer info (no user account needed for storefront buyers)
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_email: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Shipping address
    shipping_address: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)
    # { street, city, state, postal_code, country }

    # Pricing
    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False, default=Decimal("0.00")
    )
    shipping_cost: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False, default=Decimal("0.00")
    )
    tax_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False, default=Decimal("0.00")
    )
    discount_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False, default=Decimal("0.00")
    )
    total: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False, default=Decimal("0.00")
    )
    currency: Mapped[str] = mapped_column(String(3), default="SAR", nullable=False)

    # Status
    status: Mapped[str] = mapped_column(
        String(50), default="pending", nullable=False, index=True
    )
    # pending → paid → processing → shipped → delivered → completed
    # OR pending → cancelled / refunded

    # Payment
    payment_method: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    payment_status: Mapped[str] = mapped_column(
        String(50), default="unpaid", nullable=False
    )
    # unpaid → paid → refunded → partially_refunded
    payment_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    payment_metadata: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)

    # Shipping
    shipping_method: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    tracking_number: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    shipping_metadata: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)

    # Notes
    customer_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    admin_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    store: Mapped["Store"] = relationship("Store", back_populates="orders")
    items: Mapped[List["OrderItem"]] = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Order {self.order_number} — {self.total} {self.currency}>"


class OrderItem(Base, TimestampMixin):
    __tablename__ = "order_items"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=generate_uuid7
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("products.id", ondelete="SET NULL"), nullable=True
    )

    # Snapshot at purchase time (product may change later)
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    product_sku: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    product_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )
    total_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )

    # Variant attributes (e.g., {"color": "أحمر", "size": "XL"})
    attributes: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)

    # Relationships
    order: Mapped["Order"] = relationship("Order", back_populates="items")
    product: Mapped[Optional["Product"]] = relationship("Product", back_populates="order_items")

    def __repr__(self) -> str:
        return f"<OrderItem {self.product_name} x{self.quantity}>"
