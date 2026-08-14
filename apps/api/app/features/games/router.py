from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.features.auth.dependencies import CurrentUserDependency
from app.features.games.igdb import (
    IgdbClient,
    IgdbConfigurationError,
    IgdbUnavailableError,
    get_igdb_client,
)
from app.features.games.schemas import GameSearchResult

router = APIRouter(prefix="/games", tags=["games"])
type IgdbClientDependency = Annotated[IgdbClient, Depends(get_igdb_client)]
type SearchQuery = Annotated[str, Query(alias="q", min_length=2, max_length=100)]


@router.get("/search", response_model=list[GameSearchResult])
def search_games(
    query: SearchQuery,
    _current_user: CurrentUserDependency,
    igdb_client: IgdbClientDependency,
) -> list[GameSearchResult]:
    normalized_query = query.strip()
    if len(normalized_query) < 2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="La búsqueda debe contener al menos dos caracteres",
        )

    try:
        return igdb_client.search_games(normalized_query)
    except IgdbConfigurationError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="La búsqueda de videojuegos no está configurada",
        ) from error
    except IgdbUnavailableError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="No se ha podido consultar el catálogo de videojuegos",
        ) from error