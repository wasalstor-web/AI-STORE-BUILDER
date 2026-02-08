"""Tests — Auth endpoints (register, login, me)."""

import pytest

TEST_USER = {
    "email": "test@example.com",
    "password": "TestPass123!",
    "full_name": "مستخدم تجريبي",
    "tenant_name": "شركة اختبار",
}


@pytest.mark.asyncio
async def test_register(client):
    response = await client.post("/api/v1/auth/register", json=TEST_USER)
    # May return 201 (success) or 409 (already exists in running DB)
    assert response.status_code in [201, 409]

    if response.status_code == 201:
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login(client):
    # Register first (ensure user exists in this test's DB state)
    reg = await client.post("/api/v1/auth/register", json=TEST_USER)
    assert reg.status_code in [201, 409]

    # Login
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"],
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": TEST_USER["email"],
            "password": "WrongPassword!",
        },
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me(client):
    # Register & get token
    reg = await client.post(
        "/api/v1/auth/register",
        json={
            **TEST_USER,
            "email": "me_test@example.com",
            "tenant_name": "شركة Me Test",
        },
    )
    if reg.status_code == 201:
        token = reg.json()["access_token"]
    else:
        # Login instead
        login = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "me_test@example.com",
                "password": TEST_USER["password"],
            },
        )
        token = login.json()["access_token"]

    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "email" in data
    assert data["role"] == "owner"
