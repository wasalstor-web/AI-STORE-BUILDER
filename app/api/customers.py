"""Customer API — list and manage store customers."""

from __future__ import annotations

import math
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.customer import Customer
from app.models.order import Order
from app.models.store import Store
from app.models.user import User
from app.schemas.customer import (
    CustomerListResponse,
    CustomerResponse,
    CustomerStats,
    CustomerUpdate,
)

router = APIRouter()


async def _verify_store_access(store_id: str, user: User, db: AsyncSession) -> Store:
    result = await db.execute(
        select(Store).where(Store.id == store_id, Store.tenant_id == user.tenant_id)
    )
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store


@router.get("/stores/{store_id}/customers", response_model=CustomerListResponse)
async def list_customers(
    store_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str | None = None,
    sort: str = "newest",
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List store customers with search and pagination."""
    await _verify_store_access(store_id, user, db)

    query = select(Customer).where(
        Customer.store_id == store_id,
        Customer.tenant_id == user.tenant_id,
    )

    if search:
        query = query.where(
            (Customer.name.ilike(f"%{search}%"))
            | (Customer.email.ilike(f"%{search}%"))
            | (Customer.phone.ilike(f"%{search}%"))
        )

    # Count total
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    # Sort
    if sort == "most_orders":
        query = query.order_by(Customer.total_orders.desc())
    elif sort == "most_spent":
        query = query.order_by(Customer.total_spent.desc())
    elif sort == "oldest":
        query = query.order_by(Customer.created_at.asc())
    else:
        query = query.order_by(Customer.created_at.desc())

    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    customers = result.scalars().all()

    return CustomerListResponse(
        customers=[CustomerResponse.model_validate(c) for c in customers],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=math.ceil(total / per_page) if total else 0,
    )


@router.get("/stores/{store_id}/customers/stats", response_model=CustomerStats)
async def customer_stats(
    store_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get customer statistics for a store."""
    await _verify_store_access(store_id, user, db)

    total_q = select(func.count()).where(
        Customer.store_id == store_id, Customer.tenant_id == user.tenant_id
    )
    total = (await db.execute(total_q)).scalar() or 0

    now = datetime.now(timezone.utc)
    first_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_q = select(func.count()).where(
        Customer.store_id == store_id,
        Customer.tenant_id == user.tenant_id,
        Customer.created_at >= first_of_month,
    )
    new_this_month = (await db.execute(new_q)).scalar() or 0

    returning_q = select(func.count()).where(
        Customer.store_id == store_id,
        Customer.tenant_id == user.tenant_id,
        Customer.total_orders > 1,
    )
    returning = (await db.execute(returning_q)).scalar() or 0

    avg_q = select(func.avg(Customer.total_spent)).where(
        Customer.store_id == store_id,
        Customer.tenant_id == user.tenant_id,
        Customer.total_orders > 0,
    )
    avg_val = (await db.execute(avg_q)).scalar()

    return CustomerStats(
        total_customers=total,
        new_customers_this_month=new_this_month,
        returning_customers=returning,
        average_order_value=avg_val or 0,
    )


@router.get("/stores/{store_id}/customers/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    store_id: str,
    customer_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get single customer details."""
    await _verify_store_access(store_id, user, db)

    result = await db.execute(
        select(Customer).where(
            Customer.id == customer_id,
            Customer.store_id == store_id,
            Customer.tenant_id == user.tenant_id,
        )
    )
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return CustomerResponse.model_validate(customer)


@router.patch("/stores/{store_id}/customers/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    store_id: str,
    customer_id: str,
    data: CustomerUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update customer tags/notes."""
    await _verify_store_access(store_id, user, db)

    result = await db.execute(
        select(Customer).where(
            Customer.id == customer_id,
            Customer.store_id == store_id,
            Customer.tenant_id == user.tenant_id,
        )
    )
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)
    await db.commit()
    await db.refresh(customer)
    return CustomerResponse.model_validate(customer)
