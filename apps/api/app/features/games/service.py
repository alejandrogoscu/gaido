from datetime import UTC, date, datetime

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.features.games.igdb import IgdbClient, build_cover_url
from app.features.games.models import (
    Game,
    GameCover,
    GameEdition,
    GameLocalization,
    LibraryGame,
    Platform,
)
from app.features.games.schemas import (
    GameSearchResult,
    LibraryGameCreate,
    LibraryGameResponse,
    PlatformSearchResult,
)

SOURCE_LOCALE = "en"
DEFAULT_EDITION_TYPE = "standard"
UNKNOWN_REGION = "unknown"


class GameNotFoundError(Exception):
    pass


class PlatformNotFoundError(Exception):
    pass


class LibraryGameConflictError(Exception):
    pass


def search_catalog_games(
    session: Session,
    user_id: int,
    query: str,
    igdb_client: IgdbClient,
) -> list[GameSearchResult]:
    results = igdb_client.search_games(query)
    if not results:
        return []

    igdb_game_ids = [result.igdb_id for result in results]
    local_game_ids = dict(
        session.execute(
            select(Game.igdb_id, Game.id).where(Game.igdb_id.in_(igdb_game_ids))
        ).all()
    )
    library_platforms = set(
        session.execute(
            select(Game.igdb_id, Platform.igdb_id)
            .select_from(LibraryGame)
            .join(GameEdition, LibraryGame.edition_id == GameEdition.id)
            .join(Game, GameEdition.game_id == Game.id)
            .join(Platform, GameEdition.platform_id == Platform.id)
            .where(
                LibraryGame.user_id == user_id,
                Game.igdb_id.in_(igdb_game_ids),
            )
        ).all()
    )
    library_game_ids = {igdb_game_id for igdb_game_id, _ in library_platforms}

    return [
        result.model_copy(
            update={
                "game_id": local_game_ids.get(result.igdb_id),
                "in_library": result.igdb_id in library_game_ids,
                "platforms": [
                    platform.model_copy(
                        update={
                            "in_library": (
                                result.igdb_id,
                                platform.igdb_id,
                            )
                            in library_platforms
                        }
                    )
                    for platform in result.platforms
                ],
            }
        )
        for result in results
    ]


def add_game_to_library(
    session: Session,
    user_id: int,
    data: LibraryGameCreate,
    igdb_client: IgdbClient,
) -> LibraryGameResponse:
    source_game = igdb_client.get_game(data.igdb_game_id)
    if source_game is None:
        raise GameNotFoundError

    source_platform = next(
        (
            platform
            for platform in source_game.platforms
            if platform.id == data.igdb_platform_id
        ),
        None,
    )
    if source_platform is None:
        raise PlatformNotFoundError

    synced_at = datetime.now(UTC)
    game = session.scalar(select(Game).where(Game.igdb_id == source_game.id))
    if game is None:
        game = Game(igdb_id=source_game.id, synced_at=synced_at)
        session.add(game)

    game.first_release_date = _source_date(source_game.first_release_date)
    game.igdb_updated_at = _source_datetime(source_game.updated_at)
    game.synced_at = synced_at
    session.flush()

    localization = session.scalar(
        select(GameLocalization).where(
            GameLocalization.game_id == game.id,
            GameLocalization.locale == SOURCE_LOCALE,
        )
    )
    if localization is None:
        localization = GameLocalization(game=game, locale=SOURCE_LOCALE)
        session.add(localization)
    localization.title = source_game.name.strip()
    localization.summary = source_game.summary

    platform = session.scalar(select(Platform).where(Platform.igdb_id == source_platform.id))
    if platform is None:
        platform = Platform(igdb_id=source_platform.id, synced_at=synced_at)
        session.add(platform)
    platform.name = source_platform.name
    platform.abbreviation = source_platform.abbreviation
    platform.synced_at = synced_at
    session.flush()

    if source_game.cover is not None:
        cover = session.scalar(
            select(GameCover).where(
                GameCover.game_id == game.id,
                GameCover.edition_id.is_(None),
                GameCover.is_primary.is_(True),
            )
        )
        if cover is None:
            cover = GameCover(game=game, is_primary=True)
            session.add(cover)
        cover.igdb_image_id = source_game.cover.image_id

    edition = session.scalar(
        select(GameEdition).where(
            GameEdition.game_id == game.id,
            GameEdition.platform_id == platform.id,
            GameEdition.edition_type == DEFAULT_EDITION_TYPE,
            GameEdition.region == UNKNOWN_REGION,
            GameEdition.localization_id == localization.id,
        )
    )
    if edition is None:
        edition = GameEdition(
            game=game,
            platform=platform,
            localization=localization,
            edition_type=DEFAULT_EDITION_TYPE,
            region=UNKNOWN_REGION,
            synced_at=synced_at,
        )
        session.add(edition)
    edition.first_release_date = game.first_release_date
    edition.synced_at = synced_at
    session.flush()

    if session.scalar(
        select(LibraryGame.id).where(
            LibraryGame.user_id == user_id,
            LibraryGame.edition_id == edition.id,
        )
    ):
        session.rollback()
        raise LibraryGameConflictError

    entry = LibraryGame(
        user_id=user_id,
        edition=edition,
        media_format=data.media_format,
        owned=data.owned,
        play_status=data.play_status,
    )
    session.add(entry)

    try:
        session.commit()
    except IntegrityError as error:
        session.rollback()
        raise LibraryGameConflictError from error

    return _to_response(entry)


def list_library_games(session: Session, user_id: int) -> list[LibraryGameResponse]:
    entries = session.scalars(
        select(LibraryGame)
        .where(LibraryGame.user_id == user_id)
        .options(
            joinedload(LibraryGame.edition).joinedload(GameEdition.localization),
            joinedload(LibraryGame.edition).joinedload(GameEdition.platform),
            joinedload(LibraryGame.edition).selectinload(GameEdition.covers),
            joinedload(LibraryGame.edition)
            .joinedload(GameEdition.game)
            .selectinload(Game.covers),
        )
        .order_by(LibraryGame.created_at.desc(), LibraryGame.id.desc())
    ).all()
    return [_to_response(entry) for entry in entries]


def _to_response(entry: LibraryGame) -> LibraryGameResponse:
    edition = entry.edition
    primary_cover = next(
        (
            cover
            for cover in edition.covers
            if cover.is_primary
        ),
        None,
    ) or next(
        (
            cover
            for cover in edition.game.covers
            if cover.edition_id is None and cover.is_primary
        ),
        None,
    )

    return LibraryGameResponse(
        id=entry.id,
        game_id=edition.game.id,
        igdb_game_id=edition.game.igdb_id,
        title=edition.localization.title,
        cover_url=(
            build_cover_url(primary_cover.igdb_image_id) if primary_cover else None
        ),
        platform=PlatformSearchResult(
            igdb_id=edition.platform.igdb_id,
            name=edition.platform.name,
            abbreviation=edition.platform.abbreviation,
            in_library=True,
        ),
        media_format=entry.media_format,
        owned=entry.owned,
        play_status=entry.play_status,
    )


def _source_date(timestamp: int | None) -> date | None:
    source_datetime = _source_datetime(timestamp)
    return source_datetime.date() if source_datetime is not None else None


def _source_datetime(timestamp: int | None) -> datetime | None:
    return datetime.fromtimestamp(timestamp, tz=UTC) if timestamp is not None else None