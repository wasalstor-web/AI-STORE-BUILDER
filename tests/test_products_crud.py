"""Tests -- Products CRUD endpoints."""

import pytest

API = "/api/v1"


# ── Create Product ──


@pytest.mark.asyncio
async def test_create_product(client, auth_headers, store_id):
    """Should create a product."""
    res = await client.post(
        f"{API}/stores/{store_id}/products",
        headers=auth_headers,
        json={
            "name": "iPhone 15",
            "price": 4999.99,
            "description": "Latest iPhone",
            "stock_quantity": 50,
            "is_active": True,
        },
    )
    assert res.status_code == 201, f"Create product failed: {res.text}"
    data = res.json()
    assert data["name"] == "iPhone 15"
    assert float(data["price"]) == 4999.99
    assert data["stock_quantity"] == 50
    assert data["is_active"] is True
    assert "id" in data
    assert "slug" in data


@pytest.mark.asyncio
async def test_create_product_minimal(client, auth_headers, store_id):
    """Should create product with only required fields."""
    res = await client.post(
        f"{API}/stores/{store_id}/products",
        headers=auth_headers,
        json={"name": "Basic Product", "price": 10.0},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Basic Product"
    assert data["currency"] == "SAR"


@pytest.mark.asyncio
async def test_create_product_invalid_price(client, auth_headers, store_id):
    """Should reject negative price."""
    res = await client.post(
        f"{API}/stores/{store_id}/products",
        headers=auth_headers,
        json={"name": "Bad Product", "price": -5},
    )
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_create_product_no_auth(client, store_id):
    """Should reject unauthenticated requests."""
    res = await client.post(
        f"{API}/stores/{store_id}/products",
        json={"name": "Test", "price": 10},
    )
    assert res.status_code in [401, 403]


# ── List Products ──


@pytest.mark.asyncio
async def test_list_products_empty(client, auth_headers, store_id):
    """New store should have 0 products."""
    res = await client.get(
        f"{API}/stores/{store_id}/products", headers=auth_headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 0
    assert data["items"] == []


@pytest.mark.asyncio
async def test_list_products_after_create(client, auth_headers, store_id):
    """Should list created products."""
    # Create 2 products
    await client.post(
        f"{API}/stores/{store_id}/products",
        headers=auth_headers,
        json={"name": "Product A", "price": 100},
    )
    await client.post(
        f"{API}/stores/{store_id}/products",
        headers=auth_headers,
        json={"name": "Product B", "price": 200},
    )

    res = await client.get(
        f"{API}/stores/{store_id}/products", headers=auth_headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2


@pytest.mark.asyncio
async def test_list_products_search(client, auth_headers, store_id):
    """Should filter products by search query."""
    await client.post(
        f"{API}/stores/{store_id}/products",
        headers=auth_headers,
        json={"name": "Apple iPhone", "price": 4999},
    )
    await client.post(
        f"{API}/stores/{store_id}/products",
        headers=auth_headers,
        json={"name": "Samsung Galaxy", "price": 3999},
    )

    res = await client.get(
        f"{API}/stores/{store_id}/products",
        headers=auth_headers,
        params={"search": "iPhone"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1
    assert any("iPhone" in p["name"] for p in data["items"])


@pytest.mark.asyncio
async def test_list_products_pagination(client, auth_headers, store_id):
    """Pagination should limit results."""
    for i in range(3):
        await client.post(
            f"{API}/stores/{store_id}/products",
            headers=auth_headers,
            json={"name": f"Product {i}", "price": 10 + i},
        )

    res = await client.get(
        f"{API}/stores/{store_id}/products",
        headers=auth_headers,
        params={"page": 1, "page_size": 2},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 3
    assert len(data["items"]) == 2


# ── Get Product Detail ──


@pytest.mark.asyncio
async def test_get_product_detail(client, auth_headers, store_id):
    """Should return product details."""
    create_res = await client.post(
        f"{API}/stores/{store_id}/products",
        headers=auth_headers,
        json={
            "name": "Detail Product",
            "price": 150,
            "description": "Full details",
        },
    )
    product_id = create_res.json()["id"]

    res = await client.get(
        f"{API}/products/{product_id}", headers=auth_headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == product_id
    assert data["name"] == "Detail Product"


@pytest.mark.asyncio
async def test_get_product_not_found(client, auth_headers):
    """Should return 404 for non-existent product."""
    fake_id = "00000000-0000-0000-0000-000000000000"
    res = await client.get(f"{API}/products/{fake_id}", headers=auth_headers)
    assert res.status_code == 404


# ── Update Product ──


@pytest.mark.asyncio
async def test_update_product(client, auth_headers, store_id):
    """Should update product fields."""
    create_res = await client.post(
        f"{API}/stores/{store_id}/products",
        headers=auth_headers,
        json={"name": "Old Name", "price": 100},
    )
    product_id = create_res.json()["id"]

    res = await client.patch(
        f"{API}/products/{product_id}",
        headers=auth_headers,
        json={"name": "New Name", "price": 200, "is_featured": True},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "New Name"
    assert float(data["price"]) == 200.0
    assert data["is_featured"] is True


@pytest.mark.asyncio
async def test_update_product_partial(client, auth_headers, store_id):
    """PATCH with partial fields should only update those fields."""
    create_res = await client.post(
        f"{API}/stores/{store_id}/products",
        headers=auth_headers,
        json={"name": "Partial", "price": 50, "stock_quantity": 10},
    )
    product_id = create_res.json()["id"]

    res = await client.patch(
        f"{API}/products/{product_id}",
        headers=auth_headers,
        json={"stock_quantity": 99},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Partial"  # unchanged
    assert float(data["price"]) == 50.0  # unchanged
    assert data["stock_quantity"] == 99  # updated


# ── Delete Product ──


@pytest.mark.asyncio
async def test_delete_product(client, auth_headers, store_id):
    """Should delete a product."""
    create_res = await client.post(
        f"{API}/stores/{store_id}/products",
        headers=auth_headers,
        json={"name": "To Delete", "price": 10},
    )
    product_id = create_res.json()["id"]

    res = await client.delete(
        f"{API}/products/{product_id}", headers=auth_headers
    )
    assert res.status_code == 204

    # Verify gone
    get_res = await client.get(
        f"{API}/products/{product_id}", headers=auth_headers
    )
    assert get_res.status_code == 404


@pytest.mark.asyncio
async def test_delete_product_not_found(client, auth_headers):
    """Should return 404 for non-existent product."""
    fake_id = "00000000-0000-0000-0000-000000000000"
    res = await client.delete(f"{API}/products/{fake_id}", headers=auth_headers)
    assert res.status_code == 404
