"""Tenant endpoints — create, get current, update."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.tenant import TenantResponse, TenantUpdate
from app.middleware.auth import CurrentUser, OwnerUser
from app.middleware.tenant import TenantCtx
from app.services.tenant_service import get_tenant_by_id, update_tenant

router = APIRouter()


@router.get("/current", response_model=TenantResponse, summary="بيانات المنظمة الحالية")
async def get_current_tenant(
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    tenant = await get_tenant_by_id(db, ctx.tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="المنظمة غير موجودة")
    return tenant


@router.patch("/current", response_model=TenantResponse, summary="تعديل بيانات المنظمة")
async def update_current_tenant(
    body: TenantUpdate,
    owner: OwnerUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    update_data = body.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="لا توجد بيانات للتحديث")

    tenant = await update_tenant(db, owner.tenant_id, **update_data)
    if not tenant:
        raise HTTPException(status_code=404, detail="المنظمة غير موجودة")

    await db.commit()
    return tenant
