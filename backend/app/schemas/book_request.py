import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

class BookRequestOwner(BaseModel):
    id: uuid.UUID
    name: str = Field(..., alias="display_name")
    avatar_url: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

class BookRequestBase(BaseModel):
    title: str = Field(..., max_length=255)
    author: str = Field(..., max_length=255)
    description: Optional[str] = None

class BookRequestCreate(BookRequestBase):
    pass

class BookRequestResponse(BookRequestBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    owner: BookRequestOwner
    offers: int = 0  # Default to 0 for now until we have an offers system

    model_config = ConfigDict(from_attributes=True)

class PaginatedBookRequestsResponse(BaseModel):
    requests: list[BookRequestResponse]
    total: int
    page: int
    limit: int
    total_pages: int
