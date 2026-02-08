"""Tests — Store generation endpoint."""

import pytest


@pytest.mark.asyncio
async def test_generate_store_unauthorized(client):
    """Should return 401 without auth token."""
    response = await client.post("/api/v1/stores/generate", json={
        "name": "متجر الاختبار",
        "store_type": "electronics",
    })
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_list_stores_unauthorized(client):
    """Should return 401 without auth token."""
    response = await client.get("/api/v1/stores/")
    assert response.status_code in [401, 403]
