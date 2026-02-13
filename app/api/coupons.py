"""Coupon API — CRUD + validation for discount codes."""

from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.coupon import Coupon
from app.models.store import Store
from app.models.user import User
from app.schemas.coupon import (
    CouponCreate,
    CouponListResponse,
    CouponResponse,
    CouponUpdate,
    CouponValidateRequest,
    CouponValidateResponse,
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


@router.get("/stores/{store_id}/coupons", response_model=CouponListResponse)
async def list_coupons(
    store_id: str,
    is_active: bool | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all coupons for a store."""
    await _verify_store_access(store_id, user, db)

    query = select(Coupon).where(
        Coupon.store_id == store_id,
        Coupon.tenant_id == user.tenant_id,
    )
    if is_active is not None:
        query = query.where(Coupon.is_active == is_active)

    query = query.order_by(Coupon.created_at.desc())
    result = await db.execute(query)
    coupons = result.scalars().all()

    return CouponListResponse(
        coupons=[CouponResponse.model_validate(c) for c in coupons],
        total=len(coupons),
    )


@router.post("/stores/{store_id}/coupons", response_model=CouponResponse, status_code=201)
async def create_coupon(
    store_id: str,
    data: CouponCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new coupon."""
    await _verify_store_access(store_id, user, db)

    # Check duplicate code
    exists = await db.execute(
        select(Coupon).where(
            Coupon.store_id == store_id,
            Coupon.code == data.code,
        )
    )
    if exists.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Coupon code already exists")

    coupon = Coupon(
        tenant_id=user.tenant_id,
        store_id=store_id,
        **data.model_dump(),
    )
    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)
    return CouponResponse.model_validate(coupon)


@router.patch("/stores/{store_id}/coupons/{coupon_id}", response_model=CouponResponse)
async def update_coupon(
    store_id: str,
    coupon_id: str,
    data: CouponUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a coupon."""
    await _verify_store_access(store_id, user, db)

    result = await db.execute(
        select(Coupon).where(
            Coupon.id == coupon_id,
            Coupon.store_id == store_id,
            Coupon.tenant_id == user.tenant_id,
        )
    )
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(coupon, field, value)
    await db.commit()
    await db.refresh(coupon)
    return CouponResponse.model_validate(coupon)


@router.delete("/stores/{store_id}/coupons/{coupon_id}")
async def delete_coupon(
    store_id: str,
    coupon_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a coupon."""
    await _verify_store_access(store_id, user, db)

    result = await db.execute(
        select(Coupon).where(
            Coupon.id == coupon_id,
            Coupon.store_id == store_id,
            Coupon.tenant_id == user.tenant_id,
        )
    )
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    await db.delete(coupon)
    await db.commit()
    return {"success": True, "message": "Coupon deleted"}


@router.post("/stores/{store_id}/coupons/validate", response_model=CouponValidateResponse)
async def validate_coupon(
    store_id: str,
    data: CouponValidateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Validate a coupon code (public — used by storefront checkout)."""
    result = await db.execute(
        select(Coupon).where(
            Coupon.store_id == store_id,
            Coupon.code == data.code.strip().upper(),
            Coupon.is_active == True,
        )
    )
    coupon = result.scalar_one_or_none()
    if not coupon:
        return CouponValidateResponse(valid=False, message="كود الخصم غير صالح")

    now = datetime.now(timezone.utc)
    if coupon.starts_at and now < coupon.starts_at:
        return CouponValidateResponse(valid=False, message="كود الخصم لم يبدأ بعد")
    if coupon.expires_at and now > coupon.expires_at:
        return CouponValidateResponse(valid=False, message="كود الخصم منتهي الصلاحية")
    if coupon.max_uses and coupon.used_count >= coupon.max_uses:
        return CouponValidateResponse(valid=False, message="كود الخصم استنفذ الاستخدامات")
    if coupon.min_order_amount and data.order_amount < coupon.min_order_amount:
        return CouponValidateResponse(
            valid=False,
            message=f"الحد الأدنى للطلب {coupon.min_order_amount} ر.س",
        )

    # Calculate discount
    if coupon.discount_type == "percentage":
        discount = data.order_amount * coupon.discount_value / Decimal("100")
        if coupon.max_discount_amount:
            discount = min(discount, coupon.max_discount_amount)
    else:
        discount = coupon.discount_value

    return CouponValidateResponse(
        valid=True,
        discount_amount=discount,
        message=f"تم تطبيق خصم {discount} ر.س",
    )
