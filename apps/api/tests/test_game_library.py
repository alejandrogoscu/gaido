import httpx
from fastapi.testclient import TestClient

from app.features.games.igdb import GAMES_URL, TOKEN_URL, IgdbClient, get_igdb_client
from app.main import app

REGISTER_DATA = {
    "email": "library@example.com",
    "username": "LibraryPlayer",
    "password": "una contraseña segura",
}
GAME_DATA = {
    "id": 338106,
    "name": "Donkey Kong Bananza",
    "summary": "Explore a vast underground world.",
    "first_release_date": 1752710400,
    "updated_at": 1752796800,
    "cover": {"image_id": "cobd1q"},
    "platforms": [
        {"id": 508, "name": "Nintendo Switch 2", "abbreviation": "Switch 2"},
        {"id": 130, "name": "Nintendo Switch", "abbreviation": "Switch"},
    ],
}
LIBRARY_DATA = {
    "igdb_game_id": 338106,
    "igdb_platform_id": 508,
    "media_format": "physical",
    "owned": True,
    "play_status": "completed",
}


def test_library_requires_authentication(client: TestClient) -> None:
    list_response = client.get("/api/v1/library/games")
    create_response = client.post(
        "/api/v1/library/games",
        json=LIBRARY_DATA,
    )

    assert list_response.status_code == 401
    assert create_response.status_code == 401


def test_adds_selected_game_edition_and_lists_it(client: TestClient) -> None:
    app.dependency_overrides[get_igdb_client] = lambda: _igdb_client(GAME_DATA)
    _authenticate(client)

    create_response = client.post(
        "/api/v1/library/games",
        json=LIBRARY_DATA,
    )

    assert create_response.status_code == 201
    assert create_response.json() == {
        "id": 1,
        "game_id": 1,
        "igdb_game_id": 338106,
        "title": "Donkey Kong Bananza",
        "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/cobd1q.jpg",
        "platform": {
            "igdb_id": 508,
            "name": "Nintendo Switch 2",
            "abbreviation": "Switch 2",
            "in_library": True,
        },
        "media_format": "physical",
        "owned": True,
        "play_status": "completed",
    }

    list_response = client.get("/api/v1/library/games")

    assert list_response.status_code == 200
    assert list_response.json() == [create_response.json()]


def test_rejects_duplicate_edition(client: TestClient) -> None:
    app.dependency_overrides[get_igdb_client] = lambda: _igdb_client(GAME_DATA)
    _authenticate(client)
    payload = LIBRARY_DATA

    first_response = client.post("/api/v1/library/games", json=payload)
    duplicate_response = client.post("/api/v1/library/games", json=payload)

    assert first_response.status_code == 201
    assert duplicate_response.status_code == 409
    assert duplicate_response.json() == {
        "detail": "Esta edición ya está en tu biblioteca"
    }
    assert len(client.get("/api/v1/library/games").json()) == 1


def test_rejects_platform_not_available_for_game(client: TestClient) -> None:
    app.dependency_overrides[get_igdb_client] = lambda: _igdb_client(GAME_DATA)
    _authenticate(client)

    response = client.post(
        "/api/v1/library/games",
        json={**LIBRARY_DATA, "igdb_platform_id": 999},
    )

    assert response.status_code == 422
    assert response.json() == {"detail": "La plataforma no pertenece al videojuego"}
    assert client.get("/api/v1/library/games").json() == []


def test_reports_game_missing_from_igdb(client: TestClient) -> None:
    app.dependency_overrides[get_igdb_client] = lambda: _igdb_client(None)
    _authenticate(client)

    response = client.post(
        "/api/v1/library/games",
        json=LIBRARY_DATA,
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "El videojuego no existe en IGDB"}


def test_rejects_same_edition_with_a_different_format(client: TestClient) -> None:
    app.dependency_overrides[get_igdb_client] = lambda: _igdb_client(GAME_DATA)
    _authenticate(client)

    physical_response = client.post(
        "/api/v1/library/games",
        json=LIBRARY_DATA,
    )
    digital_response = client.post(
        "/api/v1/library/games",
        json={**LIBRARY_DATA, "media_format": "digital"},
    )

    assert physical_response.status_code == 201
    assert digital_response.status_code == 409
    assert len(client.get("/api/v1/library/games").json()) == 1


def test_allows_different_formats_on_different_platforms(client: TestClient) -> None:
    app.dependency_overrides[get_igdb_client] = lambda: _igdb_client(GAME_DATA)
    _authenticate(client)

    switch_2_response = client.post(
        "/api/v1/library/games",
        json=LIBRARY_DATA,
    )
    switch_response = client.post(
        "/api/v1/library/games",
        json={
            **LIBRARY_DATA,
            "igdb_platform_id": 130,
            "media_format": "digital",
        },
    )

    assert switch_2_response.status_code == 201
    assert switch_response.status_code == 201
    assert switch_response.json()["platform"]["igdb_id"] == 130
    assert switch_response.json()["media_format"] == "digital"
    assert len(client.get("/api/v1/library/games").json()) == 2


def test_search_marks_the_platform_already_in_the_library(client: TestClient) -> None:
    app.dependency_overrides[get_igdb_client] = lambda: _igdb_client(GAME_DATA)
    _authenticate(client)
    create_response = client.post(
        "/api/v1/library/games",
        json=LIBRARY_DATA,
    )

    search_response = client.get(
        "/api/v1/games/search",
        params={"q": "Donkey Kong Bananza"},
    )

    assert create_response.status_code == 201
    assert search_response.status_code == 200
    result = search_response.json()[0]
    assert result["game_id"] == create_response.json()["game_id"]
    assert result["in_library"] is True
    platforms = {
        platform["igdb_id"]: platform["in_library"]
        for platform in result["platforms"]
    }
    assert platforms == {508: True, 130: False}


def test_rejects_invalid_library_configuration(client: TestClient) -> None:
    app.dependency_overrides[get_igdb_client] = lambda: _igdb_client(GAME_DATA)
    _authenticate(client)

    invalid_format = client.post(
        "/api/v1/library/games",
        json={**LIBRARY_DATA, "media_format": "cartridge"},
    )
    invalid_status = client.post(
        "/api/v1/library/games",
        json={**LIBRARY_DATA, "play_status": "abandoned"},
    )

    assert invalid_format.status_code == 422
    assert invalid_status.status_code == 422


def _igdb_client(game: dict[str, object] | None) -> IgdbClient:
    def handler(request: httpx.Request) -> httpx.Response:
        if str(request.url).startswith(TOKEN_URL):
            return httpx.Response(200, json={"access_token": "token", "expires_in": 3600})

        assert str(request.url) == GAMES_URL
        request_body = request.content.decode()
        assert (
            "where id = 338106;" in request_body
            or 'search "Donkey Kong Bananza";' in request_body
        )
        return httpx.Response(200, json=[] if game is None else [game])

    return IgdbClient(
        "client-id",
        "client-secret",
        transport=httpx.MockTransport(handler),
    )


def _authenticate(client: TestClient) -> None:
    response = client.post("/api/v1/auth/register", json=REGISTER_DATA)
    assert response.status_code == 201
