"""Upload endpoint — image upload for products & categories."""

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.middleware.tenant import TenantCtx
from app.services.upload_service import upload_service

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"}
MAX_SIZE = 5 * 1024 * 1024  # 5MB


@router.post(
    "/upload/image",
    summary="رفع صورة",
    status_code=status.HTTP_201_CREATED,
)
async def upload_image(
    ctx: TenantCtx,
    file: UploadFile = File(),
    folder: str = Form(default="products"),
):
    """Upload an image to Cloudflare R2 or local storage."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"نوع الملف غير مدعوم. الأنواع المدعومة: {', '.join(ALLOWED_TYPES)}",
        )

    contents = await file.read()

    if len(contents) > MAX_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"حجم الملف يتجاوز الحد المسموح ({MAX_SIZE // (1024 * 1024)}MB)",
        )

    url = await upload_service.upload_image(
        file_bytes=contents,
        filename=file.filename or "image.jpg",
        content_type=file.content_type or "image/jpeg",
        folder=f"{ctx.tenant_id}/{folder}",
    )

    if not url:
        raise HTTPException(status_code=500, detail="فشل رفع الصورة")

    return {"url": url, "filename": file.filename, "size": len(contents)}


@router.delete(
    "/upload/image",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="حذف صورة",
)
async def delete_image(
    ctx: TenantCtx,
    url: str,
):
    """Delete an uploaded image."""
    success = await upload_service.delete_image(url)
    if not success:
        raise HTTPException(status_code=404, detail="الصورة غير موجودة أو لا يمكن حذفها")
