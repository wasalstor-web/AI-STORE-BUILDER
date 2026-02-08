"""
Tenant Isolation — Provides tenant-scoped DB queries.
Every query gets filtered by the user's tenant_id automatically.
"""

import uuid
from typing import Annotated

from fastapi import Depends

from app.middleware.auth import get_current_user
from app.models.user import User


class TenantContext:
    """Holds tenant info for the current request."""

    def __init__(self, tenant_id: uuid.UUID, user: User):
        self.tenant_id = tenant_id
        self.user = user

    def filter_query(self, stmt, model):
        """Add tenant_id filter to any SQLAlchemy statement."""
        return stmt.where(model.tenant_id == self.tenant_id)


async def get_tenant_context(
    current_user: Annotated[User, Depends(get_current_user)],
) -> TenantContext:
    """Build tenant context from the authenticated user."""
    return TenantContext(tenant_id=current_user.tenant_id, user=current_user)


# Type alias
TenantCtx = Annotated[TenantContext, Depends(get_tenant_context)]
