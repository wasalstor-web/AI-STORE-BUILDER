"""Job schemas — job tracking responses."""

import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel


class JobResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    store_id: Optional[uuid.UUID] = None
    type: str
    status: str
    progress: int
    result: Optional[dict] = None
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class JobCreateResponse(BaseModel):
    job_id: uuid.UUID
    status: str = "queued"
    message: str = "جاري إنشاء متجرك... ⏳"
    estimated_seconds: int = 30


class JobListResponse(BaseModel):
    jobs: List[JobResponse]
    total: int
