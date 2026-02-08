"""Product model — items for sale in a store."""

from __future__ import annotations

import uuid
from decimal import Decimal

from sqlalchemy import JSON, Boolean, ForeignKey, Integer, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, generate_uuid7


class Product(Base, TimestampMixin):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=generate_uuid7)
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("tenants.id"), nullable=False, index=True
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # Core fields
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    short_description: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Pricing
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    compare_at_price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    cost_price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="SAR", nullable=False)

    # Inventory
    sku: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    barcode: Mapped[str | None] = mapped_column(String(100), nullable=True)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    track_inventory: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    allow_backorder: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Media
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    images: Mapped[list | None] = mapped_column(JSON, default=list)

    # SEO & metadata
    meta_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    meta_description: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Attributes (size, color, weight, etc.)
    attributes: Mapped[dict | None] = mapped_column(JSON, default=dict)

    # Physical
    weight: Mapped[Decimal | None] = mapped_column(Numeric(8, 2), nullable=True)
    weight_unit: Mapped[str] = mapped_column(String(10), default="kg", nullable=False)

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    store: Mapped[Store] = relationship("Store", back_populates="products")
    category: Mapped[Category | None] = relationship("Category", back_populates="products")
    order_items: Mapped[list[OrderItem]] = relationship("OrderItem", back_populates="product")

    def __repr__(self) -> str:
        return f"<Product {self.slug} — {self.price} {self.currency}>"
