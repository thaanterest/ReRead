"""
SQLAlchemy model for the `books` table.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User

from sqlalchemy import DateTime, String, ForeignKey, func, Text, Index
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Book(Base):
    __tablename__ = "books"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    author: Mapped[str] = mapped_column(String(255), nullable=False)
    cover_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    condition: Mapped[str] = mapped_column(String(50), nullable=False) # 'New', 'Like New', 'Good', 'Fair', 'Poor'
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=True, server_default="{}")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="Available", server_default="'Available'") # 'Available', 'Pending', 'Swapped'
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        Index("ix_books_status_created_at", "status", created_at.desc()),
        Index("ix_books_owner_id_created_at", "owner_id", created_at.desc()),
        Index("ix_books_created_at", created_at.desc()),
        Index(
            "ix_books_title_trgm",
            "title",
            postgresql_using="gin",
            postgresql_ops={"title": "gin_trgm_ops"},
        ),
        Index(
            "ix_books_author_trgm",
            "author",
            postgresql_using="gin",
            postgresql_ops={"author": "gin_trgm_ops"},
        ),
    )

    owner: Mapped["User"] = relationship("User", back_populates="books", lazy="joined")

    def __repr__(self) -> str:
        return f"<Book {self.title} ({self.id})>"
