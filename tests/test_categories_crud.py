"""Tests -- Categories CRUD endpoints."""

import pytest

API = "/api/v1"


# ── Create Category ──


@pytest.mark.asyncio
async def test_create_category(client, auth_headers, store_id):
    """Should create a category."""
    res = await client.post(
        f"{API}/stores/{store_id}/categories",
        headers=auth_headers,
        json={
            "name": "Electronics",
            "description": "All electronic devices",
        },
    )
    assert res.status_code == 201, f"Create category failed: {res.text}"
    data = res.json()
    assert data["name"] == "Electronics"
    assert "id" in data
    assert "slug" in data
    assert data["is_active"] is True


@pytest.mark.asyncio
async def test_create_category_minimal(client, auth_headers, store_id):
    """Should create with only name."""
    res = await client.post(
        f"{API}/stores/{store_id}/categories",
        headers=auth_headers,
        json={"name": "Minimal Cat"},
    )
    assert res.status_code == 201


@pytest.mark.asyncio
async def test_create_subcategory(client, auth_headers, store_id):
    """Should create a subcategory with parent_id."""
    # Create parent
    parent_res = await client.post(
        f"{API}/stores/{store_id}/categories",
        headers=auth_headers,
        json={"name": "Parent Category"},
    )
    parent_id = parent_res.json()["id"]

    # Create child
    child_res = await client.post(
        f"{API}/stores/{store_id}/categories",
        headers=auth_headers,
        json={"name": "Child Category", "parent_id": parent_id},
    )
    assert child_res.status_code == 201
    assert child_res.json()["parent_id"] == parent_id


@pytest.mark.asyncio
async def test_create_category_no_auth(client, store_id):
    """Should reject unauthenticated requests."""
    res = await client.post(
        f"{API}/stores/{store_id}/categories",
        json={"name": "Unauthorized"},
    )
    assert res.status_code in [401, 403]


# ── List Categories ──


@pytest.mark.asyncio
async def test_list_categories_empty(client, auth_headers, store_id):
    """New store should have 0 categories."""
    res = await client.get(
        f"{API}/stores/{store_id}/categories", headers=auth_headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_list_categories(client, auth_headers, store_id):
    """Should list created categories."""
    await client.post(
        f"{API}/stores/{store_id}/categories",
        headers=auth_headers,
        json={"name": "Cat A"},
    )
    await client.post(
        f"{API}/stores/{store_id}/categories",
        headers=auth_headers,
        json={"name": "Cat B"},
    )

    res = await client.get(
        f"{API}/stores/{store_id}/categories", headers=auth_headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 2


# ── Get Category ──


@pytest.mark.asyncio
async def test_get_category(client, auth_headers, store_id):
    """Should return category details."""
    create_res = await client.post(
        f"{API}/stores/{store_id}/categories",
        headers=auth_headers,
        json={"name": "Get Me", "description": "Detailed"},
    )
    cat_id = create_res.json()["id"]

    res = await client.get(f"{API}/categories/{cat_id}", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["name"] == "Get Me"


@pytest.mark.asyncio
async def test_get_category_not_found(client, auth_headers):
    """Should return 404."""
    fake_id = "00000000-0000-0000-0000-000000000000"
    res = await client.get(f"{API}/categories/{fake_id}", headers=auth_headers)
    assert res.status_code == 404


# ── Update Category ──


@pytest.mark.asyncio
async def test_update_category(client, auth_headers, store_id):
    """Should update a category."""
    create_res = await client.post(
        f"{API}/stores/{store_id}/categories",
        headers=auth_headers,
        json={"name": "Old Cat"},
    )
    cat_id = create_res.json()["id"]

    res = await client.patch(
        f"{API}/categories/{cat_id}",
        headers=auth_headers,
        json={"name": "New Cat", "description": "Updated"},
    )
    assert res.status_code == 200
    assert res.json()["name"] == "New Cat"


# ── Delete Category ──


@pytest.mark.asyncio
async def test_delete_category(client, auth_headers, store_id):
    """Should delete a category."""
    create_res = await client.post(
        f"{API}/stores/{store_id}/categories",
        headers=auth_headers,
        json={"name": "To Delete"},
    )
    cat_id = create_res.json()["id"]

    res = await client.delete(f"{API}/categories/{cat_id}", headers=auth_headers)
    assert res.status_code == 204

    # Verify gone
    get_res = await client.get(f"{API}/categories/{cat_id}", headers=auth_headers)
    assert get_res.status_code == 404
