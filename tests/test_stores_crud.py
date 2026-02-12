"""Tests -- Store CRUD endpoints (list, get, update, delete, generate)."""

import pytest

API = "/api/v1"


# ── Generate Store ──


@pytest.mark.asyncio
async def test_generate_store_success(client, auth_headers):
    """Should create a store + job and return 202."""
    res = await client.post(
        f"{API}/stores/generate",
        headers=auth_headers,
        json={
            "name": "My Fashion Store",
            "store_type": "fashion",
            "language": "ar",
        },
    )
    assert res.status_code == 202
    data = res.json()
    assert "job_id" in data
    assert data["status"] == "queued"
    assert "estimated_seconds" in data


@pytest.mark.asyncio
async def test_generate_store_missing_fields(client, auth_headers):
    """Should fail validation when required fields missing."""
    res = await client.post(
        f"{API}/stores/generate",
        headers=auth_headers,
        json={"name": "Incomplete"},
    )
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_generate_store_no_auth(client):
    """Should reject unauthenticated requests."""
    res = await client.post(
        f"{API}/stores/generate",
        json={"name": "Test", "store_type": "general"},
    )
    assert res.status_code in [401, 403]


# ── List Stores ──


@pytest.mark.asyncio
async def test_list_stores_empty(client, auth_headers):
    """New user should have 0 stores."""
    res = await client.get(f"{API}/stores/", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 0
    assert data["stores"] == []


@pytest.mark.asyncio
async def test_list_stores_after_generate(client, auth_headers):
    """After generating, store should appear in list."""
    # Generate a store first
    await client.post(
        f"{API}/stores/generate",
        headers=auth_headers,
        json={"name": "Listed Store", "store_type": "electronics"},
    )
    res = await client.get(f"{API}/stores/", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1
    assert len(data["stores"]) >= 1
    store = data["stores"][0]
    assert store["name"] == "Listed Store"
    assert "id" in store
    assert "slug" in store


@pytest.mark.asyncio
async def test_list_stores_pagination(client, auth_headers):
    """Pagination params should work."""
    # Create 2 stores
    await client.post(
        f"{API}/stores/generate",
        headers=auth_headers,
        json={"name": "Store A", "store_type": "fashion"},
    )
    await client.post(
        f"{API}/stores/generate",
        headers=auth_headers,
        json={"name": "Store B", "store_type": "electronics"},
    )
    # Fetch with limit=1
    res = await client.get(
        f"{API}/stores/", headers=auth_headers, params={"limit": 1}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 2
    assert len(data["stores"]) == 1


@pytest.mark.asyncio
async def test_list_stores_no_auth(client):
    """Should reject unauthenticated requests."""
    res = await client.get(f"{API}/stores/")
    assert res.status_code in [401, 403]


# ── Get Store Detail ──


@pytest.mark.asyncio
async def test_get_store_detail(client, auth_headers, store_id):
    """Should return store details."""
    res = await client.get(f"{API}/stores/{store_id}", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == store_id
    assert "name" in data
    assert "slug" in data
    assert "store_type" in data
    assert "status" in data
    assert "config" in data


@pytest.mark.asyncio
async def test_get_store_not_found(client, auth_headers):
    """Should return 404 for non-existent store."""
    fake_id = "00000000-0000-0000-0000-000000000000"
    res = await client.get(f"{API}/stores/{fake_id}", headers=auth_headers)
    assert res.status_code == 404


# ── Update Store ──


@pytest.mark.asyncio
async def test_update_store_name(client, auth_headers, store_id):
    """Should update the store name."""
    res = await client.patch(
        f"{API}/stores/{store_id}",
        headers=auth_headers,
        json={"name": "Updated Name"},
    )
    assert res.status_code == 200
    assert res.json()["name"] == "Updated Name"


@pytest.mark.asyncio
async def test_update_store_status(client, auth_headers, store_id):
    """Should update the store status."""
    res = await client.patch(
        f"{API}/stores/{store_id}",
        headers=auth_headers,
        json={"status": "active"},
    )
    assert res.status_code == 200
    assert res.json()["status"] == "active"


@pytest.mark.asyncio
async def test_update_store_config(client, auth_headers, store_id):
    """Should merge config."""
    res = await client.patch(
        f"{API}/stores/{store_id}",
        headers=auth_headers,
        json={"config": {"theme": "dark", "currency": "SAR"}},
    )
    assert res.status_code == 200
    config = res.json()["config"]
    assert config.get("theme") == "dark"
    assert config.get("currency") == "SAR"


@pytest.mark.asyncio
async def test_update_store_html_sanitized(client, auth_headers, store_id):
    """HTML content should be sanitized (XSS prevention)."""
    res = await client.patch(
        f"{API}/stores/{store_id}",
        headers=auth_headers,
        json={"html_content": '<h1>Hello</h1><script>alert("xss")</script>'},
    )
    assert res.status_code == 200
    config = res.json()["config"]
    preview = config.get("preview_html", "")
    assert "<script>" not in preview
    assert "<h1>" in preview or "Hello" in preview


@pytest.mark.asyncio
async def test_update_store_not_found(client, auth_headers):
    """Should return 404 for non-existent store."""
    fake_id = "00000000-0000-0000-0000-000000000000"
    res = await client.patch(
        f"{API}/stores/{fake_id}",
        headers=auth_headers,
        json={"name": "X"},
    )
    assert res.status_code in [404, 422]  # 422 if UUID format validation fails first


# ── Delete Store ──


@pytest.mark.asyncio
async def test_delete_store(client, auth_headers, store_id):
    """Should delete the store."""
    res = await client.delete(f"{API}/stores/{store_id}", headers=auth_headers)
    assert res.status_code == 204

    # Verify store is gone
    get_res = await client.get(f"{API}/stores/{store_id}", headers=auth_headers)
    assert get_res.status_code == 404


@pytest.mark.asyncio
async def test_delete_store_not_found(client, auth_headers):
    """Should return 404 for non-existent store."""
    fake_id = "00000000-0000-0000-0000-000000000000"
    res = await client.delete(f"{API}/stores/{fake_id}", headers=auth_headers)
    assert res.status_code == 404


# ── Tenant Isolation ──


@pytest.mark.asyncio
async def test_tenant_isolation(client, auth_headers, auth_headers_2, store_id):
    """User 2 should NOT see User 1's stores."""
    # User 2 lists stores => should be empty
    res = await client.get(f"{API}/stores/", headers=auth_headers_2)
    assert res.status_code == 200
    assert res.json()["total"] == 0

    # User 2 cannot access User 1's store directly
    res = await client.get(f"{API}/stores/{store_id}", headers=auth_headers_2)
    assert res.status_code == 404
