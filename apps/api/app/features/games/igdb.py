import json
import threading
import time
from datetime import UTC, datetime
from functools import lru_cache

import httpx
from pydantic import BaseModel, Field, TypeAdapter, ValidationError

from app.core.config import settings
from app.features.games.schemas import GameSearchResult, PlatformSearchResult

TOKEN_URL = "https://id.twitch.tv/oauth2/token"
GAMES_URL = "https://api.igdb.com/v4/games"
COVER_URL_TEMPLATE = "https://images.igdb.com/igdb/image/upload/t_cover_big/{image_id}.jpg"
REQUEST_TIMEOUT_SECONDS = 8.0
TOKEN_EXPIRATION_MARGIN_SECONDS = 60

# Se piden más candidatos de los que se muestran (ver SEARCH_RESULT_LIMIT en
# service.py) porque la relevancia de IGDB puede dejar el juego principal o
# su remake fuera de los primeros puestos cuando hay muchas ediciones o DLC
# con un título casi idéntico; un pool más amplio permite que nuestra propia
# ordenación por categoría los siga encontrando.
SEARCH_CANDIDATE_LIMIT = 40

IGDB_CATEGORY_LABELS: dict[int, str] = {
    0: "main_game",
    1: "dlc_addon",
    2: "expansion",
    3: "bundle",
    4: "standalone_expansion",
    5: "mod",
    6: "episode",
    7: "season",
    8: "remake",
    9: "remaster",
    10: "expanded_game",
    11: "port",
    12: "fork",
    13: "pack",
    14: "update",
}


def category_label(category: int | None) -> str | None:
    return IGDB_CATEGORY_LABELS.get(category) if category is not None else None


class IgdbError(Exception):
    pass


class IgdbConfigurationError(IgdbError):
    pass


class IgdbUnavailableError(IgdbError):
    pass


class _TokenResponse(BaseModel):
    access_token: str
    expires_in: int


class IgdbCoverData(BaseModel):
    image_id: str


class IgdbPlatformData(BaseModel):
    id: int
    name: str
    abbreviation: str | None = None


class IgdbGameData(BaseModel):
    id: int
    name: str
    summary: str | None = None
    game_type: int | None = None
    first_release_date: int | None = None
    updated_at: int | None = None
    cover: IgdbCoverData | None = None
    platforms: list[IgdbPlatformData] = Field(default_factory=list)


game_list_adapter = TypeAdapter(list[IgdbGameData])


class IgdbClient:
    def __init__(
        self,
        client_id: str | None,
        client_secret: str | None,
        transport: httpx.BaseTransport | None = None,
    ) -> None:
        self._client_id = client_id
        self._client_secret = client_secret
        self._transport = transport
        self._access_token: str | None = None
        self._token_expires_at = 0.0
        self._token_lock = threading.Lock()

    def search_games(self, query: str) -> list[GameSearchResult]:
        games = self._request_games(_build_search_query(query))
        return [_to_search_result(game) for game in games]

    def get_game(self, igdb_id: int) -> IgdbGameData | None:
        games = self._request_games(_build_game_query(igdb_id))
        return games[0] if games else None

    def _request_games(self, query: str) -> list[IgdbGameData]:
        self._ensure_configured()

        try:
            with httpx.Client(
                timeout=REQUEST_TIMEOUT_SECONDS,
                transport=self._transport,
            ) as http_client:
                access_token = self._get_access_token(http_client)
                response = http_client.post(
                    GAMES_URL,
                    headers={
                        "Accept": "application/json",
                        "Authorization": f"Bearer {access_token}",
                        "Client-ID": self._client_id or "",
                        "Content-Type": "text/plain",
                    },
                    content=query,
                )
                response.raise_for_status()
        except httpx.HTTPError as error:
            raise IgdbUnavailableError from error

        try:
            return game_list_adapter.validate_python(response.json())
        except (OSError, OverflowError, ValueError, ValidationError) as error:
            raise IgdbUnavailableError from error

    def _ensure_configured(self) -> None:
        if not self._client_id or not self._client_secret:
            raise IgdbConfigurationError

    def _get_access_token(self, http_client: httpx.Client) -> str:
        with self._token_lock:
            if self._access_token is not None and time.monotonic() < self._token_expires_at:
                return self._access_token

            try:
                response = http_client.post(
                    TOKEN_URL,
                    params={
                        "client_id": self._client_id,
                        "client_secret": self._client_secret,
                        "grant_type": "client_credentials",
                    },
                )
                response.raise_for_status()
                token = _TokenResponse.model_validate(response.json())
            except (httpx.HTTPError, ValueError, ValidationError) as error:
                raise IgdbUnavailableError from error

            usable_duration = max(
                token.expires_in - TOKEN_EXPIRATION_MARGIN_SECONDS,
                0,
            )
            self._access_token = token.access_token
            self._token_expires_at = time.monotonic() + usable_duration
            return token.access_token


def _build_search_query(query: str) -> str:
    escaped_query = json.dumps(query, ensure_ascii=False)
    return "\n".join(
        (
            "fields id,name,summary,game_type,first_release_date,updated_at,cover.image_id,"
            "platforms.id,platforms.name,platforms.abbreviation;",
            f"search {escaped_query};",
            "where version_parent = null;",
            f"limit {SEARCH_CANDIDATE_LIMIT};",
        )
    )


def _build_game_query(igdb_id: int) -> str:
    return "\n".join(
        (
            "fields id,name,summary,game_type,first_release_date,updated_at,cover.image_id,"
            "platforms.id,platforms.name,platforms.abbreviation;",
            f"where id = {igdb_id};",
            "limit 1;",
        )
    )


def build_cover_url(image_id: str) -> str:
    return COVER_URL_TEMPLATE.format(image_id=image_id)


def _to_search_result(game: IgdbGameData) -> GameSearchResult:
    release_date = (
        datetime.fromtimestamp(game.first_release_date, tz=UTC).date()
        if game.first_release_date is not None
        else None
    )
    cover_url = (
        build_cover_url(game.cover.image_id) if game.cover else None
    )

    return GameSearchResult(
        igdb_id=game.id,
        title=game.name,
        summary=game.summary,
        category=category_label(game.game_type),
        first_release_date=release_date,
        cover_url=cover_url,
        platforms=[
            PlatformSearchResult(
                igdb_id=platform.id,
                name=platform.name,
                abbreviation=platform.abbreviation,
            )
            for platform in game.platforms
        ],
    )


@lru_cache
def get_igdb_client() -> IgdbClient:
    secret = (
        settings.igdb_client_secret.get_secret_value()
        if settings.igdb_client_secret is not None
        else None
    )
    return IgdbClient(settings.igdb_client_id, secret)