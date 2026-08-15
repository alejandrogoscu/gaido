"""configure library games

Revision ID: 20260815_0004
Revises: 20260814_0003
Create Date: 2026-08-15
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260815_0004"
down_revision: str | None = "20260814_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "game_editions",
        sa.Column(
            "media_format",
            sa.String(length=10),
            server_default="unknown",
            nullable=False,
        ),
    )
    op.create_check_constraint(
        "ck_game_editions_media_format",
        "game_editions",
        "media_format IN ('unknown', 'physical', 'digital')",
    )
    op.drop_constraint(
        "uq_game_editions_identity",
        "game_editions",
        type_="unique",
    )
    op.create_unique_constraint(
        "uq_game_editions_identity",
        "game_editions",
        [
            "game_id",
            "platform_id",
            "edition_type",
            "media_format",
            "region",
            "localization_id",
        ],
    )
    op.drop_constraint(
        "ck_library_games_play_status",
        "library_games",
        type_="check",
    )
    op.create_check_constraint(
        "ck_library_games_play_status",
        "library_games",
        "play_status IN ('pending', 'playing', 'played', 'completed')",
    )


def downgrade() -> None:
    op.execute(
        "UPDATE library_games SET play_status = 'played' "
        "WHERE play_status = 'completed'"
    )
    op.drop_constraint(
        "ck_library_games_play_status",
        "library_games",
        type_="check",
    )
    op.create_check_constraint(
        "ck_library_games_play_status",
        "library_games",
        "play_status IN ('pending', 'playing', 'played')",
    )
    op.drop_constraint(
        "uq_game_editions_identity",
        "game_editions",
        type_="unique",
    )
    op.drop_constraint(
        "ck_game_editions_media_format",
        "game_editions",
        type_="check",
    )
    op.drop_column("game_editions", "media_format")
    op.create_unique_constraint(
        "uq_game_editions_identity",
        "game_editions",
        [
            "game_id",
            "platform_id",
            "edition_type",
            "region",
            "localization_id",
        ],
    )