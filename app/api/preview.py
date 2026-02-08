"""
Store Preview API — Serves generated store HTML for live preview.
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import CurrentUser
from app.models.store import Store

router = APIRouter()


class SaveHTMLRequest(BaseModel):
    html: str


@router.get(
    "/{store_id}",
    response_class=HTMLResponse,
    summary="عرض معاينة المتجر",
)
async def preview_store(
    store_id: uuid.UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Serves the store's saved HTML for iframe preview."""
    stmt = select(Store).where(
        Store.id == store_id,
        Store.tenant_id == current_user.tenant_id,
    )
    result = await db.execute(stmt)
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(status_code=404, detail="المتجر غير موجود")

    # Get saved HTML from config
    html = (store.config or {}).get("preview_html", "")
    if not html:
        # Return a placeholder
        html = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{store.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body {{ font-family: 'Tajawal', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0f0f23; color: white; text-align: center; margin: 0; }}
    .container {{ padding: 40px; }}
    h1 {{ font-size: 2rem; margin-bottom: 12px; }}
    p {{ opacity: 0.7; }}
  </style>
</head>
<body>
  <div class="container">
    <h1>🏗️ {store.name}</h1>
    <p>جاري بناء المتجر... استخدم محرر الذكاء الاصطناعي لتصميمه</p>
  </div>
</body>
</html>"""

    return HTMLResponse(content=html)


@router.post(
    "/{store_id}/save-html",
    summary="حفظ HTML المتجر",
)
async def save_store_html(
    store_id: uuid.UUID,
    body: SaveHTMLRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Save generated HTML to the store's config for preview."""
    stmt = select(Store).where(
        Store.id == store_id,
        Store.tenant_id == current_user.tenant_id,
    )
    result = await db.execute(stmt)
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(status_code=404, detail="المتجر غير موجود")

    config = store.config or {}
    config["preview_html"] = body.html
    store.config = config

    await db.commit()
    return {"success": True, "message": "تم حفظ التصميم ✅"}
