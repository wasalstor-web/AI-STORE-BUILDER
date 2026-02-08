"""Job schemas — job tracking responses."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class JobResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    store_id: uuid.UUID | None = None
    type: str
    status: str
    progress: int
    result: dict | None = None
    error: str | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class JobCreateResponse(BaseModel):
    job_id: uuid.UUID
    status: str = "queued"
    message: str = "جاري إنشاء متجرك... ⏳"
    estimated_seconds: int = 30


class JobListResponse(BaseModel):
    jobs: list[JobResponse]
    total: int
