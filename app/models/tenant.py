"""Tenant model — each client organization/account."""

from __future__ import annotations

import uuid

from sqlalchemy import JSON, Boolean, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, generate_uuid7


class Tenant(Base, TimestampMixin):
    __tablename__ = "tenants"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=generate_uuid7)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    plan: Mapped[str] = mapped_column(String(50), default="free", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    settings: Mapped[dict | None] = mapped_column(JSON, default=dict)

    # Relationships
    users: Mapped[list[User]] = relationship(
        "User", back_populates="tenant", cascade="all, delete-orphan"
    )
    stores: Mapped[list[Store]] = relationship(
        "Store", back_populates="tenant", cascade="all, delete-orphan"
    )
    jobs: Mapped[list[Job]] = relationship(
        "Job", back_populates="tenant", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Tenant {self.slug}>"
