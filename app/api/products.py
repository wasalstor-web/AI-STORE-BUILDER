"""Product endpoints — CRUD for store products."""

import uuid
import re
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import CurrentUser
from app.middleware.tenant import TenantCtx
from app.middleware.rate_limit import limiter
from app.models.product import Product
from app.models.store import Store
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse, ProductListResponse,
)

router = APIRouter()


def _slugify(text: str) -> str:
    """Generate URL-safe slug from text."""
    slug = re.sub(r"[^\w\s-]", "", text.lower().strip())
    slug = re.sub(r"[\s_]+", "-", slug)
    return slug or "product"


async def _get_store_or_404(
    db: AsyncSession, store_id: uuid.UUID, tenant_id: uuid.UUID
) -> Store:
    result = await db.execute(
        select(Store).where(Store.id == store_id, Store.tenant_id == tenant_id)
    )
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(status_code=404, detail="المتجر غير موجود")
    return store


@router.post(
    "/stores/{store_id}/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="إضافة منتج جديد",
)
@limiter.limit("30/minute")
async def create_product(
    request: Request,
    store_id: uuid.UUID,
    body: ProductCreate,
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    await _get_store_or_404(db, store_id, ctx.tenant_id)

    # Generate unique slug
    base_slug = _slugify(body.name)
    slug = base_slug
    counter = 1
    while True:
        exists = await db.execute(
            select(Product.id).where(
                Product.store_id == store_id, Product.slug == slug
            )
        )
        if not exists.scalar_one_or_none():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    product = Product(
        tenant_id=ctx.tenant_id,
        store_id=store_id,
        slug=slug,
        **body.model_dump(),
    )
    db.add(product)
    await db.flush()
    await db.refresh(product)
    return product


@router.get(
    "/stores/{store_id}/products",
    response_model=ProductListResponse,
    summary="عرض منتجات المتجر",
)
async def list_products(
    store_id: uuid.UUID,
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: Optional[uuid.UUID] = None,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    is_featured: Optional[bool] = None,
):
    await _get_store_or_404(db, store_id, ctx.tenant_id)

    base_q = select(Product).where(
        Product.store_id == store_id,
        Product.tenant_id == ctx.tenant_id,
    )

    if category_id:
        base_q = base_q.where(Product.category_id == category_id)
    if search:
        base_q = base_q.where(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku.ilike(f"%{search}%"),
            )
        )
    if is_active is not None:
        base_q = base_q.where(Product.is_active == is_active)
    if is_featured is not None:
        base_q = base_q.where(Product.is_featured == is_featured)

    # Count
    count_q = select(func.count()).select_from(base_q.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    # Paginate
    items_q = base_q.order_by(Product.sort_order, Product.created_at.desc())
    items_q = items_q.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(items_q)
    items = result.scalars().all()

    return ProductListResponse(
        items=[ProductResponse.model_validate(p) for p in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/products/{product_id}",
    response_model=ProductResponse,
    summary="تفاصيل منتج",
)
async def get_product(
    product_id: uuid.UUID,
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(Product).where(
            Product.id == product_id, Product.tenant_id == ctx.tenant_id
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="المنتج غير موجود")
    return product


@router.patch(
    "/products/{product_id}",
    response_model=ProductResponse,
    summary="تعديل منتج",
)
async def update_product(
    product_id: uuid.UUID,
    body: ProductUpdate,
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(Product).where(
            Product.id == product_id, Product.tenant_id == ctx.tenant_id
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="المنتج غير موجود")

    update_data = body.model_dump(exclude_unset=True)

    # Re-slug if name changes
    if "name" in update_data:
        update_data["slug"] = _slugify(update_data["name"])

    for field, value in update_data.items():
        setattr(product, field, value)

    await db.flush()
    await db.refresh(product)
    return product


@router.delete(
    "/products/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="حذف منتج",
)
async def delete_product(
    product_id: uuid.UUID,
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(Product).where(
            Product.id == product_id, Product.tenant_id == ctx.tenant_id
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="المنتج غير موجود")

    await db.delete(product)
    await db.flush()
