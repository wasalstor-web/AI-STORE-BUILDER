"""Payment endpoints — create payment, verify, webhooks."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.middleware.auth import CurrentUser
from app.middleware.tenant import TenantCtx
from app.middleware.rate_limit import limiter
from app.models.order import Order
from app.models.store import Store
from app.services.payment_service import payment_service

router = APIRouter()


@router.post(
    "/orders/{order_id}/pay",
    summary="إنشاء عملية دفع للطلب",
)
@limiter.limit("10/minute")
async def create_payment(
    request: Request,
    order_id: uuid.UUID,
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
    gateway: str = "moyasar",
):
    # Get order
    result = await db.execute(
        select(Order).where(
            Order.id == order_id, Order.tenant_id == ctx.tenant_id
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")

    if order.payment_status == "paid":
        raise HTTPException(status_code=400, detail="الطلب مدفوع مسبقاً")

    # Get store for callback URL
    store_result = await db.execute(select(Store).where(Store.id == order.store_id))
    store = store_result.scalar_one_or_none()

    callback_url = f"{request.base_url}api/v1/payments/callback/{order.order_number}"

    payment_result = await payment_service.create_payment(
        gateway=gateway,
        amount=order.total,
        currency=order.currency,
        order_id=order.order_number,
        description=f"طلب #{order.order_number} - {store.name if store else 'متجر'}",
        callback_url=callback_url,
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        customer_phone=order.customer_phone or "",
        payment_method=order.payment_method or "mada",
    )

    if not payment_result.success:
        raise HTTPException(
            status_code=400,
            detail=payment_result.error or "فشل إنشاء عملية الدفع",
        )

    # Store payment reference
    order.payment_id = payment_result.payment_id
    order.payment_metadata = payment_result.metadata
    await db.flush()

    return {
        "payment_id": payment_result.payment_id,
        "redirect_url": payment_result.redirect_url,
        "order_number": order.order_number,
    }


@router.get(
    "/payments/callback/{order_number}",
    summary="Payment callback (redirect from gateway)",
)
async def payment_callback(
    order_number: str,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Handle payment gateway redirect callback."""
    result = await db.execute(
        select(Order).where(Order.order_number == order_number)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")

    # Determine gateway from payment_id prefix or metadata
    gateway = "moyasar"
    if order.payment_id and order.payment_id.startswith("chg_"):
        gateway = "tap"
    elif order.payment_id and order.payment_id.startswith("COD-"):
        gateway = "cod"

    # Verify payment
    verification = await payment_service.verify_payment(gateway, order.payment_id or "")

    if verification.success:
        order.payment_status = "paid"
        order.status = "paid"
        order.payment_metadata = verification.metadata
        await db.flush()
        return {
            "status": "success",
            "order_number": order.order_number,
            "message": "تم الدفع بنجاح ✅",
        }
    else:
        return {
            "status": "failed",
            "order_number": order.order_number,
            "message": verification.error or "فشل التحقق من الدفع",
        }


@router.post(
    "/payments/webhook",
    summary="Payment webhook (server-to-server)",
    status_code=status.HTTP_200_OK,
)
async def payment_webhook(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Handle payment gateway webhook notifications."""
    body = await request.json()

    # Extract order reference
    order_number = None
    payment_id = None
    payment_status = None

    # Moyasar webhook format
    if "id" in body and "metadata" in body:
        payment_id = body.get("id")
        order_number = body.get("metadata", {}).get("order_id")
        payment_status = body.get("status")

    # Tap webhook format
    elif "id" in body and "reference" in body:
        payment_id = body.get("id")
        order_number = body.get("reference", {}).get("order")
        status_val = body.get("status", "")
        payment_status = "paid" if status_val == "CAPTURED" else status_val.lower()

    if not order_number:
        return {"status": "ignored", "reason": "no order reference"}

    result = await db.execute(
        select(Order).where(Order.order_number == order_number)
    )
    order = result.scalar_one_or_none()
    if not order:
        return {"status": "ignored", "reason": f"order {order_number} not found"}

    if payment_status == "paid" and order.payment_status != "paid":
        order.payment_status = "paid"
        order.status = "paid"
        order.payment_id = payment_id
        order.payment_metadata = body
        await db.flush()
        return {"status": "updated", "order": order_number}

    return {"status": "no_change", "order": order_number}
