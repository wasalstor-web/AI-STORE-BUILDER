"""
Public Storefront API — Customer-facing endpoints (no auth required).
These endpoints allow customers to browse stores, view products, and checkout.
"""

import random
import string
import uuid
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.middleware.rate_limit import limiter
from app.models.category import Category
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.store import Store
from app.schemas.order import CheckoutRequest, OrderResponse
from app.schemas.storefront import (
    PublicCategoryListResponse,
    PublicCategoryResponse,
    PublicOrderTrackingResponse,
    PublicProductListResponse,
    PublicProductResponse,
    PublicStoreResponse,
)

router = APIRouter()

TAX_RATE = Decimal("0.15")  # 15% VAT (Saudi Arabia)


# ═══════════════════════════════════════════════════════════
#  Helper — Get Store by Slug
# ═══════════════════════════════════════════════════════════


async def _get_store_by_slug(db: AsyncSession, slug: str) -> Store:
    """Fetch a published store by slug or raise 404."""
    result = await db.execute(
        select(Store).where(Store.slug == slug, Store.status == "published")
    )
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(status_code=404, detail="المتجر غير موجود")
    return store


# ═══════════════════════════════════════════════════════════
#  GET /s/{slug} — Store Landing Page Data
# ═══════════════════════════════════════════════════════════


@router.get(
    "/{slug}",
    response_model=PublicStoreResponse,
    summary="بيانات المتجر العامة",
)
async def get_store(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get public store data for the storefront landing page."""
    store = await _get_store_by_slug(db, slug)

    # Get category count and product count
    cat_count = await db.execute(
        select(func.count(Category.id)).where(
            Category.store_id == store.id, Category.is_active.is_(True)
        )
    )
    prod_count = await db.execute(
        select(func.count(Product.id)).where(
            Product.store_id == store.id, Product.is_active.is_(True)
        )
    )

    # Get featured products (up to 8)
    featured_result = await db.execute(
        select(Product)
        .where(
            Product.store_id == store.id,
            Product.is_active.is_(True),
            Product.is_featured.is_(True),
        )
        .order_by(Product.sort_order)
        .limit(8)
    )
    featured_products = featured_result.scalars().all()

    # Get top categories
    cat_result = await db.execute(
        select(Category)
        .where(
            Category.store_id == store.id,
            Category.is_active.is_(True),
            Category.parent_id.is_(None),
        )
        .order_by(Category.sort_order)
        .limit(10)
    )
    categories = cat_result.scalars().all()

    config = store.config or {}
    ai_content = config.get("ai_content", {})

    return PublicStoreResponse(
        id=store.id,
        name=store.name,
        slug=store.slug,
        store_type=store.store_type,
        language=store.language or "ar",
        logo_url=config.get("logo_url"),
        primary_color=config.get("branding", {}).get("primary_color", "#6d28d9"),
        hero_title=ai_content.get("hero", {}).get("title", store.name),
        hero_subtitle=ai_content.get("hero", {}).get("subtitle", ""),
        hero_image=ai_content.get("hero", {}).get("image_url"),
        about=ai_content.get("about", {}),
        features=ai_content.get("features", []),
        categories=[
            PublicCategoryResponse(
                id=c.id,
                name=c.name,
                slug=c.slug,
                description=c.description,
                image_url=c.image_url,
                product_count=0,
            )
            for c in categories
        ],
        featured_products=[
            PublicProductResponse(
                id=p.id,
                name=p.name,
                slug=p.slug,
                description=p.description,
                short_description=p.short_description,
                price=float(p.price),
                compare_at_price=float(p.compare_at_price) if p.compare_at_price else None,
                currency=p.currency,
                image_url=p.image_url,
                images=p.images or [],
                is_featured=p.is_featured,
                in_stock=p.stock_quantity > 0 if p.track_inventory else True,
                category_name=None,
            )
            for p in featured_products
        ],
        category_count=cat_count.scalar() or 0,
        product_count=prod_count.scalar() or 0,
    )


# ═══════════════════════════════════════════════════════════
#  GET /s/{slug}/products — Product Listing
# ═══════════════════════════════════════════════════════════


@router.get(
    "/{slug}/products",
    response_model=PublicProductListResponse,
    summary="قائمة المنتجات",
)
async def list_products(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=48),
    category: str | None = Query(None, description="Filter by category slug"),
    search: str | None = Query(None, description="Search products"),
    sort: str = Query("newest", description="Sort: newest, price_asc, price_desc, popular"),
    featured: bool | None = Query(None, description="Featured only"),
):
    """List products for a public storefront with filtering and pagination."""
    store = await _get_store_by_slug(db, slug)

    query = select(Product).where(
        Product.store_id == store.id,
        Product.is_active.is_(True),
    )

    # Category filter
    if category:
        cat_result = await db.execute(
            select(Category.id).where(
                Category.store_id == store.id,
                Category.slug == category,
            )
        )
        cat_id = cat_result.scalar_one_or_none()
        if cat_id:
            query = query.where(Product.category_id == cat_id)

    # Search filter
    if search:
        search_term = f"%{search}%"
        query = query.where(
            (Product.name.ilike(search_term))
            | (Product.description.ilike(search_term))
        )

    # Featured filter
    if featured is not None:
        query = query.where(Product.is_featured.is_(featured))

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Sorting
    if sort == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort == "popular":
        query = query.order_by(Product.is_featured.desc(), Product.sort_order)
    else:  # newest
        query = query.order_by(Product.created_at.desc())

    # Pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    products = result.scalars().all()

    # Get category names for products
    category_ids = {p.category_id for p in products if p.category_id}
    category_map: dict[uuid.UUID, str] = {}
    if category_ids:
        cat_result = await db.execute(
            select(Category.id, Category.name).where(Category.id.in_(category_ids))
        )
        category_map = {row.id: row.name for row in cat_result}

    return PublicProductListResponse(
        products=[
            PublicProductResponse(
                id=p.id,
                name=p.name,
                slug=p.slug,
                description=p.description,
                short_description=p.short_description,
                price=float(p.price),
                compare_at_price=float(p.compare_at_price) if p.compare_at_price else None,
                currency=p.currency,
                image_url=p.image_url,
                images=p.images or [],
                is_featured=p.is_featured,
                in_stock=p.stock_quantity > 0 if p.track_inventory else True,
                category_name=category_map.get(p.category_id) if p.category_id else None,
            )
            for p in products
        ],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


# ═══════════════════════════════════════════════════════════
#  GET /s/{slug}/products/{product_slug} — Product Detail
# ═══════════════════════════════════════════════════════════


@router.get(
    "/{slug}/products/{product_slug}",
    response_model=PublicProductResponse,
    summary="تفاصيل المنتج",
)
async def get_product(
    slug: str,
    product_slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get single product details for the storefront."""
    store = await _get_store_by_slug(db, slug)

    result = await db.execute(
        select(Product).where(
            Product.store_id == store.id,
            Product.slug == product_slug,
            Product.is_active.is_(True),
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="المنتج غير موجود")

    # Get category name
    category_name = None
    if product.category_id:
        cat_result = await db.execute(
            select(Category.name).where(Category.id == product.category_id)
        )
        category_name = cat_result.scalar_one_or_none()

    # Get related products (same category, max 4)
    related = []
    if product.category_id:
        rel_result = await db.execute(
            select(Product)
            .where(
                Product.store_id == store.id,
                Product.category_id == product.category_id,
                Product.id != product.id,
                Product.is_active.is_(True),
            )
            .limit(4)
        )
        related = rel_result.scalars().all()

    return PublicProductResponse(
        id=product.id,
        name=product.name,
        slug=product.slug,
        description=product.description,
        short_description=product.short_description,
        price=float(product.price),
        compare_at_price=float(product.compare_at_price) if product.compare_at_price else None,
        currency=product.currency,
        image_url=product.image_url,
        images=product.images or [],
        is_featured=product.is_featured,
        in_stock=product.stock_quantity > 0 if product.track_inventory else True,
        category_name=category_name,
        attributes=product.attributes or {},
        weight=float(product.weight) if product.weight else None,
        weight_unit=product.weight_unit,
        related_products=[
            PublicProductResponse(
                id=r.id,
                name=r.name,
                slug=r.slug,
                description=r.description,
                short_description=r.short_description,
                price=float(r.price),
                compare_at_price=float(r.compare_at_price) if r.compare_at_price else None,
                currency=r.currency,
                image_url=r.image_url,
                images=r.images or [],
                is_featured=r.is_featured,
                in_stock=r.stock_quantity > 0 if r.track_inventory else True,
                category_name=category_name,
            )
            for r in related
        ],
    )


# ═══════════════════════════════════════════════════════════
#  GET /s/{slug}/categories — Category Listing
# ═══════════════════════════════════════════════════════════


@router.get(
    "/{slug}/categories",
    response_model=PublicCategoryListResponse,
    summary="أقسام المتجر",
)
async def list_categories(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """List all active categories for a store."""
    store = await _get_store_by_slug(db, slug)

    result = await db.execute(
        select(Category)
        .where(
            Category.store_id == store.id,
            Category.is_active.is_(True),
        )
        .order_by(Category.sort_order)
    )
    categories = result.scalars().all()

    # Get product counts per category
    count_result = await db.execute(
        select(Product.category_id, func.count(Product.id))
        .where(
            Product.store_id == store.id,
            Product.is_active.is_(True),
        )
        .group_by(Product.category_id)
    )
    count_map = {row[0]: row[1] for row in count_result}

    return PublicCategoryListResponse(
        categories=[
            PublicCategoryResponse(
                id=c.id,
                name=c.name,
                slug=c.slug,
                description=c.description,
                image_url=c.image_url,
                product_count=count_map.get(c.id, 0),
            )
            for c in categories
        ]
    )


# ═══════════════════════════════════════════════════════════
#  POST /s/{slug}/checkout — Public Checkout
# ═══════════════════════════════════════════════════════════


def _generate_order_number() -> str:
    """Generate human-readable order number like ORD-A3X7K9."""
    chars = string.ascii_uppercase + string.digits
    code = "".join(random.choices(chars, k=6))
    return f"ORD-{code}"


@router.post(
    "/{slug}/checkout",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="إنشاء طلب (بدون تسجيل دخول)",
)
@limiter.limit("10/minute")
async def public_checkout(
    request: Request,
    slug: str,
    body: CheckoutRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Public checkout — customers don't need to be logged in."""
    store = await _get_store_by_slug(db, slug)

    # Validate products & calculate totals
    order_items: list[OrderItem] = []
    subtotal = Decimal("0.00")

    for cart_item in body.items:
        result = await db.execute(
            select(Product).where(
                Product.id == cart_item.product_id,
                Product.store_id == store.id,
                Product.is_active.is_(True),
            )
        )
        product = result.scalar_one_or_none()
        if not product:
            raise HTTPException(
                status_code=400,
                detail=f"المنتج {cart_item.product_id} غير متوفر",
            )

        # Check stock
        if (
            product.track_inventory
            and product.stock_quantity < cart_item.quantity
            and not product.allow_backorder
        ):
            raise HTTPException(
                status_code=400,
                detail=f"الكمية المطلوبة من '{product.name}' غير متوفرة (المتبقي: {product.stock_quantity})",
            )

        item_total = product.price * cart_item.quantity
        subtotal += item_total

        order_items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,
                product_sku=product.sku,
                product_image=product.image_url,
                quantity=cart_item.quantity,
                unit_price=product.price,
                total_price=item_total,
                attributes=cart_item.attributes or {},
            )
        )

        # Deduct inventory
        if product.track_inventory:
            product.stock_quantity -= cart_item.quantity

    # Calculate totals
    tax_amount = (subtotal * TAX_RATE).quantize(Decimal("0.01"))
    shipping_cost = Decimal("0.00")
    total = subtotal + tax_amount + shipping_cost

    # Generate unique order number
    order_number = _generate_order_number()
    while True:
        exists = await db.execute(
            select(Order.id).where(Order.order_number == order_number)
        )
        if not exists.scalar_one_or_none():
            break
        order_number = _generate_order_number()

    order = Order(
        tenant_id=store.tenant_id,
        store_id=store.id,
        order_number=order_number,
        customer_name=body.customer_name,
        customer_email=body.customer_email,
        customer_phone=body.customer_phone,
        shipping_address=body.shipping_address or {},
        subtotal=subtotal,
        shipping_cost=shipping_cost,
        tax_amount=tax_amount,
        discount_amount=Decimal("0.00"),
        total=total,
        currency="SAR",
        status="pending",
        payment_method=body.payment_method,
        payment_status="unpaid",
        customer_notes=body.customer_notes,
        items=order_items,
    )

    db.add(order)
    await db.commit()
    await db.refresh(order, attribute_names=["items"])

    return order


# ═══════════════════════════════════════════════════════════
#  GET /s/{slug}/orders/{order_number} — Order Tracking
# ═══════════════════════════════════════════════════════════


@router.get(
    "/{slug}/orders/{order_number}",
    response_model=PublicOrderTrackingResponse,
    summary="تتبع الطلب",
)
async def track_order(
    slug: str,
    order_number: str,
    email: str = Query(..., description="Customer email for verification"),
    db: AsyncSession = Depends(get_db),
):
    """Track order status — requires order number + email for verification."""
    store = await _get_store_by_slug(db, slug)

    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(
            Order.store_id == store.id,
            Order.order_number == order_number,
            Order.customer_email == email,
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")

    return PublicOrderTrackingResponse(
        order_number=order.order_number,
        status=order.status,
        payment_status=order.payment_status,
        customer_name=order.customer_name,
        total=float(order.total),
        currency=order.currency,
        items=[
            {
                "name": item.product_name,
                "quantity": item.quantity,
                "price": float(item.unit_price),
                "total": float(item.total_price),
                "image": item.product_image,
            }
            for item in order.items
        ],
        tracking_number=order.tracking_number,
        shipping_method=order.shipping_method,
        created_at=order.created_at.isoformat() if order.created_at else None,
    )
