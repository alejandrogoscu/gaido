from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    UniqueConstraint,
    false,
    func,
    text,
    true,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Game(Base):
    __tablename__ = "games"
    __table_args__ = (UniqueConstraint("igdb_id", name="uq_games_igdb_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    igdb_id: Mapped[int] = mapped_column(BigInteger)
    first_release_date: Mapped[date | None] = mapped_column(Date)
    igdb_updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    synced_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    localizations: Mapped[list[GameLocalization]] = relationship(
        back_populates="game",
        cascade="all, delete-orphan",
    )
    editions: Mapped[list[GameEdition]] = relationship(
        back_populates="game",
        cascade="all, delete-orphan",
    )
    covers: Mapped[list[GameCover]] = relationship(
        back_populates="game",
        cascade="all, delete-orphan",
    )


class GameLocalization(Base):
    __tablename__ = "game_localizations"
    __table_args__ = (
        UniqueConstraint("game_id", "locale", name="uq_game_localizations_game_locale"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    game_id: Mapped[int] = mapped_column(ForeignKey("games.id", ondelete="CASCADE"))
    locale: Mapped[str] = mapped_column(String(10))
    title: Mapped[str] = mapped_column(String(200))
    summary: Mapped[str | None] = mapped_column(Text)

    game: Mapped[Game] = relationship(back_populates="localizations")
    editions: Mapped[list[GameEdition]] = relationship(back_populates="localization")


class Platform(Base):
    __tablename__ = "platforms"
    __table_args__ = (UniqueConstraint("igdb_id", name="uq_platforms_igdb_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    igdb_id: Mapped[int] = mapped_column(BigInteger)
    name: Mapped[str] = mapped_column(String(100))
    abbreviation: Mapped[str | None] = mapped_column(String(30))
    synced_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    editions: Mapped[list[GameEdition]] = relationship(back_populates="platform")


class GameEdition(Base):
    __tablename__ = "game_editions"
    __table_args__ = (
        UniqueConstraint(
            "game_id",
            "platform_id",
            "edition_type",
            "media_format",
            "region",
            "localization_id",
            name="uq_game_editions_identity",
        ),
        CheckConstraint(
            "media_format IN ('unknown', 'physical', 'digital')",
            name="ck_game_editions_media_format",
        ),
        UniqueConstraint("igdb_id", name="uq_game_editions_igdb_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    game_id: Mapped[int] = mapped_column(ForeignKey("games.id", ondelete="CASCADE"))
    platform_id: Mapped[int] = mapped_column(
        ForeignKey("platforms.id", ondelete="RESTRICT")
    )
    localization_id: Mapped[int] = mapped_column(
        ForeignKey("game_localizations.id", ondelete="RESTRICT")
    )
    igdb_id: Mapped[int | None] = mapped_column(BigInteger)
    edition_type: Mapped[str] = mapped_column(String(30), default="standard")
    media_format: Mapped[str] = mapped_column(
        String(10),
        default="unknown",
        server_default="unknown",
    )
    name: Mapped[str | None] = mapped_column(String(200))
    region: Mapped[str] = mapped_column(String(20), default="unknown")
    first_release_date: Mapped[date | None] = mapped_column(Date)
    synced_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    game: Mapped[Game] = relationship(back_populates="editions")
    platform: Mapped[Platform] = relationship(back_populates="editions")
    localization: Mapped[GameLocalization] = relationship(back_populates="editions")
    covers: Mapped[list[GameCover]] = relationship(
        back_populates="edition",
        cascade="all, delete-orphan",
    )
    library_entries: Mapped[list[LibraryGame]] = relationship(
        back_populates="edition",
        cascade="all, delete-orphan",
    )


class GameCover(Base):
    __tablename__ = "game_covers"
    __table_args__ = (
        UniqueConstraint(
            "game_id",
            "edition_id",
            "igdb_image_id",
            name="uq_game_covers_source",
        ),
        Index(
            "uq_game_covers_general_primary",
            "game_id",
            unique=True,
            postgresql_where=text("edition_id IS NULL AND is_primary"),
        ),
        Index(
            "uq_game_covers_edition_primary",
            "edition_id",
            unique=True,
            postgresql_where=text("edition_id IS NOT NULL AND is_primary"),
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    game_id: Mapped[int] = mapped_column(ForeignKey("games.id", ondelete="CASCADE"))
    edition_id: Mapped[int | None] = mapped_column(
        ForeignKey("game_editions.id", ondelete="CASCADE")
    )
    igdb_image_id: Mapped[str] = mapped_column(String(64))
    is_primary: Mapped[bool] = mapped_column(Boolean, default=True, server_default=true())

    game: Mapped[Game] = relationship(back_populates="covers")
    edition: Mapped[GameEdition | None] = relationship(back_populates="covers")


class LibraryGame(Base):
    __tablename__ = "library_games"
    __table_args__ = (
        UniqueConstraint("user_id", "edition_id", name="uq_library_games_user_edition"),
        CheckConstraint(
            "play_status IN ('pending', 'playing', 'played', 'completed')",
            name="ck_library_games_play_status",
        ),
        Index("ix_library_games_user_id", "user_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    edition_id: Mapped[int] = mapped_column(
        ForeignKey("game_editions.id", ondelete="CASCADE")
    )
    owned: Mapped[bool] = mapped_column(Boolean, default=False, server_default=false())
    play_status: Mapped[str] = mapped_column(
        String(10),
        default="pending",
        server_default="pending",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    edition: Mapped[GameEdition] = relationship(back_populates="library_entries")