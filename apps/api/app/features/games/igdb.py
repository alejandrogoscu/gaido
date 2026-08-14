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
SEARCH_RESULT_LIMIT = 10


class IgdbError(Exception):
    pass


class IgdbConfigurationError(IgdbError):
    pass


class IgdbUnavailableError(IgdbError):
    pass


class _TokenResponse(BaseModel):
    access_token: str
    expires_in: int


class _CoverData(BaseModel):
    image_id: str


class _PlatformData(BaseModel):
    id: int
    name: str
    abbreviation: str | None = None


class _GameData(BaseModel):
    id: int
    name: str
    summary: str | None = None
    first_release_date: int | None = None
    cover: _CoverData | None = None
    platforms: list[_PlatformData] = Field(default_factory=list)


game_list_adapter = TypeAdapter(list[_GameData])


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
                    content=_build_search_query(query),
                )
                response.raise_for_status()
        except httpx.HTTPError as error:
            raise IgdbUnavailableError from error

        try:
            games = game_list_adapter.validate_python(response.json())
            return [_to_search_result(game) for game in games]
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
            "fields id,name,summary,first_release_date,cover.image_id,"
            "platforms.id,platforms.name,platforms.abbreviation;",
            f"search {escaped_query};",
            "where version_parent = null;",
            f"limit {SEARCH_RESULT_LIMIT};",
        )
    )


def _to_search_result(game: _GameData) -> GameSearchResult:
    release_date = (
        datetime.fromtimestamp(game.first_release_date, tz=UTC).date()
        if game.first_release_date is not None
        else None
    )
    cover_url = (
        COVER_URL_TEMPLATE.format(image_id=game.cover.image_id) if game.cover else None
    )

    return GameSearchResult(
        igdb_id=game.id,
        title=game.name,
        summary=game.summary,
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