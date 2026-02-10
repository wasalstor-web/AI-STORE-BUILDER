"""Dashboard endpoints — aggregate stats across all tenant stores."""

from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.tenant import TenantCtx
from app.models.order import Order
from app.models.product import Product
from app.models.store import Store

router = APIRouter()


class DashboardStats(BaseModel):
    total_stores: int = 0
    active_stores: int = 0
    total_products: int = 0
    total_orders: int = 0
    pending_orders: int = 0
    total_revenue: float = 0.0


@router.get(
    "/stats",
    response_model=DashboardStats,
    summary="إحصائيات لوحة التحكم المجمعة",
)
async def get_dashboard_stats(
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Single endpoint that returns aggregate stats across all tenant stores."""
    tenant_id = ctx.tenant_id

    # Total & active stores
    total_stores = (
        await db.execute(
            select(func.count()).select_from(Store).where(Store.tenant_id == tenant_id)
        )
    ).scalar() or 0

    active_stores = (
        await db.execute(
            select(func.count())
            .select_from(Store)
            .where(Store.tenant_id == tenant_id, Store.status == "active")
        )
    ).scalar() or 0

    # Get all store IDs for this tenant
    store_ids_result = await db.execute(
        select(Store.id).where(Store.tenant_id == tenant_id)
    )
    store_ids = [row[0] for row in store_ids_result.fetchall()]

    if not store_ids:
        return DashboardStats(
            total_stores=total_stores,
            active_stores=active_stores,
        )

    # Total products
    total_products = (
        await db.execute(
            select(func.count())
            .select_from(Product)
            .where(Product.store_id.in_(store_ids))
        )
    ).scalar() or 0

    # Total orders + pending + revenue
    total_orders = (
        await db.execute(
            select(func.count())
            .select_from(Order)
            .where(Order.store_id.in_(store_ids))
        )
    ).scalar() or 0

    pending_orders = (
        await db.execute(
            select(func.count())
            .select_from(Order)
            .where(Order.store_id.in_(store_ids), Order.status == "pending")
        )
    ).scalar() or 0

    total_revenue = (
        await db.execute(
            select(func.coalesce(func.sum(Order.total), 0.0)).where(
                Order.store_id.in_(store_ids),
                Order.status.in_(["completed", "delivered", "shipped"]),
                Order.payment_status == "paid",
            )
        )
    ).scalar() or 0.0

    return DashboardStats(
        total_stores=total_stores,
        active_stores=active_stores,
        total_products=total_products,
        total_orders=total_orders,
        pending_orders=pending_orders,
        total_revenue=float(total_revenue),
    )
