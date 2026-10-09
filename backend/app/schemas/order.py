"""
Pydantic schemas for Order-related requests and responses.
"""

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class OrderBookSummary(BaseModel):
    id: uuid.UUID
    title: str
    author: str
    cover_url: Optional[str] = None
    condition: str
    price: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class OrderUserSummary(BaseModel):
    id: uuid.UUID
    username: str
    display_name: str
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class OrderCreateRequest(BaseModel):
    book_id: uuid.UUID
    shipping_name: str = Field(..., min_length=1, max_length=100)
    shipping_phone: str = Field(..., min_length=1, max_length=50)
    shipping_address: str = Field(..., min_length=1)
    payment_method: str = Field(default="promptpay", max_length=50)
    slip_url: Optional[str] = Field(None, max_length=500)
    note: Optional[str] = None


class OrderShippingUpdateRequest(BaseModel):
    courier: str = Field(..., min_length=1, max_length=50)
    tracking_no: str = Field(..., min_length=1, max_length=100)
    shipping_photo_url: Optional[str] = Field(None, max_length=500)
    shipping_note: Optional[str] = None


class OrderStatusUpdateRequest(BaseModel):
    status: str = Field(..., max_length=50)


class OrderResponse(BaseModel):
    id: uuid.UUID
    order_number: str
    book_id: uuid.UUID
    buyer_id: uuid.UUID
    seller_id: uuid.UUID
    order_type: str
    book_price: float
    shipping_fee: float
    total_amount: float
    shipping_name: str
    shipping_phone: str
    shipping_address: str
    payment_method: str
    slip_url: Optional[str] = None
    courier: Optional[str] = None
    tracking_no: Optional[str] = None
    shipping_photo_url: Optional[str] = None
    shipping_note: Optional[str] = None
    status: str
    note: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    book: Optional[OrderBookSummary] = None
    buyer: Optional[OrderUserSummary] = None
    seller: Optional[OrderUserSummary] = None

    model_config = ConfigDict(from_attributes=True)
