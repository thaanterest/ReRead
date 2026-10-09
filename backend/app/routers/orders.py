"""
Order and Marketplace management endpoints.
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.crud.book import get_book_by_id
from app.crud.order import (
    cancel_order,
    confirm_order_delivery,
    create_order,
    get_order_by_id,
    get_orders_by_buyer,
    get_orders_by_seller,
    update_order_shipping,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import StandardResponse
from app.schemas.order import (
    OrderCreateRequest,
    OrderResponse,
    OrderShippingUpdateRequest,
)

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post(
    "",
    response_model=StandardResponse[OrderResponse],
    status_code=status.HTTP_201_CREATED,
)
async def place_order(
    body: OrderCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[OrderResponse]:
    """Place a purchase order for a second-hand book."""
    book = await get_book_by_id(db, body.book_id)
    if book is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )

    if book.owner_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot purchase your own book",
        )

    if book.status != "Available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This book is currently {book.status.lower()} and cannot be purchased",
        )

    if book.listing_type not in ["sell", "both"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This book is only available for exchange, not for sale",
        )

    order = await create_order(db, buyer=current_user, book=book, order_in=body)

    return StandardResponse(
        success=True,
        data=OrderResponse.model_validate(order),
        message="Order placed successfully",
    )


@router.get(
    "/my-orders",
    response_model=StandardResponse[list[OrderResponse]],
)
async def list_my_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[list[OrderResponse]]:
    """List orders where the current user is the buyer."""
    orders = await get_orders_by_buyer(db, current_user.id)
    return StandardResponse(
        success=True,
        data=[OrderResponse.model_validate(o) for o in orders],
        message="Your purchase orders retrieved",
    )


@router.get(
    "/my-sales",
    response_model=StandardResponse[list[OrderResponse]],
)
async def list_my_sales(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[list[OrderResponse]]:
    """List orders where the current user is the seller."""
    orders = await get_orders_by_seller(db, current_user.id)
    return StandardResponse(
        success=True,
        data=[OrderResponse.model_validate(o) for o in orders],
        message="Your sale orders retrieved",
    )


@router.get(
    "/{order_id}",
    response_model=StandardResponse[OrderResponse],
)
async def get_order_details(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[OrderResponse]:
    """Retrieve detailed order information."""
    order = await get_order_by_id(db, order_id)
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    if order.buyer_id != current_user.id and order.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this order",
        )

    return StandardResponse(
        success=True,
        data=OrderResponse.model_validate(order),
        message="Order retrieved",
    )


@router.patch(
    "/{order_id}/shipping",
    response_model=StandardResponse[OrderResponse],
)
async def update_shipping(
    order_id: uuid.UUID,
    body: OrderShippingUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[OrderResponse]:
    """Update shipment tracking info (Seller only)."""
    order = await get_order_by_id(db, order_id)
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    if order.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the seller can update shipping information",
        )

    updated_order = await update_order_shipping(db, order=order, shipping_in=body)

    return StandardResponse(
        success=True,
        data=OrderResponse.model_validate(updated_order),
        message="Shipping information updated successfully",
    )


@router.patch(
    "/{order_id}/confirm-delivery",
    response_model=StandardResponse[OrderResponse],
)
async def confirm_delivery(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[OrderResponse]:
    """Confirm package delivery and complete transaction (Buyer only)."""
    order = await get_order_by_id(db, order_id)
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    if order.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the buyer can confirm package delivery",
        )

    updated_order = await confirm_order_delivery(db, order=order)

    return StandardResponse(
        success=True,
        data=OrderResponse.model_validate(updated_order),
        message="Order delivery confirmed and completed",
    )


@router.patch(
    "/{order_id}/cancel",
    response_model=StandardResponse[OrderResponse],
)
async def cancel_existing_order(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[OrderResponse]:
    """Cancel an active order (before shipment)."""
    order = await get_order_by_id(db, order_id)
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    if order.buyer_id != current_user.id and order.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to cancel this order",
        )

    if order.status in ["shipped", "completed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel an order that has already been shipped or completed",
        )

    updated_order = await cancel_order(db, order=order)

    return StandardResponse(
        success=True,
        data=OrderResponse.model_validate(updated_order),
        message="Order cancelled successfully",
    )
