"""add_selling_fields_and_orders_table

Revision ID: 24b7a12c8901
Revises: 10fac5ff94c6
Create Date: 2026-10-09 21:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '24b7a12c8901'
down_revision: Union[str, None] = '10fac5ff94c6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add selling fields to `books`
    op.add_column(
        'books',
        sa.Column('listing_type', sa.String(length=20), server_default='both', nullable=False)
    )
    op.add_column(
        'books',
        sa.Column('price', sa.Numeric(precision=10, scale=2), nullable=True)
    )

    # 2. Create `orders` table
    op.create_table(
        'orders',
        sa.Column(
            'id',
            postgresql.UUID(as_uuid=True),
            server_default=sa.text('gen_random_uuid()'),
            nullable=False
        ),
        sa.Column('order_number', sa.String(length=50), nullable=False),
        sa.Column('book_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('buyer_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('seller_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('order_type', sa.String(length=20), server_default='buy', nullable=False),
        sa.Column('book_price', sa.Numeric(precision=10, scale=2), server_default='0.0', nullable=False),
        sa.Column('shipping_fee', sa.Numeric(precision=10, scale=2), server_default='40.0', nullable=False),
        sa.Column('total_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('shipping_name', sa.String(length=100), nullable=False),
        sa.Column('shipping_phone', sa.String(length=50), nullable=False),
        sa.Column('shipping_address', sa.Text(), nullable=False),
        sa.Column('payment_method', sa.String(length=50), server_default='promptpay', nullable=False),
        sa.Column('slip_url', sa.String(length=500), nullable=True),
        sa.Column('courier', sa.String(length=50), nullable=True),
        sa.Column('tracking_no', sa.String(length=100), nullable=True),
        sa.Column('shipping_photo_url', sa.String(length=500), nullable=True),
        sa.Column('shipping_note', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), server_default='paid', nullable=False),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['book_id'], ['books.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['buyer_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['seller_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 3. Create indexes on `orders`
    op.create_index('ix_orders_order_number', 'orders', ['order_number'], unique=True)
    op.create_index('ix_orders_book_id', 'orders', ['book_id'], unique=False)
    op.create_index(
        'ix_orders_buyer_id_created_at',
        'orders',
        ['buyer_id', sa.text('created_at DESC')],
        unique=False
    )
    op.create_index(
        'ix_orders_seller_id_created_at',
        'orders',
        ['seller_id', sa.text('created_at DESC')],
        unique=False
    )
    op.create_index(
        'ix_orders_status_created_at',
        'orders',
        ['status', sa.text('created_at DESC')],
        unique=False
    )


def downgrade() -> None:
    op.drop_index('ix_orders_status_created_at', table_name='orders')
    op.drop_index('ix_orders_seller_id_created_at', table_name='orders')
    op.drop_index('ix_orders_buyer_id_created_at', table_name='orders')
    op.drop_index('ix_orders_book_id', table_name='orders')
    op.drop_index('ix_orders_order_number', table_name='orders')
    op.drop_table('orders')
    op.drop_column('books', 'price')
    op.drop_column('books', 'listing_type')
