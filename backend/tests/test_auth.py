"""
Tests for authentication endpoints.
"""

import pytest
from httpx import AsyncClient


# ---------------------------------------------------------------------------
# POST /api/register
# ---------------------------------------------------------------------------

class TestRegister:
    @pytest.mark.asyncio
    async def test_register_success(self, client: AsyncClient) -> None:
        resp = await client.post(
            "/api/register",
            json={
                "username": "newuser",
                "email": "new@example.com",
                "password": "Str0ng!Pass",
                "display_name": "New User",
            },
        )
        assert resp.status_code == 201
        body = resp.json()
        assert body["success"] is True
        assert body["data"]["username"] == "newuser"
        assert body["data"]["email"] == "new@example.com"
        # password_hash must never be exposed
        assert "password_hash" not in body["data"]

    @pytest.mark.asyncio
    async def test_register_duplicate_username(self, client: AsyncClient) -> None:
        payload = {
            "username": "dupuser",
            "email": "dup1@example.com",
            "password": "Str0ng!Pass",
            "display_name": "Dup User",
        }
        await client.post("/api/register", json=payload)
        # Same username, different email
        payload["email"] = "dup2@example.com"
        resp = await client.post("/api/register", json=payload)
        assert resp.status_code == 409
        assert "already taken" in resp.json()["detail"]

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, client: AsyncClient) -> None:
        payload = {
            "username": "user_a",
            "email": "same@example.com",
            "password": "Str0ng!Pass",
            "display_name": "User A",
        }
        await client.post("/api/register", json=payload)
        payload["username"] = "user_b"
        resp = await client.post("/api/register", json=payload)
        assert resp.status_code == 409
        assert "already registered" in resp.json()["detail"]

    @pytest.mark.asyncio
    async def test_register_weak_password(self, client: AsyncClient) -> None:
        resp = await client.post(
            "/api/register",
            json={
                "username": "weakpwd",
                "email": "weak@example.com",
                "password": "short",
                "display_name": "Weak",
            },
        )
        assert resp.status_code == 422  # Pydantic validation error

    @pytest.mark.asyncio
    async def test_register_invalid_username(self, client: AsyncClient) -> None:
        resp = await client.post(
            "/api/register",
            json={
                "username": "ab",  # too short
                "email": "short@example.com",
                "password": "Str0ng!Pass",
                "display_name": "Short",
            },
        )
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# POST /api/login
# ---------------------------------------------------------------------------

class TestLogin:
    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient) -> None:
        # Register first
        await client.post(
            "/api/register",
            json={
                "username": "loginuser",
                "email": "login@example.com",
                "password": "Str0ng!Pass",
                "display_name": "Login User",
            },
        )
        resp = await client.post(
            "/api/login",
            json={"username": "loginuser", "password": "Str0ng!Pass"},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["success"] is True
        assert "access_token" in body["data"]
        assert body["data"]["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client: AsyncClient) -> None:
        await client.post(
            "/api/register",
            json={
                "username": "wrongpwd",
                "email": "wrong@example.com",
                "password": "Str0ng!Pass",
                "display_name": "Wrong",
            },
        )
        resp = await client.post(
            "/api/login",
            json={"username": "wrongpwd", "password": "WrongPassword1!"},
        )
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, client: AsyncClient) -> None:
        resp = await client.post(
            "/api/login",
            json={"username": "ghost", "password": "Str0ng!Pass"},
        )
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# POST /api/logout
# ---------------------------------------------------------------------------

class TestLogout:
    @pytest.mark.asyncio
    async def test_logout_success(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ) -> None:
        resp = await client.post("/api/logout", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    @pytest.mark.asyncio
    async def test_logout_no_token(self, client: AsyncClient) -> None:
        resp = await client.post("/api/logout")
        # HTTPBearer returns 403 when no credentials provided at all
        assert resp.status_code in (401, 403)



# ---------------------------------------------------------------------------
# POST /api/change-password
# ---------------------------------------------------------------------------

class TestChangePassword:
    @pytest.mark.asyncio
    async def test_change_password_success(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ) -> None:
        resp = await client.post(
            "/api/change-password",
            json={"old_password": "Test1234!", "new_password": "NewStr0ng!Pass"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["success"] is True

        # Verify new password works
        resp = await client.post(
            "/api/login",
            json={"username": "testuser", "password": "NewStr0ng!Pass"},
        )
        assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_change_password_wrong_old(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ) -> None:
        resp = await client.post(
            "/api/change-password",
            json={"old_password": "WrongOld1!", "new_password": "NewStr0ng!Pass"},
            headers=auth_headers,
        )
        assert resp.status_code == 400

    @pytest.mark.asyncio
    async def test_change_password_same_as_old(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ) -> None:
        resp = await client.post(
            "/api/change-password",
            json={"old_password": "Test1234!", "new_password": "Test1234!"},
            headers=auth_headers,
        )
        assert resp.status_code == 400
        assert "different" in resp.json()["detail"]


# ---------------------------------------------------------------------------
# POST /api/auth/google
# ---------------------------------------------------------------------------

class TestGoogleLogin:
    @pytest.mark.asyncio
    async def test_google_login_missing_token(self, client: AsyncClient) -> None:
        resp = await client.post(
            "/api/auth/google",
            json={},
        )
        assert resp.status_code == 400
        assert "Token is required" in resp.json()["detail"]

    @pytest.mark.asyncio
    async def test_google_login_invalid_token(self, client: AsyncClient) -> None:
        resp = await client.post(
            "/api/auth/google",
            json={"credential": "bogus_google_token"},
        )
        assert resp.status_code == 401
        assert "Invalid Google token" in resp.json()["detail"]

    @pytest.mark.asyncio
    async def test_google_login_success_new_user(self, client: AsyncClient, monkeypatch: pytest.MonkeyPatch) -> None:
        from app.routers import auth as auth_router

        async def fake_verify(token_str: str):
            return {
                "email": "fresh_google_user@example.com",
                "display_name": "Fresh Google Reader",
                "avatar_url": "https://lh3.googleusercontent.com/avatar123",
                "google_id": "google_uid_99999",
            }

        monkeypatch.setattr(auth_router, "verify_google_id_token", fake_verify)

        resp = await client.post(
            "/api/auth/google",
            json={"credential": "mock_valid_token"},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["success"] is True
        token = body["data"]["access_token"]
        assert token

        # Verify new user can access /api/me
        me_resp = await client.get(
            "/api/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert me_resp.status_code == 200
        me_data = me_resp.json()["data"]
        assert me_data["email"] == "fresh_google_user@example.com"
        assert me_data["display_name"] == "Fresh Google Reader"
        assert me_data["avatar_url"] == "https://lh3.googleusercontent.com/avatar123"

    @pytest.mark.asyncio
    async def test_google_login_success_existing_user(self, client: AsyncClient, monkeypatch: pytest.MonkeyPatch) -> None:
        from app.routers import auth as auth_router

        # 1. First register user normally
        reg_resp = await client.post(
            "/api/register",
            json={
                "username": "preexisting_user",
                "email": "preexisting@example.com",
                "password": "Str0ng!Pass123",
                "display_name": "Pre-existing User",
            },
        )
        assert reg_resp.status_code == 201

        # 2. Login via Google with identical email
        async def fake_verify(token_str: str):
            return {
                "email": "preexisting@example.com",
                "display_name": "Pre-existing Google Name",
                "avatar_url": "https://lh3.googleusercontent.com/avatar_pre",
                "google_id": "google_uid_88888",
            }

        monkeypatch.setattr(auth_router, "verify_google_id_token", fake_verify)

        resp = await client.post(
            "/api/auth/google",
            json={"credential": "mock_valid_token"},
        )
        assert resp.status_code == 200
        token = resp.json()["data"]["access_token"]

        # Confirm identity matches existing user
        me_resp = await client.get(
            "/api/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert me_resp.status_code == 200
        me_data = me_resp.json()["data"]
        assert me_data["username"] == "preexisting_user"
        assert me_data["email"] == "preexisting@example.com"

