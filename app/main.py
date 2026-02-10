"""
AI Store Builder -- FastAPI Application Entry Point
"""

import logging
import sys
import io
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import get_settings
from app.database import engine
from app.middleware.rate_limit import limiter

# Fix Windows console encoding for emoji/arabic
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup & shutdown events."""
    # Startup
    if "CHANGE-ME" in settings.JWT_SECRET_KEY:
        if settings.is_production:
            raise RuntimeError(
                "JWT_SECRET_KEY must be set in production! Run: openssl rand -hex 64"
            )
        else:
            print(
                "WARNING: Using default JWT secret. Set JWT_SECRET_KEY in .env for production!"
            )
    print(f"[START] {settings.APP_NAME} v{settings.APP_VERSION} starting...")
    print(f"[ENV] Environment: {settings.APP_ENV}")

    # Auto-create tables
    from app.models.base import Base

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    db_type = "SQLite" if settings.DATABASE_URL.startswith("sqlite") else "PostgreSQL"
    print(f"[DB] {db_type} tables created/verified.")

    yield
    # Shutdown
    await engine.dispose()
    print("[STOP] Server shutdown complete.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="\u0645\u0646\u0634\u0626 \u0648\u064a\u0628 \u0641\u0644\u0648 — AI-Powered Multi-Tenant Store Builder",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# -- Rate Limiter --
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# -- Security Headers Middleware --
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if settings.is_production:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


app.add_middleware(SecurityHeadersMiddleware)

# -- CORS --
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -- Import & register routers --
from app.api.health import router as health_router  # noqa: E402
from app.api.auth import router as auth_router  # noqa: E402
from app.api.tenants import router as tenants_router  # noqa: E402
from app.api.stores import router as stores_router  # noqa: E402
from app.api.jobs import router as jobs_router  # noqa: E402
from app.api.ai_chat import router as ai_chat_router  # noqa: E402
from app.api.preview import router as preview_router  # noqa: E402
from app.api.products import router as products_router  # noqa: E402
from app.api.categories import router as categories_router  # noqa: E402
from app.api.orders import router as orders_router  # noqa: E402
from app.api.payments import router as payments_router  # noqa: E402
from app.api.uploads import router as uploads_router  # noqa: E402
from app.api.dashboard import router as dashboard_router  # noqa: E402

# ── Public routes ──
app.include_router(health_router)

# ── Auth ──
app.include_router(auth_router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["Auth"])

# ── Core resources ──
app.include_router(tenants_router, prefix=f"{settings.API_V1_PREFIX}/tenants", tags=["Tenants"])
app.include_router(stores_router, prefix=f"{settings.API_V1_PREFIX}/stores", tags=["Stores"])
app.include_router(jobs_router, prefix=f"{settings.API_V1_PREFIX}/jobs", tags=["Jobs"])

# ── AI ──
app.include_router(ai_chat_router, prefix=f"{settings.API_V1_PREFIX}/ai", tags=["AI Chat"])

# ── Store content ──
app.include_router(preview_router, prefix=f"{settings.API_V1_PREFIX}/preview", tags=["Preview"])
app.include_router(products_router, prefix=f"{settings.API_V1_PREFIX}", tags=["Products"])
app.include_router(categories_router, prefix=f"{settings.API_V1_PREFIX}", tags=["Categories"])

# ── Commerce ──
app.include_router(orders_router, prefix=f"{settings.API_V1_PREFIX}", tags=["Orders"])
app.include_router(payments_router, prefix=f"{settings.API_V1_PREFIX}", tags=["Payments"])

# ── Media ──
app.include_router(uploads_router, prefix=f"{settings.API_V1_PREFIX}", tags=["Uploads"])

# ── Dashboard ──
app.include_router(dashboard_router, prefix=f"{settings.API_V1_PREFIX}/dashboard", tags=["Dashboard"])


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Catch-all error handler."""
    logger.exception(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "internal_server_error",
            "message": str(exc) if settings.DEBUG else "Internal server error",
        },
    )
