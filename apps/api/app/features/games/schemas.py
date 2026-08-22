from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


class PlatformSearchResult(BaseModel):
    igdb_id: int
    name: str
    abbreviation: str | None
    in_library: bool = False


class GameSearchResult(BaseModel):
    game_id: int | None = None
    library_game_id: int | None = None
    igdb_id: int
    title: str
    summary: str | None
    category: str | None
    first_release_date: date | None
    cover_url: str | None
    platforms: list[PlatformSearchResult]
    in_library: bool = False
    owned: bool = False


class LibraryGameCreate(BaseModel):
    igdb_game_id: int = Field(gt=0)
    igdb_platform_id: int = Field(gt=0)
    media_format: Literal["physical", "digital"]
    owned: bool = False
    play_status: Literal["pending", "playing", "played", "completed"] = "pending"


class LibraryGameResponse(BaseModel):
    id: int
    game_id: int
    igdb_game_id: int
    title: str
    cover_url: str | None
    platform: PlatformSearchResult
    media_format: Literal["physical", "digital"]
    owned: bool
    play_status: Literal["pending", "playing", "played", "completed"]


class GameLibraryContext(BaseModel):
    id: int
    platform: PlatformSearchResult
    media_format: Literal["physical", "digital"]
    owned: bool
    play_status: Literal["pending", "playing", "played", "completed"]


class GameDetailResponse(BaseModel):
    game_id: int | None
    igdb_id: int
    title: str
    summary: str | None
    cover_url: str | None
    platforms: list[PlatformSearchResult]
    library_entry: GameLibraryContext | None


class GameProgressStatistics(BaseModel):
    to_play: int
    played: int


class GameFormatStatistics(BaseModel):
    physical: int
    digital: int


class GameLibraryStatisticsResponse(BaseModel):
    total_games: int
    total_platforms: int
    progress: GameProgressStatistics
    formats: GameFormatStatistics
