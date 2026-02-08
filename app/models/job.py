"""Job model — tracks async store generation tasks."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, generate_uuid7


class Job(Base, TimestampMixin):
    __tablename__ = "jobs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=generate_uuid7)
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("tenants.id"), nullable=False, index=True
    )
    store_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("stores.id"), nullable=True
    )
    type: Mapped[str] = mapped_column(String(100), default="store_generation", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="queued", nullable=False, index=True)
    progress: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    result: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    tenant: Mapped[Tenant] = relationship("Tenant", back_populates="jobs")
    store: Mapped[Store | None] = relationship("Store", back_populates="jobs")

    def __repr__(self) -> str:
        return f"<Job {self.id} status={self.status}>"
