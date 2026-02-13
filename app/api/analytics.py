"""Analytics API — time-series stats, top products, customer metrics."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import case, func, select, extract
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.store import Store
from app.models.user import User

router = APIRouter()


# ── Response Models ──

class RevenuePoint(BaseModel):
    date: str
    revenue: Decimal = Decimal("0")
    orders: int = 0


class TopProduct(BaseModel):
    product_id: str
    product_name: str
    product_image: str | None = None
    total_sold: int = 0
    total_revenue: Decimal = Decimal("0")


class OrderStatusBreakdown(BaseModel):
    pending: int = 0
    confirmed: int = 0
    processing: int = 0
    shipped: int = 0
    delivered: int = 0
    cancelled: int = 0


class AnalyticsOverview(BaseModel):
    total_revenue: Decimal = Decimal("0")
    total_orders: int = 0
    total_customers: int = 0
    total_products: int = 0
    avg_order_value: Decimal = Decimal("0")
    conversion_rate: Decimal = Decimal("0")
    revenue_change: Decimal = Decimal("0")  # % vs previous period
    orders_change: Decimal = Decimal("0")


class FullAnalytics(BaseModel):
    overview: AnalyticsOverview
    revenue_chart: list[RevenuePoint]
    top_products: list[TopProduct]
    order_status: OrderStatusBreakdown
    recent_orders_count: int = 0


async def _verify_store_access(store_id: str, user: User, db: AsyncSession) -> Store:
    result = await db.execute(
        select(Store).where(Store.id == store_id, Store.tenant_id == user.tenant_id)
    )
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store


@router.get("/stores/{store_id}/analytics", response_model=FullAnalytics)
async def get_analytics(
    store_id: str,
    period: str = Query("30d", regex="^(7d|30d|90d|12m)$"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get comprehensive store analytics."""
    await _verify_store_access(store_id, user, db)

    now = datetime.now(timezone.utc)

    if period == "7d":
        start_date = now - timedelta(days=7)
        prev_start = start_date - timedelta(days=7)
    elif period == "90d":
        start_date = now - timedelta(days=90)
        prev_start = start_date - timedelta(days=90)
    elif period == "12m":
        start_date = now - timedelta(days=365)
        prev_start = start_date - timedelta(days=365)
    else:
        start_date = now - timedelta(days=30)
        prev_start = start_date - timedelta(days=30)

    # ── Overview Stats ──
    current_orders_q = select(
        func.count(Order.id).label("count"),
        func.coalesce(func.sum(Order.total), 0).label("revenue"),
    ).where(
        Order.store_id == store_id,
        Order.tenant_id == user.tenant_id,
        Order.created_at >= start_date,
    )
    current_res = (await db.execute(current_orders_q)).one()

    prev_orders_q = select(
        func.count(Order.id).label("count"),
        func.coalesce(func.sum(Order.total), 0).label("revenue"),
    ).where(
        Order.store_id == store_id,
        Order.tenant_id == user.tenant_id,
        Order.created_at >= prev_start,
        Order.created_at < start_date,
    )
    prev_res = (await db.execute(prev_orders_q)).one()

    total_revenue = Decimal(str(current_res.revenue))
    total_orders = current_res.count
    prev_revenue = Decimal(str(prev_res.revenue))
    prev_orders = prev_res.count

    revenue_change = Decimal("0")
    if prev_revenue > 0:
        revenue_change = ((total_revenue - prev_revenue) / prev_revenue * 100).quantize(Decimal("0.1"))
    orders_change = Decimal("0")
    if prev_orders > 0:
        orders_change = Decimal(str(((total_orders - prev_orders) / prev_orders * 100))).quantize(Decimal("0.1"))

    avg_order = (total_revenue / total_orders).quantize(Decimal("0.01")) if total_orders > 0 else Decimal("0")

    cust_count_q = select(func.count(Customer.id)).where(
        Customer.store_id == store_id, Customer.tenant_id == user.tenant_id
    )
    total_customers = (await db.execute(cust_count_q)).scalar() or 0

    prod_count_q = select(func.count(Product.id)).where(
        Product.store_id == store_id, Product.tenant_id == user.tenant_id
    )
    total_products = (await db.execute(prod_count_q)).scalar() or 0

    overview = AnalyticsOverview(
        total_revenue=total_revenue,
        total_orders=total_orders,
        total_customers=total_customers,
        total_products=total_products,
        avg_order_value=avg_order,
        revenue_change=revenue_change,
        orders_change=orders_change,
    )

    # ── Revenue Time-Series ──
    revenue_chart: list[RevenuePoint] = []
    if period in ("7d", "30d"):
        days = 7 if period == "7d" else 30
        for i in range(days):
            day = (now - timedelta(days=days - 1 - i)).date()
            day_start = datetime(day.year, day.month, day.day, tzinfo=timezone.utc)
            day_end = day_start + timedelta(days=1)
            dq = select(
                func.count(Order.id).label("count"),
                func.coalesce(func.sum(Order.total), 0).label("revenue"),
            ).where(
                Order.store_id == store_id,
                Order.tenant_id == user.tenant_id,
                Order.created_at >= day_start,
                Order.created_at < day_end,
            )
            dr = (await db.execute(dq)).one()
            revenue_chart.append(RevenuePoint(
                date=day.isoformat(),
                revenue=Decimal(str(dr.revenue)),
                orders=dr.count,
            ))
    elif period == "90d":
        # Weekly buckets
        for i in range(13):
            week_start = now - timedelta(weeks=13 - i)
            week_end = week_start + timedelta(weeks=1)
            wq = select(
                func.count(Order.id).label("count"),
                func.coalesce(func.sum(Order.total), 0).label("revenue"),
            ).where(
                Order.store_id == store_id,
                Order.tenant_id == user.tenant_id,
                Order.created_at >= week_start,
                Order.created_at < week_end,
            )
            wr = (await db.execute(wq)).one()
            revenue_chart.append(RevenuePoint(
                date=week_start.date().isoformat(),
                revenue=Decimal(str(wr.revenue)),
                orders=wr.count,
            ))
    else:
        # Monthly buckets
        for i in range(12):
            month_offset = 11 - i
            if now.month - month_offset > 0:
                m = now.month - month_offset
                y = now.year
            else:
                m = now.month - month_offset + 12
                y = now.year - 1
            m_start = datetime(y, m, 1, tzinfo=timezone.utc)
            if m == 12:
                m_end = datetime(y + 1, 1, 1, tzinfo=timezone.utc)
            else:
                m_end = datetime(y, m + 1, 1, tzinfo=timezone.utc)
            mq = select(
                func.count(Order.id).label("count"),
                func.coalesce(func.sum(Order.total), 0).label("revenue"),
            ).where(
                Order.store_id == store_id,
                Order.tenant_id == user.tenant_id,
                Order.created_at >= m_start,
                Order.created_at < m_end,
            )
            mr = (await db.execute(mq)).one()
            revenue_chart.append(RevenuePoint(
                date=m_start.strftime("%Y-%m"),
                revenue=Decimal(str(mr.revenue)),
                orders=mr.count,
            ))

    # ── Top Products ──
    top_q = (
        select(
            OrderItem.product_id,
            OrderItem.product_name,
            OrderItem.product_image,
            func.sum(OrderItem.quantity).label("total_sold"),
            func.sum(OrderItem.total_price).label("total_revenue"),
        )
        .join(Order, Order.id == OrderItem.order_id)
        .where(
            Order.store_id == store_id,
            Order.tenant_id == user.tenant_id,
            Order.created_at >= start_date,
        )
        .group_by(OrderItem.product_id, OrderItem.product_name, OrderItem.product_image)
        .order_by(func.sum(OrderItem.total_price).desc())
        .limit(5)
    )
    top_res = (await db.execute(top_q)).all()
    top_products = [
        TopProduct(
            product_id=str(r.product_id) if r.product_id else "",
            product_name=r.product_name,
            product_image=r.product_image,
            total_sold=int(r.total_sold or 0),
            total_revenue=Decimal(str(r.total_revenue or 0)),
        )
        for r in top_res
    ]

    # ── Order Status Breakdown ──
    status_q = (
        select(Order.status, func.count(Order.id).label("count"))
        .where(
            Order.store_id == store_id,
            Order.tenant_id == user.tenant_id,
            Order.created_at >= start_date,
        )
        .group_by(Order.status)
    )
    status_res = (await db.execute(status_q)).all()
    status_map = {r.status: r.count for r in status_res}
    order_status = OrderStatusBreakdown(
        pending=status_map.get("pending", 0),
        confirmed=status_map.get("confirmed", 0),
        processing=status_map.get("processing", 0),
        shipped=status_map.get("shipped", 0),
        delivered=status_map.get("delivered", 0),
        cancelled=status_map.get("cancelled", 0),
    )

    return FullAnalytics(
        overview=overview,
        revenue_chart=revenue_chart,
        top_products=top_products,
        order_status=order_status,
        recent_orders_count=total_orders,
    )
