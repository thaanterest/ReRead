"""
Book management endpoints.
"""

import math
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.crud.book import (
    create_book,
    delete_book,
    get_book_by_id,
    get_books_by_owner,
    get_books_paginated,
    update_book,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.book import (
    BookCreateRequest,
    BookResponse,
    BookUpdateRequest,
    PaginatedBooksResponse,
)
from app.schemas.common import StandardResponse

router = APIRouter(tags=["Books"])


@router.get(
    "/books",
    response_model=StandardResponse[PaginatedBooksResponse],
)
async def list_books(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status (e.g., Available)"),
    search: Optional[str] = Query(None, description="Search by title or author"),
    listing_type: Optional[str] = Query(None, description="Filter by listing type (sell, exchange, both)"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[PaginatedBooksResponse]:
    books, total = await get_books_paginated(
        db,
        page=page,
        limit=limit,
        status=status,
        search=search,
        listing_type=listing_type,
        min_price=min_price,
        max_price=max_price,
    )
    total_pages = math.ceil(total / limit) if total > 0 else 0

    return StandardResponse(
        success=True,
        data=PaginatedBooksResponse(
            books=[BookResponse.model_validate(b) for b in books],
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
        ),
        message="Books retrieved",
    )


@router.get(
    "/books/me",
    response_model=StandardResponse[list[BookResponse]],
)
async def list_my_books(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[list[BookResponse]]:
    books = await get_books_by_owner(db, current_user.id)
    
    return StandardResponse(
        success=True,
        data=[BookResponse.model_validate(b) for b in books],
        message="Your books retrieved",
    )


@router.get(
    "/books/{book_id}",
    response_model=StandardResponse[BookResponse],
)
async def get_book(
    book_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[BookResponse]:
    book = await get_book_by_id(db, book_id)
    if book is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )

    return StandardResponse(
        success=True,
        data=BookResponse.model_validate(book),
        message="Book retrieved",
    )


@router.post(
    "/books",
    response_model=StandardResponse[BookResponse],
    status_code=status.HTTP_201_CREATED,
)
async def add_book(
    body: BookCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[BookResponse]:
    book = await create_book(db, owner_id=current_user.id, book_in=body)
    
    return StandardResponse(
        success=True,
        data=BookResponse.model_validate(book),
        message="Book created successfully",
    )


@router.put(
    "/books/{book_id}",
    response_model=StandardResponse[BookResponse],
)
async def edit_book(
    book_id: uuid.UUID,
    body: BookUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[BookResponse]:
    book = await get_book_by_id(db, book_id)
    if book is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )
        
    if book.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own books",
        )

    updated = await update_book(db, book, book_in=body)

    return StandardResponse(
        success=True,
        data=BookResponse.model_validate(updated),
        message="Book updated successfully",
    )


@router.delete(
    "/books/{book_id}",
    response_model=StandardResponse[None],
)
async def remove_book(
    book_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[None]:
    book = await get_book_by_id(db, book_id)
    if book is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )
        
    if book.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own books",
        )

    await delete_book(db, book)

    return StandardResponse(
        success=True,
        data=None,
        message="Book deleted successfully",
    )
