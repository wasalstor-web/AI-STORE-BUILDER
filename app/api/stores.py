"""Store endpoints — generate, list, get, update."""

import asyncio
import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import OwnerUser
from app.middleware.rate_limit import limiter
from app.middleware.tenant import TenantCtx
from app.models.job import Job
from app.models.store import Store
from app.schemas.job import JobCreateResponse
from app.schemas.store import (
    StoreGenerateRequest,
    StoreListResponse,
    StoreResponse,
    StoreUpdateRequest,
)
from app.services.store_generator import create_store_and_job, generate_store as run_store_generation

router = APIRouter()

# Track background tasks to prevent GC before completion
_background_tasks: set[asyncio.Task[None]] = set()


@router.post(
    "/generate",
    response_model=JobCreateResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="توليد متجر جديد بالذكاء الاصطناعي",
)
@limiter.limit("5/minute")
async def generate_store(
    request: Request,
    body: StoreGenerateRequest,
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    # ── Enforce store limit per plan ──
    from app.config import get_settings
    from app.models.tenant import Tenant

    _settings = get_settings()
    count_stmt = select(func.count()).select_from(Store).where(Store.tenant_id == ctx.tenant_id)
    store_count = (await db.execute(count_stmt)).scalar() or 0
    tenant_result = await db.execute(select(Tenant).where(Tenant.id == ctx.tenant_id))
    tenant = tenant_result.scalar_one_or_none()
    plan = tenant.plan if tenant else "free"
    plan_limits = {
        "free": _settings.MAX_STORES_FREE,
        "pro": _settings.MAX_STORES_PRO,
        "enterprise": _settings.MAX_STORES_ENTERPRISE,
    }
    max_stores = plan_limits.get(plan, _settings.MAX_STORES_FREE)
    if store_count >= max_stores:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"وصلت الحد الأقصى للمتاجر في خطة {plan} ({max_stores} متاجر). يرجى الترقية.",
        )

    request_data = body.model_dump()
    # Convert nested Pydantic models to dicts
    for key in ["branding", "payment", "shipping"]:
        if request_data.get(key) and hasattr(request_data[key], "model_dump"):
            request_data[key] = (
                request_data[key].model_dump()
                if hasattr(request_data[key], "model_dump")
                else request_data[key]
            )

    store, job = await create_store_and_job(db, ctx.tenant_id, request_data)
    await db.commit()

    redis_available = False
    # Try to enqueue ARQ job (production with Redis)
    try:
        from arq import create_pool
        from arq.connections import RedisSettings

        from app.config import get_settings

        settings = get_settings()
        redis_url = settings.REDIS_URL
        host = redis_url.split("://")[1].split(":")[0]
        port = int(redis_url.split(":")[2].split("/")[0])

        pool = await asyncio.wait_for(
            create_pool(RedisSettings(host=host, port=port)),
            timeout=3.0,
        )
        await pool.enqueue_job(
            "process_store_generation",
            str(job.id),
            str(store.id),
            store.config or {},
        )
        await pool.close()
        redis_available = True
    except Exception as e:
        print(f"⚠️ Redis unavailable, using inline generation: {e}")

    # Inline fallback: generate directly without Redis/ARQ
    if not redis_available:
        async def _run_inline_generation(
            job_id: str, store_id: str, config: dict
        ):
            from app.database import async_session_factory

            async with async_session_factory() as session:
                try:
                    await session.execute(
                        update(Job)
                        .where(Job.id == job_id)
                        .values(status="running", started_at=datetime.now(UTC), progress=10)
                    )
                    await session.commit()

                    merged_config = dict(config or {})
                    merged_config["name"] = request_data["name"]
                    merged_config["store_type"] = request_data["store_type"]
                    merged_config["language"] = request_data.get("language", "ar")

                    _steps, result = await run_store_generation(job_id, store_id, merged_config)

                    await session.execute(
                        update(Store).where(Store.id == store_id).values(
                            status="active",
                            config=func.json_patch(Store.config, result.get("ai_content", {}))
                            if hasattr(func, "json_patch")
                            else result.get("ai_content", {}),
                        )
                    )

                    # Update store config properly
                    store_res = await session.execute(select(Store).where(Store.id == store_id))
                    s = store_res.scalar_one_or_none()
                    if s:
                        new_config = dict(s.config or {})
                        new_config["ai_content"] = result.get("ai_content", {})
                        s.config = new_config
                        s.status = "active"

                    await session.execute(
                        update(Job)
                        .where(Job.id == job_id)
                        .values(
                            status="done", progress=100,
                            result=result,
                            completed_at=datetime.now(UTC),
                        )
                    )
                    await session.commit()
                    print(f"✅ Inline store generation complete: {store_id}")
                except Exception as ex:
                    await session.execute(
                        update(Job)
                        .where(Job.id == job_id)
                        .values(status="failed", error=str(ex), completed_at=datetime.now(UTC))
                    )
                    await session.commit()
                    print(f"❌ Inline generation failed: {ex}")

        # Fire as background task (tracked to prevent GC)
        task = asyncio.create_task(_run_inline_generation(str(job.id), str(store.id), store.config or {}))
        _background_tasks.add(task)
        task.add_done_callback(_background_tasks.discard)

    return JobCreateResponse(
        job_id=job.id,
        status="queued",
        message="جاري إنشاء متجرك... ⏳",
        estimated_seconds=30,
    )


@router.get("/", response_model=StoreListResponse, summary="قائمة المتاجر")
async def list_stores(
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: int = 0,
    limit: int = 20,
):
    # Count
    count_stmt = select(func.count()).select_from(Store).where(Store.tenant_id == ctx.tenant_id)
    total = (await db.execute(count_stmt)).scalar() or 0

    # Fetch
    stmt = (
        select(Store)
        .where(Store.tenant_id == ctx.tenant_id)
        .order_by(Store.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    stores = result.scalars().all()

    return StoreListResponse(stores=stores, total=total)


@router.get("/{store_id}", response_model=StoreResponse, summary="تفاصيل المتجر")
async def get_store(
    store_id: uuid.UUID,
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    stmt = select(Store).where(Store.id == store_id, Store.tenant_id == ctx.tenant_id)
    result = await db.execute(stmt)
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(status_code=404, detail="المتجر غير موجود")
    return store


@router.patch("/{store_id}", response_model=StoreResponse, summary="تعديل المتجر")
async def update_store(
    store_id: uuid.UUID,
    body: StoreUpdateRequest,
    owner: OwnerUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    stmt = select(Store).where(Store.id == store_id, Store.tenant_id == owner.tenant_id)
    result = await db.execute(stmt)
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(status_code=404, detail="المتجر غير موجود")

    # Update simple fields
    if body.name is not None:
        store.name = body.name
    if body.language is not None:
        store.language = body.language
    if body.status is not None:
        store.status = body.status

    # Update config (merge with existing)
    config = dict(store.config or {})
    if body.html_content is not None:
        from app.utils.sanitizer import sanitize_html

        config["preview_html"] = sanitize_html(body.html_content)
    if body.layout is not None:
        config["layout"] = body.layout
    if body.config is not None:
        config.update(body.config)
    store.config = config

    await db.commit()
    await db.refresh(store)
    return store


@router.delete("/{store_id}", status_code=status.HTTP_204_NO_CONTENT, summary="حذف المتجر")
async def delete_store(
    store_id: uuid.UUID,
    owner: OwnerUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    stmt = select(Store).where(Store.id == store_id, Store.tenant_id == owner.tenant_id)
    result = await db.execute(stmt)
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(status_code=404, detail="المتجر غير موجود")

    await db.delete(store)
    await db.commit()
    return None
