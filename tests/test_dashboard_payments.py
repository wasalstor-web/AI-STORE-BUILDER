"""Tests -- Dashboard & Payments & Uploads endpoints."""

import pytest

API = "/api/v1"


# ══════════════════════════════════════════════════
#  Dashboard
# ══════════════════════════════════════════════════


@pytest.mark.asyncio
async def test_dashboard_stats(client, auth_headers):
    """Should return dashboard statistics."""
    res = await client.get(f"{API}/dashboard/stats", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_stores" in data
    assert "active_stores" in data
    assert "total_products" in data
    assert "total_orders" in data
    assert "total_revenue" in data


@pytest.mark.asyncio
async def test_dashboard_stats_no_auth(client):
    """Should reject unauthenticated requests."""
    res = await client.get(f"{API}/dashboard/stats")
    assert res.status_code in [401, 403]


@pytest.mark.asyncio
async def test_dashboard_stats_with_data(client, auth_headers, store_id):
    """Should show correct counts after creating data."""
    # Create a product
    await client.post(
        f"{API}/stores/{store_id}/products",
        headers=auth_headers,
        json={"name": "Dashboard Product", "price": 50},
    )

    res = await client.get(f"{API}/dashboard/stats", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_stores"] >= 1
    assert data["total_products"] >= 1


# ══════════════════════════════════════════════════
#  Payments
# ══════════════════════════════════════════════════


@pytest.mark.asyncio
async def test_payment_callback_nonexistent(client):
    """Payment callback for non-existent order should handle gracefully."""
    res = await client.get(
        f"{API}/payments/callback/ORD-FAKE-999",
        params={"status": "paid", "id": "pay_123"},
    )
    # Should return some response (maybe 404 or redirect)
    assert res.status_code in [200, 404, 302]


@pytest.mark.asyncio
async def test_payment_webhook_empty(client):
    """Empty webhook should be handled."""
    res = await client.post(
        f"{API}/payments/webhook",
        json={"type": "payment", "data": {}},
    )
    # Should not crash
    assert res.status_code in [200, 400, 422]


# ══════════════════════════════════════════════════
#  Uploads
# ══════════════════════════════════════════════════


@pytest.mark.asyncio
async def test_upload_no_auth(client):
    """Should reject unauthenticated upload."""
    res = await client.post(f"{API}/upload/image")
    assert res.status_code in [401, 403, 422]


@pytest.mark.asyncio
async def test_upload_invalid_file_type(client, auth_headers):
    """Should reject non-image files."""
    import io

    fake_file = io.BytesIO(b"not an image content")
    res = await client.post(
        f"{API}/upload/image",
        headers=auth_headers,
        files={"file": ("test.txt", fake_file, "text/plain")},
        data={"folder": "test"},
    )
    # Should reject non-image MIME type
    assert res.status_code in [400, 415, 422]
