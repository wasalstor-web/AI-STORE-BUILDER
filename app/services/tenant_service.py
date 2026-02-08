"""
Tenant Service — CRUD operations for tenants.
"""

from typing import Optional
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tenant import Tenant


async def get_tenant_by_id(db: AsyncSession, tenant_id: uuid.UUID) -> Optional[Tenant]:
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    return result.scalar_one_or_none()


async def update_tenant(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    **kwargs,
) -> Optional[Tenant]:
    """Update tenant fields — compatible with SQLite and PostgreSQL."""
    tenant = await get_tenant_by_id(db, tenant_id)
    if not tenant:
        return None

    for key, value in kwargs.items():
        if value is not None and hasattr(tenant, key):
            setattr(tenant, key, value)

    await db.flush()
    return tenant
