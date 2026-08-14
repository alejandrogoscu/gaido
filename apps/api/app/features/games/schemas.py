from datetime import date

from pydantic import BaseModel, Field


class PlatformSearchResult(BaseModel):
    igdb_id: int
    name: str
    abbreviation: str | None


class GameSearchResult(BaseModel):
    igdb_id: int
    title: str
    summary: str | None
    first_release_date: date | None
    cover_url: str | None
    platforms: list[PlatformSearchResult]


class LibraryGameCreate(BaseModel):
    igdb_game_id: int = Field(gt=0)
    igdb_platform_id: int = Field(gt=0)


class LibraryGameResponse(BaseModel):
    id: int
    igdb_game_id: int
    title: str
    cover_url: str | None
    platform: PlatformSearchResult
    owned: bool
    play_status: str