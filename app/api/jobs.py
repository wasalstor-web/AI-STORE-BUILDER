"""Job tracking endpoints — get status, list jobs."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.tenant import TenantCtx
from app.models.job import Job
from app.schemas.job import JobListResponse, JobResponse

router = APIRouter()


@router.get("/{job_id}", response_model=JobResponse, summary="حالة المهمة")
async def get_job(
    job_id: uuid.UUID,
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    stmt = select(Job).where(Job.id == job_id, Job.tenant_id == ctx.tenant_id)
    result = await db.execute(stmt)
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="المهمة غير موجودة")
    return job


@router.get("/", response_model=JobListResponse, summary="قائمة المهام")
async def list_jobs(
    ctx: TenantCtx,
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: int = 0,
    limit: int = 20,
    status_filter: str | None = None,
):
    # Base filter
    base = select(Job).where(Job.tenant_id == ctx.tenant_id)
    if status_filter:
        base = base.where(Job.status == status_filter)

    # Count
    count_stmt = select(func.count()).select_from(Job).where(Job.tenant_id == ctx.tenant_id)
    if status_filter:
        count_stmt = count_stmt.where(Job.status == status_filter)
    total = (await db.execute(count_stmt)).scalar() or 0

    # Fetch
    stmt = base.order_by(Job.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    jobs = result.scalars().all()

    return JobListResponse(jobs=jobs, total=total)
