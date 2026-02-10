"""Shared database helper utilities — eliminates duplication across API modules."""

import re
import uuid

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.store import Store


async def get_store_or_404(
    db: AsyncSession, store_id: uuid.UUID, tenant_id: uuid.UUID
) -> Store:
    """Fetch a store belonging to a tenant, or raise 404."""
    result = await db.execute(
        select(Store).where(Store.id == store_id, Store.tenant_id == tenant_id)
    )
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(status_code=404, detail="المتجر غير موجود")
    return store


def slugify(text: str, fallback: str = "item") -> str:
    """Generate URL-safe slug from text."""
    slug = re.sub(r"[^\w\s-]", "", text.lower().strip())
    slug = re.sub(r"[\s_]+", "-", slug)
    return slug or fallback
