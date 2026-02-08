"""
Rate Limiting Middleware — Protects endpoints from brute-force and abuse.
Uses slowapi backed by in-memory storage (upgradeable to Redis).
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

# ── Limiter instance — import this in route files ──
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["60/minute"],  # Global default
    storage_uri="memory://",  # In-memory (use "redis://..." for production)
)
