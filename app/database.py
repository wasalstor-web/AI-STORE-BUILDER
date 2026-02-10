"""
AI Store Builder — Database Engine & Session Management
Async SQLAlchemy 2.0 — supports PostgreSQL (Supabase) and SQLite.
Production-ready with connection pooling.
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import get_settings

settings = get_settings()

_is_sqlite = settings.DATABASE_URL.startswith("sqlite")
_is_postgres = "postgresql" in settings.DATABASE_URL or "postgres" in settings.DATABASE_URL

_engine_kwargs: dict = {
    "echo": settings.DEBUG and not settings.is_production,
}

if _is_postgres:
    # PostgreSQL/Supabase optimized settings
    _engine_kwargs.update(
        pool_size=20,
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_timeout=30,
    )
elif _is_sqlite:
    # SQLite needs check_same_thread=False for async
    _engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_async_engine(settings.DATABASE_URL, **_engine_kwargs)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency — yields an async DB session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
