"""configure library games

Revision ID: 20260815_0004
Revises: 20260814_0003
Create Date: 2026-08-15
"""

from collections.abc import Sequence

from alembic import op

revision: str = "20260815_0004"
down_revision: str | None = "20260814_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
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
