"""Category model — product categories within a store."""

from __future__ import annotations

import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, generate_uuid7


class Category(Base, TimestampMixin):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=generate_uuid7)
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("tenants.id"), nullable=False, index=True
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Self-referential parent
    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    store: Mapped[Store] = relationship("Store", back_populates="categories")
    products: Mapped[list[Product]] = relationship("Product", back_populates="category")
    children: Mapped[list[Category]] = relationship(
        "Category", back_populates="parent", cascade="all, delete-orphan"
    )
    parent: Mapped[Category | None] = relationship(
        "Category", back_populates="children", remote_side=[id]
    )

    def __repr__(self) -> str:
        return f"<Category {self.slug}>"
