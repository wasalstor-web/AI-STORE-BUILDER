"""
Rate Limiting Middleware — Protects endpoints from brute-force and abuse.
Uses slowapi backed by Redis in production, in-memory for development.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import get_settings

settings = get_settings()

# Use Redis for production (multi-worker safe), memory for dev
_storage_uri = settings.REDIS_URL if settings.is_production else "memory://"

# ── Limiter instance — import this in route files ──
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["60/minute"],
    storage_uri=_storage_uri,
)
