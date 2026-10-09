"""
Pydantic schemas for User-related requests and responses.
"""

import re
import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


# ---------------------------------------------------------------------------
# Validators (reusable)
# ---------------------------------------------------------------------------

def _validate_password_complexity(password: str) -> str:
    """Enforce minimum password complexity for trust & security."""
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter")
    if not re.search(r"[0-9]", password):
        raise ValueError("Password must contain at least one digit")
    if not re.search(r"[^A-Za-z0-9]", password):
        raise ValueError("Password must contain at least one special character")
    return password


_USERNAME_PATTERN = re.compile(r"^[A-Za-z0-9_]{3,50}$")


def _validate_username(username: str) -> str:
    if not _USERNAME_PATTERN.match(username):
        raise ValueError(
            "Username must be 3-50 characters and contain only "
            "letters, digits, or underscores"
        )
    return username


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    display_name: str = Field(..., min_length=1, max_length=100)

    @field_validator("username")
    @classmethod
    def check_username(cls, v: str) -> str:
        return _validate_username(v)

    @field_validator("password")
    @classmethod
    def check_password(cls, v: str) -> str:
        return _validate_password_complexity(v)


class UserLoginRequest(BaseModel):
    username: str
    password: str


class GoogleLoginRequest(BaseModel):
    """Payload sent when authenticating via Google Identity Services."""
    id_token: str | None = None
    credential: str | None = None

    def get_token(self) -> str:
        token = (self.credential or self.id_token or "").strip()
        if not token:
            raise ValueError("Token is required (credential or id_token)")
        return token


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def check_new_password(cls, v: str) -> str:
        return _validate_password_complexity(v)


class UserUpdateRequest(BaseModel):
    display_name: str | None = Field(None, min_length=1, max_length=100)
    avatar_url: str | None = Field(None, max_length=500)


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class UserResponse(BaseModel):
    """Public user info — never includes password_hash."""

    id: uuid.UUID
    username: str
    email: str
    display_name: str
    avatar_url: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UsernameAvailableResponse(BaseModel):
    username: str
    available: bool


class PaginatedUsersResponse(BaseModel):
    users: list[UserResponse]
    total: int
    page: int
    limit: int
    total_pages: int
