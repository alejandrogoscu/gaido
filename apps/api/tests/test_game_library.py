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


def test_library_requires_authentication(client: TestClient) -> None:
    list_response = client.get("/api/v1/library/games")
    create_response = client.post(
        "/api/v1/library/games",
        json={"igdb_game_id": 338106, "igdb_platform_id": 508},
    )

    assert list_response.status_code == 401
    assert create_response.status_code == 401


def test_adds_selected_game_edition_and_lists_it(client: TestClient) -> None:
    app.dependency_overrides[get_igdb_client] = lambda: _igdb_client(GAME_DATA)
    _authenticate(client)

    create_response = client.post(
        "/api/v1/library/games",
        json={"igdb_game_id": 338106, "igdb_platform_id": 508},
    )

    assert create_response.status_code == 201
    assert create_response.json() == {
        "id": 1,
        "igdb_game_id": 338106,
        "title": "Donkey Kong Bananza",
        "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/cobd1q.jpg",
        "platform": {
            "igdb_id": 508,
            "name": "Nintendo Switch 2",
            "abbreviation": "Switch 2",
        },
        "owned": False,
        "play_status": "pending",
    }

    list_response = client.get("/api/v1/library/games")

    assert list_response.status_code == 200
    assert list_response.json() == [create_response.json()]


def test_rejects_duplicate_edition(client: TestClient) -> None:
    app.dependency_overrides[get_igdb_client] = lambda: _igdb_client(GAME_DATA)
    _authenticate(client)
    payload = {"igdb_game_id": 338106, "igdb_platform_id": 508}

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
        json={"igdb_game_id": 338106, "igdb_platform_id": 999},
    )

    assert response.status_code == 422
    assert response.json() == {"detail": "La plataforma no pertenece al videojuego"}
    assert client.get("/api/v1/library/games").json() == []


def test_reports_game_missing_from_igdb(client: TestClient) -> None:
    app.dependency_overrides[get_igdb_client] = lambda: _igdb_client(None)
    _authenticate(client)

    response = client.post(
        "/api/v1/library/games",
        json={"igdb_game_id": 338106, "igdb_platform_id": 508},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "El videojuego no existe en IGDB"}


def _igdb_client(game: dict[str, object] | None) -> IgdbClient:
    def handler(request: httpx.Request) -> httpx.Response:
        if str(request.url).startswith(TOKEN_URL):
            return httpx.Response(200, json={"access_token": "token", "expires_in": 3600})

        assert str(request.url) == GAMES_URL
        assert "where id = 338106;" in request.content.decode()
        return httpx.Response(200, json=[] if game is None else [game])

    return IgdbClient(
        "client-id",
        "client-secret",
        transport=httpx.MockTransport(handler),
    )


def _authenticate(client: TestClient) -> None:
    response = client.post("/api/v1/auth/register", json=REGISTER_DATA)
    assert response.status_code == 201