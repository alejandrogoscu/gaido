from typing import Annotated, Never

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.features.auth.dependencies import CurrentUserDependency, SessionDependency
from app.features.games.igdb import (
    IgdbClient,
    IgdbConfigurationError,
    IgdbError,
    IgdbUnavailableError,
    get_igdb_client,
)
from app.features.games.schemas import (
    GameSearchResult,
    LibraryGameCreate,
    LibraryGameResponse,
)
from app.features.games.service import (
    GameNotFoundError,
    LibraryGameConflictError,
    PlatformNotFoundError,
    add_game_to_library,
    list_library_games,
    search_catalog_games,
)

router = APIRouter(prefix="/games", tags=["games"])
library_router = APIRouter(prefix="/library/games", tags=["library games"])
type IgdbClientDependency = Annotated[IgdbClient, Depends(get_igdb_client)]
type SearchQuery = Annotated[str, Query(alias="q", min_length=2, max_length=100)]


@router.get("/search", response_model=list[GameSearchResult])
def search_games(
    query: SearchQuery,
    session: SessionDependency,
    current_user: CurrentUserDependency,
    igdb_client: IgdbClientDependency,
) -> list[GameSearchResult]:
    normalized_query = query.strip()
    if len(normalized_query) < 2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="La búsqueda debe contener al menos dos caracteres",
        )

    try:
        return search_catalog_games(
            session,
            current_user.id,
            normalized_query,
            igdb_client,
        )
    except IgdbError as error:
        _raise_igdb_http_error(error)


@library_router.get("", response_model=list[LibraryGameResponse])
def get_library_games(
    session: SessionDependency,
    current_user: CurrentUserDependency,
) -> list[LibraryGameResponse]:
    return list_library_games(session, current_user.id)


@library_router.post(
    "",
    response_model=LibraryGameResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_library_game(
    data: LibraryGameCreate,
    session: SessionDependency,
    current_user: CurrentUserDependency,
    igdb_client: IgdbClientDependency,
) -> LibraryGameResponse:
    try:
        return add_game_to_library(session, current_user.id, data, igdb_client)
    except GameNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El videojuego no existe en IGDB",
        ) from error
    except PlatformNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="La plataforma no pertenece al videojuego",
        ) from error
    except LibraryGameConflictError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Esta edición ya está en tu biblioteca",
        ) from error
    except IgdbError as error:
        _raise_igdb_http_error(error)


def _raise_igdb_http_error(error: IgdbError) -> Never:
    if isinstance(error, IgdbConfigurationError):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="La búsqueda de videojuegos no está configurada",
        ) from error
    if isinstance(error, IgdbUnavailableError):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="No se ha podido consultar el catálogo de videojuegos",
        ) from error
    raise error