"""Health & Version endpoints — public, no auth."""

from fastapi import APIRouter

from app.config import get_settings

router = APIRouter(tags=["🏥 Health"])
settings = get_settings()


@router.get("/health", summary="Health Check")
async def health():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "message": "الخدمة تعمل بنجاح ✅",
    }


@router.get("/version", summary="Version Info")
async def version():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "python": "3.12",
        "framework": "FastAPI",
    }
