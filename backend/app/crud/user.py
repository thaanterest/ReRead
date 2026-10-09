"""
CRUD operations for the User model.

All database logic lives here — routers never touch SQLAlchemy directly.
"""

import math
import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.user import User


# ---------------------------------------------------------------------------
# Read
# ---------------------------------------------------------------------------

async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_username(db: AsyncSession, username: str) -> User | None:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_users_paginated(
    db: AsyncSession, page: int = 1, limit: int = 20
) -> tuple[list[User], int]:
    """Return (users, total_count) with offset-based pagination."""
    # Total count
    count_result = await db.execute(select(func.count(User.id)))
    total = count_result.scalar_one()

    # Paginated results
    offset = (page - 1) * limit
    result = await db.execute(
        select(User)
        .order_by(User.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    users = list(result.scalars().all())

    return users, total


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------

async def create_user(
    db: AsyncSession,
    *,
    username: str,
    email: str,
    password: str,
    display_name: str,
    avatar_url: str | None = None,
) -> User:
    user = User(
        username=username,
        email=email,
        password_hash=hash_password(password),
        display_name=display_name,
        avatar_url=avatar_url,
    )
    db.add(user)
    await db.flush()          # populate id & defaults without committing
    await db.refresh(user)    # load server-generated fields
    return user



# ---------------------------------------------------------------------------
# Update
# ---------------------------------------------------------------------------

async def update_user(
    db: AsyncSession,
    user: User,
    *,
    display_name: str | None = None,
    avatar_url: str | None = None,
) -> User:
    if display_name is not None:
        user.display_name = display_name
    if avatar_url is not None:
        user.avatar_url = avatar_url
    await db.flush()
    await db.refresh(user)
    return user


async def update_password(db: AsyncSession, user: User, new_password: str) -> None:
    user.password_hash = hash_password(new_password)
    await db.flush()


# ---------------------------------------------------------------------------
# Delete
# ---------------------------------------------------------------------------

async def delete_user(db: AsyncSession, user: User) -> None:
    await db.delete(user)
    await db.flush()
