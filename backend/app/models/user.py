"""
SQLAlchemy model for the `users` table.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.book import Book
    from app.models.book_request import BookRequest
    from app.models.order import Order

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    username: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    
    # Relationships
    books: Mapped[list["Book"]] = relationship(
        "Book", back_populates="owner", cascade="all, delete-orphan"
    )
    book_requests: Mapped[list["BookRequest"]] = relationship(
        "BookRequest", back_populates="owner", cascade="all, delete-orphan"
    )
    purchases: Mapped[list["Order"]] = relationship(
        "Order", back_populates="buyer", foreign_keys="Order.buyer_id", cascade="all, delete-orphan"
    )
    sales: Mapped[list["Order"]] = relationship(
        "Order", back_populates="seller", foreign_keys="Order.seller_id", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User {self.username} ({self.id})>"
