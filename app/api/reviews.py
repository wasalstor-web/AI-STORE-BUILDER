"""Review API — manage product reviews."""

from __future__ import annotations

import math

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.review import Review
from app.models.store import Store
from app.models.user import User
from app.schemas.review import (
    ReviewCreate,
    ReviewListResponse,
    ReviewResponse,
    ReviewUpdate,
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


@router.get("/stores/{store_id}/reviews", response_model=ReviewListResponse)
async def list_reviews(
    store_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    product_id: str | None = None,
    is_approved: bool | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List reviews for a store (admin)."""
    await _verify_store_access(store_id, user, db)

    query = select(Review).where(
        Review.store_id == store_id,
        Review.tenant_id == user.tenant_id,
    )

    if product_id:
        query = query.where(Review.product_id == product_id)
    if is_approved is not None:
        query = query.where(Review.is_approved == is_approved)

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(Review.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    reviews = result.scalars().all()

    return ReviewListResponse(
        reviews=[ReviewResponse.model_validate(r) for r in reviews],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.patch("/stores/{store_id}/reviews/{review_id}", response_model=ReviewResponse)
async def update_review(
    store_id: str,
    review_id: str,
    data: ReviewUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Approve/reject or feature a review."""
    await _verify_store_access(store_id, user, db)

    result = await db.execute(
        select(Review).where(
            Review.id == review_id,
            Review.store_id == store_id,
            Review.tenant_id == user.tenant_id,
        )
    )
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(review, field, value)
    await db.commit()
    await db.refresh(review)
    return ReviewResponse.model_validate(review)


@router.delete("/stores/{store_id}/reviews/{review_id}")
async def delete_review(
    store_id: str,
    review_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a review."""
    await _verify_store_access(store_id, user, db)

    result = await db.execute(
        select(Review).where(
            Review.id == review_id,
            Review.store_id == store_id,
            Review.tenant_id == user.tenant_id,
        )
    )
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    await db.delete(review)
    await db.commit()
    return {"success": True, "message": "Review deleted"}


# ── Public endpoint (storefront) — submit review ──
@router.post("/s/{slug}/reviews", response_model=ReviewResponse, status_code=201)
async def submit_review(
    slug: str,
    data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
):
    """Submit a review (public — storefront customers)."""
    result = await db.execute(
        select(Store).where(Store.slug == slug, Store.status == "published")
    )
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be 1-5")

    review = Review(
        tenant_id=store.tenant_id,
        store_id=store.id,
        product_id=data.product_id,
        customer_name=data.customer_name,
        customer_email=data.customer_email,
        rating=data.rating,
        title=data.title,
        comment=data.comment,
        is_approved=False,  # Requires mod approval
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return ReviewResponse.model_validate(review)
