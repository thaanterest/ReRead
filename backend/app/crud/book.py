"""
CRUD operations for the Book model.
"""

import uuid
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.book import Book
from app.schemas.book import BookCreateRequest, BookUpdateRequest

async def get_book_by_id(db: AsyncSession, book_id: uuid.UUID) -> Book | None:
    result = await db.execute(
        select(Book)
        .where(Book.id == book_id)
        .options(selectinload(Book.owner))
    )
    return result.scalar_one_or_none()

async def get_books_paginated(
    db: AsyncSession,
    page: int = 1,
    limit: int = 20,
    status: str | None = None,
    search: str | None = None,
    listing_type: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
) -> tuple[list[Book], int]:
    query = select(Book).options(selectinload(Book.owner))
    count_query = select(func.count(Book.id))
    
    if status:
        query = query.where(Book.status == status)
        count_query = count_query.where(Book.status == status)
        
    if listing_type and listing_type != "all":
        query = query.where((Book.listing_type == listing_type) | (Book.listing_type == "both"))
        count_query = count_query.where((Book.listing_type == listing_type) | (Book.listing_type == "both"))

    if min_price is not None:
        query = query.where(Book.price >= min_price)
        count_query = count_query.where(Book.price >= min_price)

    if max_price is not None:
        query = query.where(Book.price <= max_price)
        count_query = count_query.where(Book.price <= max_price)

    if search:
        search_filter = f"%{search}%"
        query = query.where(
            (Book.title.ilike(search_filter)) | (Book.author.ilike(search_filter))
        )
        count_query = count_query.where(
            (Book.title.ilike(search_filter)) | (Book.author.ilike(search_filter))
        )

    count_result = await db.execute(count_query)
    total = count_result.scalar_one()

    offset = (page - 1) * limit
    result = await db.execute(
        query.order_by(Book.created_at.desc()).offset(offset).limit(limit)
    )
    books = list(result.scalars().all())

    return books, total

async def get_books_by_owner(
    db: AsyncSession, owner_id: uuid.UUID
) -> list[Book]:
    result = await db.execute(
        select(Book)
        .where(Book.owner_id == owner_id)
        .options(selectinload(Book.owner))
        .order_by(Book.created_at.desc())
    )
    return list(result.scalars().all())

async def create_book(
    db: AsyncSession,
    *,
    owner_id: uuid.UUID,
    book_in: BookCreateRequest,
) -> Book:
    book = Book(
        owner_id=owner_id,
        title=book_in.title,
        author=book_in.author,
        cover_url=book_in.cover_url,
        condition=book_in.condition,
        description=book_in.description,
        tags=book_in.tags,
        status=book_in.status,
        listing_type=book_in.listing_type,
        price=book_in.price,
    )
    db.add(book)
    await db.flush()
    await db.refresh(book)
    
    # Reload with owner relationship
    return await get_book_by_id(db, book.id)

async def update_book(
    db: AsyncSession,
    book: Book,
    book_in: BookUpdateRequest,
) -> Book:
    update_data = book_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(book, field, value)
        
    await db.flush()
    await db.refresh(book)
    return book

async def delete_book(db: AsyncSession, book: Book) -> None:
    await db.delete(book)
    await db.flush()
