"""
Rate Limiting Middleware — Protects endpoints from brute-force and abuse.
Uses slowapi backed by Redis in production, in-memory for development.
Disabled during testing.
"""

import os

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import get_settings

settings = get_settings()

# Disable rate limiting in tests
_is_testing = os.environ.get("APP_ENV") == "testing"

# Use Redis for production (multi-worker safe), memory for dev
_storage_uri = settings.REDIS_URL if settings.is_production else "memory://"

# ── Limiter instance — import this in route files ──
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[] if _is_testing else ["60/minute"],
    storage_uri=_storage_uri,
    enabled=not _is_testing,
)
