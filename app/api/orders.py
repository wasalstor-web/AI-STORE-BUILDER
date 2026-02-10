"""Order endpoints — checkout, list, update, stats."""

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
from app.middleware.tenant import TenantCtx
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.store import Store
from app.schemas.order import (
    CheckoutRequest,
    OrderListResponse,
    OrderResponse,
    OrderSummary,
    OrderUpdateRequest,
)
from app.utils.db_helpers import get_store_or_404

router = APIRouter()

TAX_RATE = Decimal("0.15")  # 15% VAT (Saudi Arabia)


def _generate_order_number() -> str:
    """Generate human-readable order number like ORD-A3X7K9."""
    chars = string.ascii_uppercase + string.digits
    code = "".join(random.choices(chars, k=6))
    return f"ORD-{code}"


@router.post(
    "/stores/{store_id}/checkout",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="إنشاء طلب جديد (checkout)",
)
@limiter.limit("10/minute")
async def checkout(
    request: Request,
    store_id: uuid.UUID,
    body: CheckoutRequest,
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    await get_store_or_404(db, store_id, ctx.tenant_id)

    # Validate products & calculate totals
    order_items: list[OrderItem] = []
    subtotal = Decimal("0.00")

    for cart_item in body.items:
        result = await db.execute(
            select(Product).where(
                Product.id == cart_item.product_id,
                Product.store_id == store_id,
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
    shipping_cost = Decimal("0.00")  # TODO: calculate from shipping provider
    total = subtotal + tax_amount + shipping_cost

    # Generate unique order number
    order_number = _generate_order_number()
    while True:
        exists = await db.execute(select(Order.id).where(Order.order_number == order_number))
        if not exists.scalar_one_or_none():
            break
        order_number = _generate_order_number()

    order = Order(
        tenant_id=ctx.tenant_id,
        store_id=store_id,
        order_number=order_number,
        customer_name=body.customer_name,
        customer_email=body.customer_email,
        customer_phone=body.customer_phone,
        shipping_address=body.shipping_address,
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
    await db.flush()
    await db.refresh(order, attribute_names=["items"])

    return order


@router.get(
    "/stores/{store_id}/orders",
    response_model=OrderListResponse,
    summary="عرض طلبات المتجر",
)
async def list_orders(
    store_id: uuid.UUID,
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
    payment_status: str | None = None,
):
    await get_store_or_404(db, store_id, ctx.tenant_id)

    base_q = select(Order).where(
        Order.store_id == store_id,
        Order.tenant_id == ctx.tenant_id,
    )

    if status_filter:
        base_q = base_q.where(Order.status == status_filter)
    if payment_status:
        base_q = base_q.where(Order.payment_status == payment_status)

    # Count
    count_q = select(func.count()).select_from(base_q.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    # Paginate with items eagerly loaded
    items_q = (
        base_q.options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    result = await db.execute(items_q)
    orders = result.scalars().unique().all()

    return OrderListResponse(
        items=[OrderResponse.model_validate(o) for o in orders],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/orders/{order_id}",
    response_model=OrderResponse,
    summary="تفاصيل طلب",
)
async def get_order(
    order_id: uuid.UUID,
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id, Order.tenant_id == ctx.tenant_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")
    return order


@router.patch(
    "/orders/{order_id}",
    response_model=OrderResponse,
    summary="تحديث حالة الطلب",
)
async def update_order(
    order_id: uuid.UUID,
    body: OrderUpdateRequest,
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id, Order.tenant_id == ctx.tenant_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")

    update_data = body.model_dump(exclude_unset=True)

    # If cancelling — restore inventory
    if update_data.get("status") == "cancelled" and order.status != "cancelled":
        for item in order.items:
            if item.product_id:
                prod_result = await db.execute(
                    select(Product).where(Product.id == item.product_id)
                )
                product = prod_result.scalar_one_or_none()
                if product and product.track_inventory:
                    product.stock_quantity += item.quantity

    for field, value in update_data.items():
        setattr(order, field, value)

    await db.flush()
    await db.refresh(order)
    return order


@router.get(
    "/stores/{store_id}/orders/summary",
    response_model=OrderSummary,
    summary="ملخص الطلبات",
)
async def order_summary(
    store_id: uuid.UUID,
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    await get_store_or_404(db, store_id, ctx.tenant_id)

    base_filter = [Order.store_id == store_id, Order.tenant_id == ctx.tenant_id]

    # Total orders
    total_q = select(func.count()).select_from(Order).where(*base_filter)
    total_orders = (await db.execute(total_q)).scalar() or 0

    # Total revenue (completed/paid only)
    rev_q = select(func.coalesce(func.sum(Order.total), 0)).where(
        *base_filter, Order.payment_status == "paid"
    )
    total_revenue = (await db.execute(rev_q)).scalar() or Decimal("0.00")

    # Pending
    pending_q = (
        select(func.count()).select_from(Order).where(*base_filter, Order.status == "pending")
    )
    pending_orders = (await db.execute(pending_q)).scalar() or 0

    # Completed
    completed_q = (
        select(func.count())
        .select_from(Order)
        .where(*base_filter, Order.status.in_(["completed", "delivered"]))
    )
    completed_orders = (await db.execute(completed_q)).scalar() or 0

    return OrderSummary(
        total_orders=total_orders,
        total_revenue=total_revenue,
        pending_orders=pending_orders,
        completed_orders=completed_orders,
    )
