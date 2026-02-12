"""
Test fixtures — shared test configuration.
Uses in-memory SQLite for fast, isolated tests.
"""

import os
from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient

# Force SQLite for tests (before any app imports)
os.environ["DATABASE_URL"] = "sqlite+aiosqlite://"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-testing-only"
os.environ["APP_ENV"] = "testing"
os.environ["REDIS_URL"] = ""
os.environ["ANTHROPIC_API_KEY"] = ""
os.environ["OPENAI_API_KEY"] = ""
os.environ["GOOGLE_API_KEY"] = ""

from app.database import engine
from app.main import app
from app.models import Base

API = "/api/v1"

# ── Test user data ──
TEST_USER = {
    "email": "test@example.com",
    "password": "TestPass123!",
    "full_name": "Test User",
    "tenant_name": "Test Corp",
}

TEST_USER_2 = {
    "email": "user2@example.com",
    "password": "TestPass456!",
    "full_name": "Second User",
    "tenant_name": "Corp Two",
}


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


@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient) -> dict[str, str]:
    """Register a user and return auth headers."""
    res = await client.post(f"{API}/auth/register", json=TEST_USER)
    assert res.status_code == 201, f"Register failed: {res.text}"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def auth_headers_2(client: AsyncClient) -> dict[str, str]:
    """Register a second user and return auth headers."""
    res = await client.post(f"{API}/auth/register", json=TEST_USER_2)
    assert res.status_code == 201, f"Register 2 failed: {res.text}"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def store_id(client: AsyncClient, auth_headers: dict[str, str]) -> str:
    """Create a store via generate endpoint and return its id."""
    # Use generate endpoint — it creates a store + job
    res = await client.post(
        f"{API}/stores/generate",
        headers=auth_headers,
        json={
            "name": "Test Store",
            "store_type": "electronics",
            "language": "ar",
        },
    )
    assert res.status_code == 202, f"Generate failed: {res.text}"
    job_id = res.json()["job_id"]

    # The store was created in DB; find it via list
    import asyncio
    await asyncio.sleep(0.3)  # small delay for background task

    list_res = await client.get(f"{API}/stores/", headers=auth_headers)
    assert list_res.status_code == 200
    data = list_res.json()
    stores = data.get("stores", [])
    assert len(stores) > 0, f"No stores found after generate. Response: {data}"
    return stores[0]["id"]
