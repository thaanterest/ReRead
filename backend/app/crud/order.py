"""
CRUD operations for the Order model.
"""

import time
import uuid
import secrets
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.book import Book
from app.models.order import Order
from app.models.user import User
from app.schemas.order import OrderCreateRequest, OrderShippingUpdateRequest


def generate_order_number() -> str:
    timestamp = time.strftime("%Y%m%d")
    random_suffix = secrets.token_hex(3).upper()
    return f"ORD-{timestamp}-{random_suffix}"


async def get_order_by_id(db: AsyncSession, order_id: uuid.UUID) -> Order | None:
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id)
        .options(
            selectinload(Order.book),
            selectinload(Order.buyer),
            selectinload(Order.seller),
        )
    )
    return result.scalar_one_or_none()


async def get_orders_by_buyer(db: AsyncSession, buyer_id: uuid.UUID) -> list[Order]:
    result = await db.execute(
        select(Order)
        .where(Order.buyer_id == buyer_id)
        .options(
            selectinload(Order.book),
            selectinload(Order.buyer),
            selectinload(Order.seller),
        )
        .order_by(Order.created_at.desc())
    )
    return list(result.scalars().all())


async def get_orders_by_seller(db: AsyncSession, seller_id: uuid.UUID) -> list[Order]:
    result = await db.execute(
        select(Order)
        .where(Order.seller_id == seller_id)
        .options(
            selectinload(Order.book),
            selectinload(Order.buyer),
            selectinload(Order.seller),
        )
        .order_by(Order.created_at.desc())
    )
    return list(result.scalars().all())


async def create_order(
    db: AsyncSession,
    *,
    buyer: User,
    book: Book,
    order_in: OrderCreateRequest,
) -> Order:
    book_price = float(book.price) if book.price is not None else 0.0
    shipping_fee = 40.0
    total_amount = book_price + shipping_fee

    order = Order(
        order_number=generate_order_number(),
        book_id=book.id,
        buyer_id=buyer.id,
        seller_id=book.owner_id,
        order_type="buy",
        book_price=book_price,
        shipping_fee=shipping_fee,
        total_amount=total_amount,
        shipping_name=order_in.shipping_name,
        shipping_phone=order_in.shipping_phone,
        shipping_address=order_in.shipping_address,
        payment_method=order_in.payment_method,
        slip_url=order_in.slip_url,
        status="paid" if order_in.slip_url else "pending",
        note=order_in.note,
    )
    
    # Mark book as Pending so others cannot order or swap it simultaneously
    book.status = "Pending"

    db.add(order)
    await db.flush()
    await db.refresh(order)

    # Reload with joined relationships
    return await get_order_by_id(db, order.id)


async def update_order_shipping(
    db: AsyncSession,
    *,
    order: Order,
    shipping_in: OrderShippingUpdateRequest,
) -> Order:
    order.courier = shipping_in.courier
    order.tracking_no = shipping_in.tracking_no
    if shipping_in.shipping_photo_url:
        order.shipping_photo_url = shipping_in.shipping_photo_url
    if shipping_in.shipping_note:
        order.shipping_note = shipping_in.shipping_note
    order.status = "shipped"

    await db.flush()
    await db.refresh(order)
    return await get_order_by_id(db, order.id)


async def confirm_order_delivery(
    db: AsyncSession,
    *,
    order: Order,
) -> Order:
    order.status = "completed"
    if order.book:
        order.book.status = "Sold"

    await db.flush()
    await db.refresh(order)
    return await get_order_by_id(db, order.id)


async def cancel_order(
    db: AsyncSession,
    *,
    order: Order,
) -> Order:
    order.status = "cancelled"
    if order.book:
        order.book.status = "Available"

    await db.flush()
    await db.refresh(order)
    return await get_order_by_id(db, order.id)
