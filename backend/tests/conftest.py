"""
Pytest fixtures for ReRead backend tests.

Uses an in-memory SQLite database to avoid requiring PostgreSQL for tests.
The get_db dependency is overridden BEFORE the app is imported so that
the asyncpg driver is never loaded.
"""

import os

# Override DATABASE_URL before any app module is imported
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:////tmp/test.db"

from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.base import Base
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import ARRAY

@compiles(ARRAY, "sqlite")
def compile_array_sqlite(type_, compiler, **kw):
    return "TEXT"

# Test engine using SQLite in container /tmp to avoid Windows volume lock latency
TEST_DATABASE_URL = "sqlite+aiosqlite:////tmp/test.db"



engine_test = create_async_engine(TEST_DATABASE_URL, echo=False)
async_session_test = async_sessionmaker(
    engine_test, class_=AsyncSession, expire_on_commit=False
)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_test() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# Import app and override dependency AFTER setting up test DB
from app.db.session import get_db  # noqa: E402
from app.main import app  # noqa: E402

app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture(autouse=True)
async def setup_database() -> AsyncGenerator[None, None]:
    """Create all tables before each test, drop after."""
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# ---------------------------------------------------------------------------
# Helper: register + login and return auth headers
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient) -> dict[str, str]:
    """Register a test user and return Authorization headers."""
    await client.post(
        "/api/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "Test1234!",
            "display_name": "Test User",
        },
    )
    resp = await client.post(
        "/api/login",
        json={"username": "testuser", "password": "Test1234!"},
    )
    token = resp.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}
