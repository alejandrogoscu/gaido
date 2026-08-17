"""add game category

Revision ID: 20260817_0005
Revises: 20260815_0004
Create Date: 2026-08-17
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260817_0005"
down_revision: str | None = "20260815_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("games", sa.Column("category", sa.String(length=30), nullable=True))


def downgrade() -> None:
    op.drop_column("games", "category")
