"""Category endpoints — CRUD for store categories."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.rate_limit import limiter
from app.middleware.tenant import TenantCtx
from app.models.category import Category
from app.models.store import Store
from app.schemas.category import (
    CategoryCreate,
    CategoryListResponse,
    CategoryResponse,
    CategoryUpdate,
)
from app.utils.db_helpers import get_store_or_404, slugify

router = APIRouter()


@router.post(
    "/stores/{store_id}/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="إضافة قسم جديد",
)
@limiter.limit("20/minute")
async def create_category(
    request: Request,
    store_id: uuid.UUID,
    body: CategoryCreate,
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    await get_store_or_404(db, store_id, ctx.tenant_id)

    # Generate unique slug
    base_slug = slugify(body.name)
    slug = base_slug
    counter = 1
    while True:
        exists = await db.execute(
            select(Category.id).where(Category.store_id == store_id, Category.slug == slug)
        )
        if not exists.scalar_one_or_none():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    # Validate parent exists in same store
    if body.parent_id:
        parent = await db.execute(
            select(Category).where(
                Category.id == body.parent_id,
                Category.store_id == store_id,
            )
        )
        if not parent.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="القسم الأب غير موجود")

    category = Category(
        tenant_id=ctx.tenant_id,
        store_id=store_id,
        slug=slug,
        **body.model_dump(),
    )
    db.add(category)
    await db.flush()
    await db.refresh(category)
    return category


@router.get(
    "/stores/{store_id}/categories",
    response_model=CategoryListResponse,
    summary="عرض أقسام المتجر",
)
async def list_categories(
    store_id: uuid.UUID,
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
    parent_id: uuid.UUID | None = None,
):
    await get_store_or_404(db, store_id, ctx.tenant_id)

    q = select(Category).where(
        Category.store_id == store_id,
        Category.tenant_id == ctx.tenant_id,
    )

    if parent_id:
        q = q.where(Category.parent_id == parent_id)
    else:
        # Root categories only by default
        q = q.where(Category.parent_id.is_(None))

    q = q.order_by(Category.sort_order, Category.name)
    result = await db.execute(q)
    items = result.scalars().all()

    # Total including nested
    count_q = (
        select(func.count())
        .select_from(Category)
        .where(Category.store_id == store_id, Category.tenant_id == ctx.tenant_id)
    )
    total = (await db.execute(count_q)).scalar() or 0

    return CategoryListResponse(
        items=[CategoryResponse.model_validate(c) for c in items],
        total=total,
    )


@router.get(
    "/categories/{category_id}",
    response_model=CategoryResponse,
    summary="تفاصيل قسم",
)
async def get_category(
    category_id: uuid.UUID,
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(Category).where(Category.id == category_id, Category.tenant_id == ctx.tenant_id)
    )
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="القسم غير موجود")
    return category


@router.patch(
    "/categories/{category_id}",
    response_model=CategoryResponse,
    summary="تعديل قسم",
)
async def update_category(
    category_id: uuid.UUID,
    body: CategoryUpdate,
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(Category).where(Category.id == category_id, Category.tenant_id == ctx.tenant_id)
    )
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="القسم غير موجود")

    update_data = body.model_dump(exclude_unset=True)

    if "name" in update_data:
        update_data["slug"] = slugify(update_data["name"])

    for field, value in update_data.items():
        setattr(category, field, value)

    await db.flush()
    await db.refresh(category)
    return category


@router.delete(
    "/categories/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="حذف قسم",
)
async def delete_category(
    category_id: uuid.UUID,
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(Category).where(Category.id == category_id, Category.tenant_id == ctx.tenant_id)
    )
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="القسم غير موجود")

    await db.delete(category)
    await db.flush()
