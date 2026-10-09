"""
Pydantic schemas for Book-related requests and responses.
"""

import uuid
from datetime import datetime
from pydantic import BaseModel, Field

from app.schemas.user import UserResponse

class BookBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    author: str = Field(..., min_length=1, max_length=255)
    cover_url: str | None = Field(None, max_length=500)
    condition: str = Field(..., max_length=50)
    description: str | None = Field(None)
    tags: list[str] = Field(default_factory=list)
    status: str = Field(default="Available", max_length=50)
    listing_type: str = Field(default="both", max_length=20)
    price: float | None = Field(default=None, ge=0)

class BookCreateRequest(BookBase):
    pass

class BookUpdateRequest(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    author: str | None = Field(None, min_length=1, max_length=255)
    cover_url: str | None = Field(None, max_length=500)
    condition: str | None = Field(None, max_length=50)
    description: str | None = Field(None)
    tags: list[str] | None = None
    status: str | None = Field(None, max_length=50)
    listing_type: str | None = Field(None, max_length=20)
    price: float | None = Field(None, ge=0)

class BookResponse(BookBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    owner: UserResponse | None = None

    model_config = {"from_attributes": True}

class PaginatedBooksResponse(BaseModel):
    books: list[BookResponse]
    total: int
    page: int
    limit: int
    total_pages: int
