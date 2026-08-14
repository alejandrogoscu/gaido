from datetime import date

from pydantic import BaseModel


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