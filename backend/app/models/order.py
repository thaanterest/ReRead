"""
SQLAlchemy model for the `orders` table.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.book import Book

from sqlalchemy import DateTime, String, ForeignKey, func, Text, Numeric, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    order_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    
    book_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("books.id", ondelete="CASCADE"), nullable=False, index=True
    )
    buyer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    seller_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    order_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="buy", server_default="'buy'"
    )  # 'buy', 'swap'
    book_price: Mapped[float] = mapped_column(
        Numeric(10, 2), nullable=False, default=0.0, server_default="0.0"
    )
    shipping_fee: Mapped[float] = mapped_column(
        Numeric(10, 2), nullable=False, default=40.0, server_default="40.0"
    )
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)

    # Shipping details
    shipping_name: Mapped[str] = mapped_column(String(100), nullable=False)
    shipping_phone: Mapped[str] = mapped_column(String(50), nullable=False)
    shipping_address: Mapped[str] = mapped_column(Text, nullable=False)

    # Payment & fulfillment
    payment_method: Mapped[str] = mapped_column(
        String(50), nullable=False, default="promptpay", server_default="'promptpay'"
    )
    slip_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    courier: Mapped[str | None] = mapped_column(String(50), nullable=True)  # 'Flash Express', 'Kerry Express', etc.
    tracking_no: Mapped[str | None] = mapped_column(String(100), nullable=True)
    shipping_photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    shipping_note: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="paid", server_default="'paid'"
    )  # 'pending', 'paid', 'shipped', 'completed', 'cancelled'
    
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        Index("ix_orders_buyer_id_created_at", "buyer_id", created_at.desc()),
        Index("ix_orders_seller_id_created_at", "seller_id", created_at.desc()),
        Index("ix_orders_status_created_at", "status", created_at.desc()),
    )

    # Relationships
    book: Mapped["Book"] = relationship("Book", back_populates="orders", lazy="joined")
    buyer: Mapped["User"] = relationship(
        "User", foreign_keys=[buyer_id], back_populates="purchases", lazy="joined"
    )
    seller: Mapped["User"] = relationship(
        "User", foreign_keys=[seller_id], back_populates="sales", lazy="joined"
    )

    def __repr__(self) -> str:
        return f"<Order {self.order_number} ({self.status})>"
