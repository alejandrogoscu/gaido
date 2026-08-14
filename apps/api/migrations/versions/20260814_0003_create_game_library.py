"""create game catalog and library

Revision ID: 20260814_0003
Revises: 20260813_0002
Create Date: 2026-08-14
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260814_0003"
down_revision: str | None = "20260813_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "games",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("igdb_id", sa.BigInteger(), nullable=False),
        sa.Column("first_release_date", sa.Date(), nullable=True),
        sa.Column("igdb_updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("synced_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("igdb_id", name="uq_games_igdb_id"),
    )
    op.create_table(
        "platforms",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("igdb_id", sa.BigInteger(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("abbreviation", sa.String(length=30), nullable=True),
        sa.Column("synced_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("igdb_id", name="uq_platforms_igdb_id"),
    )
    op.create_table(
        "game_localizations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("game_id", sa.Integer(), nullable=False),
        sa.Column("locale", sa.String(length=10), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["game_id"], ["games.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "game_id",
            "locale",
            name="uq_game_localizations_game_locale",
        ),
    )
    op.create_table(
        "game_editions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("game_id", sa.Integer(), nullable=False),
        sa.Column("platform_id", sa.Integer(), nullable=False),
        sa.Column("localization_id", sa.Integer(), nullable=False),
        sa.Column("igdb_id", sa.BigInteger(), nullable=True),
        sa.Column("edition_type", sa.String(length=30), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=True),
        sa.Column("region", sa.String(length=20), nullable=False),
        sa.Column("first_release_date", sa.Date(), nullable=True),
        sa.Column("synced_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["game_id"], ["games.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["localization_id"],
            ["game_localizations.id"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["platform_id"],
            ["platforms.id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "game_id",
            "platform_id",
            "edition_type",
            "region",
            "localization_id",
            name="uq_game_editions_identity",
        ),
        sa.UniqueConstraint("igdb_id", name="uq_game_editions_igdb_id"),
    )
    op.create_table(
        "game_covers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("game_id", sa.Integer(), nullable=False),
        sa.Column("edition_id", sa.Integer(), nullable=True),
        sa.Column("igdb_image_id", sa.String(length=64), nullable=False),
        sa.Column(
            "is_primary",
            sa.Boolean(),
            server_default=sa.text("true"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["edition_id"],
            ["game_editions.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(["game_id"], ["games.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "game_id",
            "edition_id",
            "igdb_image_id",
            name="uq_game_covers_source",
        ),
    )
    op.create_index(
        "uq_game_covers_general_primary",
        "game_covers",
        ["game_id"],
        unique=True,
        postgresql_where=sa.text("edition_id IS NULL AND is_primary"),
    )
    op.create_index(
        "uq_game_covers_edition_primary",
        "game_covers",
        ["edition_id"],
        unique=True,
        postgresql_where=sa.text("edition_id IS NOT NULL AND is_primary"),
    )
    op.create_table(
        "library_games",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("edition_id", sa.Integer(), nullable=False),
        sa.Column(
            "owned",
            sa.Boolean(),
            server_default=sa.text("false"),
            nullable=False,
        ),
        sa.Column(
            "play_status",
            sa.String(length=10),
            server_default="pending",
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "play_status IN ('pending', 'playing', 'played')",
            name="ck_library_games_play_status",
        ),
        sa.ForeignKeyConstraint(
            ["edition_id"],
            ["game_editions.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id",
            "edition_id",
            name="uq_library_games_user_edition",
        ),
    )
    op.create_index("ix_library_games_user_id", "library_games", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_library_games_user_id", table_name="library_games")
    op.drop_table("library_games")
    op.drop_index("uq_game_covers_edition_primary", table_name="game_covers")
    op.drop_index("uq_game_covers_general_primary", table_name="game_covers")
    op.drop_table("game_covers")
    op.drop_table("game_editions")
    op.drop_table("game_localizations")
    op.drop_table("platforms")
    op.drop_table("games")