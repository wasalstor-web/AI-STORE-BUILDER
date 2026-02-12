"""Tests -- Security features (XSS, auth, tenant isolation, headers)."""

import pytest

API = "/api/v1"


# ══════════════════════════════════════════════════
#  Security Headers
# ══════════════════════════════════════════════════


@pytest.mark.asyncio
async def test_security_headers(client):
    """All responses should include security headers."""
    res = await client.get("/health")
    assert res.headers.get("x-content-type-options") == "nosniff"
    assert res.headers.get("x-frame-options") == "DENY"
    assert res.headers.get("x-xss-protection") == "1; mode=block"
    assert "strict-origin" in res.headers.get("referrer-policy", "")


# ══════════════════════════════════════════════════
#  Auth Security
# ══════════════════════════════════════════════════


@pytest.mark.asyncio
async def test_invalid_token_rejected(client):
    """Invalid JWT token should be rejected."""
    res = await client.get(
        f"{API}/stores/",
        headers={"Authorization": "Bearer invalid-token-xyz"},
    )
    assert res.status_code in [401, 403]


@pytest.mark.asyncio
async def test_expired_token_format(client):
    """Malformed bearer header should be rejected."""
    res = await client.get(
        f"{API}/stores/",
        headers={"Authorization": "NotBearer token"},
    )
    assert res.status_code in [401, 403]


@pytest.mark.asyncio
async def test_missing_auth_header(client):
    """No auth header should be rejected."""
    res = await client.get(f"{API}/stores/")
    assert res.status_code in [401, 403]


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    """Duplicate email registration should fail."""
    user = {
        "email": "dup@test.com",
        "password": "Pass123!",
        "full_name": "Dup User",
        "tenant_name": "Dup Corp",
    }
    res1 = await client.post(f"{API}/auth/register", json=user)
    assert res1.status_code == 201

    res2 = await client.post(f"{API}/auth/register", json=user)
    assert res2.status_code == 409


@pytest.mark.asyncio
async def test_register_weak_password(client):
    """Should reject weak passwords."""
    res = await client.post(
        f"{API}/auth/register",
        json={
            "email": "weak@test.com",
            "password": "123",  # too short
            "full_name": "W",
            "tenant_name": "Weak",
        },
    )
    # Should reject (422 validation error or 400)
    assert res.status_code in [400, 422]


@pytest.mark.asyncio
async def test_register_invalid_email(client):
    """Should reject invalid email format."""
    res = await client.post(
        f"{API}/auth/register",
        json={
            "email": "not-an-email",
            "password": "ValidPass123!",
            "full_name": "Test",
            "tenant_name": "Corp",
        },
    )
    assert res.status_code == 422


# ══════════════════════════════════════════════════
#  XSS Prevention (Sanitizer)
# ══════════════════════════════════════════════════


@pytest.mark.asyncio
async def test_store_html_xss_prevention(client, auth_headers, store_id):
    """Store HTML should strip malicious content."""
    xss_payloads = [
        '<img src=x onerror="alert(1)">',
        '<div onmouseover="steal()">hover</div>',
        '<a href="javascript:alert(1)">click</a>',
        '<iframe src="evil.com"></iframe>',
    ]
    for payload in xss_payloads:
        res = await client.patch(
            f"{API}/stores/{store_id}",
            headers=auth_headers,
            json={"html_content": f"<div>{payload}</div>"},
        )
        assert res.status_code == 200
        html = res.json()["config"].get("preview_html", "")
        assert "onerror" not in html, f"XSS not sanitized: {payload}"
        assert "onmouseover" not in html, f"XSS not sanitized: {payload}"
        assert "javascript:" not in html, f"XSS not sanitized: {payload}"
        assert "<iframe" not in html, f"XSS not sanitized: {payload}"
        assert "<script>" not in html, f"XSS not sanitized: {payload}"


# ══════════════════════════════════════════════════
#  Tenant Isolation
# ══════════════════════════════════════════════════


@pytest.mark.asyncio
async def test_cross_tenant_product_access(
    client, auth_headers, auth_headers_2, store_id
):
    """User 2 should NOT access User 1's products."""
    # User 1 creates product
    create_res = await client.post(
        f"{API}/stores/{store_id}/products",
        headers=auth_headers,
        json={"name": "Secret Product", "price": 999},
    )
    assert create_res.status_code == 201
    product_id = create_res.json()["id"]

    # User 2 tries to access
    get_res = await client.get(
        f"{API}/products/{product_id}", headers=auth_headers_2
    )
    assert get_res.status_code in [403, 404], "Tenant isolation breach!"


@pytest.mark.asyncio
async def test_cross_tenant_store_delete(
    client, auth_headers, auth_headers_2, store_id
):
    """User 2 should NOT delete User 1's store."""
    res = await client.delete(
        f"{API}/stores/{store_id}", headers=auth_headers_2
    )
    assert res.status_code in [403, 404], "Tenant isolation breach!"


# ══════════════════════════════════════════════════
#  Rate Limiting (existence check)
# ══════════════════════════════════════════════════


@pytest.mark.asyncio
async def test_health_endpoint_accessible(client):
    """Health endpoint should always be accessible."""
    for _ in range(5):
        res = await client.get("/health")
        assert res.status_code == 200
