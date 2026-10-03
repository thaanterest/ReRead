"""add_search_and_listing_indexes

Revision ID: 10fac5ff94c6
Revises: 7801ae7cecb2
Create Date: 2026-10-03 07:22:21.018024

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '10fac5ff94c6'
down_revision: Union[str, None] = '7801ae7cecb2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pg_trgm extension for trigram similarity and GIN indexes
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    # 1. Indexes on `books`
    op.create_index(
        'ix_books_status_created_at',
        'books',
        ['status', sa.text('created_at DESC')],
        unique=False
    )
    op.create_index(
        'ix_books_owner_id_created_at',
        'books',
        ['owner_id', sa.text('created_at DESC')],
        unique=False
    )
    op.create_index(
        'ix_books_created_at',
        'books',
        [sa.text('created_at DESC')],
        unique=False
    )
    op.create_index(
        'ix_books_title_trgm',
        'books',
        ['title'],
        unique=False,
        postgresql_using='gin',
        postgresql_ops={'title': 'gin_trgm_ops'}
    )
    op.create_index(
        'ix_books_author_trgm',
        'books',
        ['author'],
        unique=False,
        postgresql_using='gin',
        postgresql_ops={'author': 'gin_trgm_ops'}
    )

    # Drop old btree indexes that are either redundant or ineffective for ILIKE '%...%'
    op.drop_index('ix_books_owner_id', table_name='books')
    op.drop_index('ix_books_title', table_name='books')
    op.drop_index('ix_books_author', table_name='books')

    # 2. Indexes on `book_requests`
    op.create_index(
        'ix_book_requests_owner_id_created_at',
        'book_requests',
        ['owner_id', sa.text('created_at DESC')],
        unique=False
    )
    op.create_index(
        'ix_book_requests_created_at',
        'book_requests',
        [sa.text('created_at DESC')],
        unique=False
    )
    op.create_index(
        'ix_book_requests_title_trgm',
        'book_requests',
        ['title'],
        unique=False,
        postgresql_using='gin',
        postgresql_ops={'title': 'gin_trgm_ops'}
    )
    op.create_index(
        'ix_book_requests_author_trgm',
        'book_requests',
        ['author'],
        unique=False,
        postgresql_using='gin',
        postgresql_ops={'author': 'gin_trgm_ops'}
    )


def downgrade() -> None:
    # 1. Drop book_requests indexes
    op.drop_index('ix_book_requests_author_trgm', table_name='book_requests')
    op.drop_index('ix_book_requests_title_trgm', table_name='book_requests')
    op.drop_index('ix_book_requests_created_at', table_name='book_requests')
    op.drop_index('ix_book_requests_owner_id_created_at', table_name='book_requests')

    # 2. Drop books new indexes
    op.drop_index('ix_books_author_trgm', table_name='books')
    op.drop_index('ix_books_title_trgm', table_name='books')
    op.drop_index('ix_books_created_at', table_name='books')
    op.drop_index('ix_books_owner_id_created_at', table_name='books')
    op.drop_index('ix_books_status_created_at', table_name='books')

    # 3. Restore original btree indexes on books
    op.create_index('ix_books_author', 'books', ['author'], unique=False)
    op.create_index('ix_books_title', 'books', ['title'], unique=False)
    op.create_index('ix_books_owner_id', 'books', ['owner_id'], unique=False)
