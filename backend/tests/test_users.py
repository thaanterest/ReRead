"""
Tests for user management endpoints.
"""

import pytest
from httpx import AsyncClient


# ---------------------------------------------------------------------------
# GET /api/me
# ---------------------------------------------------------------------------

class TestGetMe:
    @pytest.mark.asyncio
    async def test_get_me_success(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ) -> None:
        resp = await client.get("/api/me", headers=auth_headers)
        assert resp.status_code == 200
        body = resp.json()
        assert body["success"] is True
        assert body["data"]["username"] == "testuser"
        assert body["data"]["email"] == "test@example.com"

    @pytest.mark.asyncio
    async def test_get_me_no_auth(self, client: AsyncClient) -> None:
        resp = await client.get("/api/me")
        assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# GET /api/users
# ---------------------------------------------------------------------------

class TestListUsers:
    @pytest.mark.asyncio
    async def test_list_users_empty(self, client: AsyncClient) -> None:
        resp = await client.get("/api/users")
        assert resp.status_code == 200
        body = resp.json()
        assert body["data"]["total"] == 0
        assert body["data"]["users"] == []

    @pytest.mark.asyncio
    async def test_list_users_with_data(self, client: AsyncClient) -> None:
        # Create 3 users
        for i in range(3):
            await client.post(
                "/api/register",
                json={
                    "username": f"user_{i}",
                    "email": f"user{i}@example.com",
                    "password": "Str0ng!Pass",
                    "display_name": f"User {i}",
                },
            )
        resp = await client.get("/api/users?page=1&limit=2")
        assert resp.status_code == 200
        body = resp.json()
        assert body["data"]["total"] == 3
        assert len(body["data"]["users"]) == 2
        assert body["data"]["total_pages"] == 2


# ---------------------------------------------------------------------------
# GET /api/users/{id}
# ---------------------------------------------------------------------------

class TestGetUser:
    @pytest.mark.asyncio
    async def test_get_user_success(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ) -> None:
        # Get own user id from /me
        me_resp = await client.get("/api/me", headers=auth_headers)
        user_id = me_resp.json()["data"]["id"]

        resp = await client.get(f"/api/users/{user_id}")
        assert resp.status_code == 200
        assert resp.json()["data"]["username"] == "testuser"

    @pytest.mark.asyncio
    async def test_get_user_not_found(self, client: AsyncClient) -> None:
        fake_id = "00000000-0000-0000-0000-000000000000"
        resp = await client.get(f"/api/users/{fake_id}")
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# PUT /api/users/{id}
# ---------------------------------------------------------------------------

class TestUpdateUser:
    @pytest.mark.asyncio
    async def test_update_own_profile(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ) -> None:
        me_resp = await client.get("/api/me", headers=auth_headers)
        user_id = me_resp.json()["data"]["id"]

        resp = await client.put(
            f"/api/users/{user_id}",
            json={"display_name": "Updated Name"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["data"]["display_name"] == "Updated Name"

    @pytest.mark.asyncio
    async def test_update_other_user_forbidden(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ) -> None:
        # Create another user
        await client.post(
            "/api/register",
            json={
                "username": "other_user",
                "email": "other@example.com",
                "password": "Str0ng!Pass",
                "display_name": "Other",
            },
        )
        # Login as other user to get their ID
        login_resp = await client.post(
            "/api/login",
            json={"username": "other_user", "password": "Str0ng!Pass"},
        )
        other_token = login_resp.json()["data"]["access_token"]
        other_headers = {"Authorization": f"Bearer {other_token}"}
        other_me = await client.get("/api/me", headers=other_headers)
        other_id = other_me.json()["data"]["id"]

        # Try to update other user's profile with original auth
        resp = await client.put(
            f"/api/users/{other_id}",
            json={"display_name": "Hacked"},
            headers=auth_headers,
        )
        assert resp.status_code == 403


# ---------------------------------------------------------------------------
# DELETE /api/users/{id}
# ---------------------------------------------------------------------------

class TestDeleteUser:
    @pytest.mark.asyncio
    async def test_delete_own_account(self, client: AsyncClient) -> None:
        # Create and login
        await client.post(
            "/api/register",
            json={
                "username": "todelete",
                "email": "delete@example.com",
                "password": "Str0ng!Pass",
                "display_name": "Delete Me",
            },
        )
        login_resp = await client.post(
            "/api/login",
            json={"username": "todelete", "password": "Str0ng!Pass"},
        )
        token = login_resp.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        me_resp = await client.get("/api/me", headers=headers)
        user_id = me_resp.json()["data"]["id"]

        resp = await client.delete(f"/api/users/{user_id}", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["success"] is True

        # Verify user no longer exists
        resp = await client.get(f"/api/users/{user_id}")
        assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_other_user_forbidden(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ) -> None:
        fake_id = "00000000-0000-0000-0000-000000000000"
        resp = await client.delete(f"/api/users/{fake_id}", headers=auth_headers)
        assert resp.status_code == 403


# ---------------------------------------------------------------------------
# GET /api/check-username/{name}
# ---------------------------------------------------------------------------

class TestCheckUsername:
    @pytest.mark.asyncio
    async def test_username_available(self, client: AsyncClient) -> None:
        resp = await client.get("/api/check-username/fresh_name")
        assert resp.status_code == 200
        body = resp.json()
        assert body["data"]["available"] is True

    @pytest.mark.asyncio
    async def test_username_taken(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ) -> None:
        # auth_headers fixture already registered "testuser"
        resp = await client.get("/api/check-username/testuser")
        assert resp.status_code == 200
        body = resp.json()
        assert body["data"]["available"] is False
        assert "already taken" in body["message"]
