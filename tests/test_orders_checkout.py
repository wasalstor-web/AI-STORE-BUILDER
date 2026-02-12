"""Tests -- Orders & Checkout endpoints."""

import pytest

API = "/api/v1"


async def _create_product(client, auth_headers, store_id, name="Test Product", price=100):
    """Helper to create a product and return its id."""
    res = await client.post(
        f"{API}/stores/{store_id}/products",
        headers=auth_headers,
        json={"name": name, "price": price, "stock_quantity": 50},
    )
    assert res.status_code == 201, f"Create product failed: {res.text}"
    return res.json()["id"]


async def _checkout(client, auth_headers, store_id, product_id, quantity=1):
    """Helper to create an order via checkout."""
    return await client.post(
        f"{API}/stores/{store_id}/checkout",
        headers=auth_headers,
        json={
            "items": [{"product_id": product_id, "quantity": quantity}],
            "customer_name": "Ahmed Ali",
            "customer_email": "ahmed@example.com",
            "customer_phone": "+966500000000",
            "shipping_address": {
                "street": "123 Main St",
                "city": "Riyadh",
                "country": "SA",
            },
            "payment_method": "cod",
        },
    )


# ── Checkout (Create Order) ──


@pytest.mark.asyncio
async def test_checkout_success(client, auth_headers, store_id):
    """Should create an order via checkout."""
    product_id = await _create_product(client, auth_headers, store_id)

    res = await _checkout(client, auth_headers, store_id, product_id)
    assert res.status_code == 201, f"Checkout failed: {res.text}"
    data = res.json()
    assert "id" in data
    assert "order_number" in data
    assert data["customer_name"] == "Ahmed Ali"
    assert data["customer_email"] == "ahmed@example.com"
    assert data["payment_method"] == "cod"
    assert data["status"] == "pending"
    assert len(data["items"]) == 1


@pytest.mark.asyncio
async def test_checkout_multiple_items(client, auth_headers, store_id):
    """Should handle multiple items in one order."""
    p1 = await _create_product(client, auth_headers, store_id, "Item A", 50)
    p2 = await _create_product(client, auth_headers, store_id, "Item B", 75)

    res = await client.post(
        f"{API}/stores/{store_id}/checkout",
        headers=auth_headers,
        json={
            "items": [
                {"product_id": p1, "quantity": 2},
                {"product_id": p2, "quantity": 1},
            ],
            "customer_name": "Sara",
            "customer_email": "sara@test.com",
            "shipping_address": {"city": "Jeddah", "country": "SA"},
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert len(data["items"]) == 2


@pytest.mark.asyncio
async def test_checkout_empty_items(client, auth_headers, store_id):
    """Should reject checkout with empty items."""
    res = await client.post(
        f"{API}/stores/{store_id}/checkout",
        headers=auth_headers,
        json={
            "items": [],
            "customer_name": "Test",
            "customer_email": "test@test.com",
            "shipping_address": {"city": "Riyadh"},
        },
    )
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_checkout_invalid_email(client, auth_headers, store_id):
    """Should reject invalid email."""
    product_id = await _create_product(client, auth_headers, store_id)

    res = await client.post(
        f"{API}/stores/{store_id}/checkout",
        headers=auth_headers,
        json={
            "items": [{"product_id": product_id, "quantity": 1}],
            "customer_name": "Test",
            "customer_email": "not-an-email",
            "shipping_address": {"city": "Riyadh"},
        },
    )
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_checkout_no_auth(client, store_id):
    """Should reject unauthenticated checkout."""
    res = await client.post(
        f"{API}/stores/{store_id}/checkout",
        json={
            "items": [{"product_id": "fake-id", "quantity": 1}],
            "customer_name": "Test",
            "customer_email": "t@t.com",
            "shipping_address": {},
        },
    )
    assert res.status_code in [401, 403]


# ── List Orders ──


@pytest.mark.asyncio
async def test_list_orders_empty(client, auth_headers, store_id):
    """New store should have 0 orders."""
    res = await client.get(
        f"{API}/stores/{store_id}/orders", headers=auth_headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_list_orders_after_checkout(client, auth_headers, store_id):
    """Should list orders after checkout."""
    product_id = await _create_product(client, auth_headers, store_id)
    await _checkout(client, auth_headers, store_id, product_id)

    res = await client.get(
        f"{API}/stores/{store_id}/orders", headers=auth_headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1


@pytest.mark.asyncio
async def test_list_orders_filter_by_status(client, auth_headers, store_id):
    """Should filter orders by status."""
    product_id = await _create_product(client, auth_headers, store_id)
    await _checkout(client, auth_headers, store_id, product_id)

    res = await client.get(
        f"{API}/stores/{store_id}/orders",
        headers=auth_headers,
        params={"status": "pending"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1


# ── Get Order Detail ──


@pytest.mark.asyncio
async def test_get_order_detail(client, auth_headers, store_id):
    """Should return order details with items."""
    product_id = await _create_product(client, auth_headers, store_id)
    checkout_res = await _checkout(client, auth_headers, store_id, product_id, 3)
    order_id = checkout_res.json()["id"]

    res = await client.get(f"{API}/orders/{order_id}", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == order_id
    assert len(data["items"]) >= 1
    assert data["items"][0]["quantity"] == 3


@pytest.mark.asyncio
async def test_get_order_not_found(client, auth_headers):
    """Should return 404."""
    fake_id = "00000000-0000-0000-0000-000000000000"
    res = await client.get(f"{API}/orders/{fake_id}", headers=auth_headers)
    assert res.status_code == 404


# ── Update Order Status ──


@pytest.mark.asyncio
async def test_update_order_status(client, auth_headers, store_id):
    """Should update order status."""
    product_id = await _create_product(client, auth_headers, store_id)
    checkout_res = await _checkout(client, auth_headers, store_id, product_id)
    order_id = checkout_res.json()["id"]

    res = await client.patch(
        f"{API}/orders/{order_id}",
        headers=auth_headers,
        json={"status": "confirmed"},
    )
    assert res.status_code == 200
    assert res.json()["status"] == "confirmed"


@pytest.mark.asyncio
async def test_update_order_tracking(client, auth_headers, store_id):
    """Should update order with tracking number."""
    product_id = await _create_product(client, auth_headers, store_id)
    checkout_res = await _checkout(client, auth_headers, store_id, product_id)
    order_id = checkout_res.json()["id"]

    res = await client.patch(
        f"{API}/orders/{order_id}",
        headers=auth_headers,
        json={
            "status": "shipped",
            "tracking_number": "TRACK-12345",
            "shipping_method": "aramex",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["tracking_number"] == "TRACK-12345"


# ── Order Summary ──


@pytest.mark.asyncio
async def test_order_summary_empty(client, auth_headers, store_id):
    """Empty store should have zero summary."""
    res = await client.get(
        f"{API}/stores/{store_id}/orders/summary", headers=auth_headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_orders"] == 0
    assert float(data["total_revenue"]) == 0


@pytest.mark.asyncio
async def test_order_summary_with_orders(client, auth_headers, store_id):
    """Should return correct summary."""
    product_id = await _create_product(client, auth_headers, store_id, "P", 100)
    await _checkout(client, auth_headers, store_id, product_id, 2)

    res = await client.get(
        f"{API}/stores/{store_id}/orders/summary", headers=auth_headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_orders"] >= 1
    assert data["pending_orders"] >= 1
