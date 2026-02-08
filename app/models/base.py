"""
Base model with tenant isolation and UUID v7 primary keys.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String, func, JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Uuid


def generate_uuid7() -> uuid.UUID:
    """Generate a time-sortable UUID v7."""
    try:
        from uuid7 import uuid7
        return uuid7()
    except ImportError:
        return uuid.uuid4()


class Base(DeclarativeBase):
    """Abstract base for all models."""
    pass


class TimestampMixin:
    """Adds created_at / updated_at to any model."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
