"""restrict usernames

Revision ID: 20260813_0002
Revises: 20260812_0001
Create Date: 2026-08-13
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260813_0002"
down_revision: str | None = "20260812_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column(
        "users",
        "username",
        existing_type=sa.String(length=30),
        type_=sa.String(length=20),
        existing_nullable=False,
    )
    op.alter_column(
        "users",
        "display_name",
        existing_type=sa.String(length=30),
        type_=sa.String(length=20),
        existing_nullable=False,
    )
    op.create_check_constraint(
        "ck_users_username_length",
        "users",
        "char_length(username) BETWEEN 3 AND 20",
    )
    op.create_check_constraint(
        "ck_users_username_format",
        "users",
        "username ~ '^[a-z0-9_-]+$'",
    )
    op.create_check_constraint(
        "ck_users_display_name_length",
        "users",
        "char_length(display_name) BETWEEN 3 AND 20",
    )
    op.create_check_constraint(
        "ck_users_display_name_format",
        "users",
        "display_name ~ '^[A-Za-z0-9_-]+$'",
    )


def downgrade() -> None:
    op.drop_constraint("ck_users_display_name_format", "users", type_="check")
    op.drop_constraint("ck_users_display_name_length", "users", type_="check")
    op.drop_constraint("ck_users_username_format", "users", type_="check")
    op.drop_constraint("ck_users_username_length", "users", type_="check")
    op.alter_column(
        "users",
        "display_name",
        existing_type=sa.String(length=20),
        type_=sa.String(length=30),
        existing_nullable=False,
    )
    op.alter_column(
        "users",
        "username",
        existing_type=sa.String(length=20),
        type_=sa.String(length=30),
        existing_nullable=False,
    )