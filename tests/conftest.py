"""
Test fixtures — shared test configuration.
Uses in-memory SQLite for fast, isolated tests.
"""

import asyncio
import os
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

# Force SQLite for tests (before any app imports)
os.environ["DATABASE_URL"] = "sqlite+aiosqlite://"
os.environ["JWT_SECRET_KEY"] = "test-secret-key"
os.environ["APP_ENV"] = "testing"
os.environ["REDIS_URL"] = ""

from app.database import engine
from app.main import app
from app.models import Base


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    """Create all tables before each test, drop after."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
