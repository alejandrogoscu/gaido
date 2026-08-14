import httpx
from fastapi.testclient import TestClient

from app.features.games.igdb import GAMES_URL, TOKEN_URL, IgdbClient, get_igdb_client
from app.main import app

REGISTER_DATA = {
    "email": "player@example.com",
    "username": "Player",
    "password": "una contraseña segura",
}


def test_game_search_requires_authentication(client: TestClient) -> None:
    response = client.get("/api/v1/games/search", params={"q": "Hades"})

    assert response.status_code == 401
    assert response.json() == {"detail": "No autenticado"}


def test_game_search_returns_mapped_igdb_results(client: TestClient) -> None:
    token_requests = 0
    search_requests = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal token_requests, search_requests

        if str(request.url).startswith(TOKEN_URL):
            token_requests += 1
            assert request.url.params["client_id"] == "client-id"
            assert request.url.params["grant_type"] == "client_credentials"
            return httpx.Response(200, json={"access_token": "token", "expires_in": 3600})

        assert str(request.url) == GAMES_URL
        search_requests += 1
        assert request.headers["Client-ID"] == "client-id"
        assert request.headers["Authorization"] == "Bearer token"
        assert 'search "Hades";' in request.content.decode()
        assert "where version_parent = null;" in request.content.decode()
        assert "limit 10;" in request.content.decode()
        return httpx.Response(
            200,
            json=[
                {
                    "id": 113112,
                    "name": "Hades",
                    "summary": "Battle out of hell.",
                    "first_release_date": 1600300800,
                    "cover": {"image_id": "co39vc"},
                    "platforms": [
                        {"id": 6, "name": "PC (Microsoft Windows)", "abbreviation": "PC"}
                    ],
                }
            ],
        )

    igdb_client = IgdbClient(
        "client-id",
        "client-secret",
        transport=httpx.MockTransport(handler),
    )
    app.dependency_overrides[get_igdb_client] = lambda: igdb_client
    _authenticate(client)

    first_response = client.get("/api/v1/games/search", params={"q": "  Hades  "})
    second_response = client.get("/api/v1/games/search", params={"q": "Hades"})

    assert first_response.status_code == 200
    assert first_response.json() == [
        {
            "igdb_id": 113112,
            "title": "Hades",
            "summary": "Battle out of hell.",
            "first_release_date": "2020-09-17",
            "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/co39vc.jpg",
            "platforms": [
                {
                    "igdb_id": 6,
                    "name": "PC (Microsoft Windows)",
                    "abbreviation": "PC",
                }
            ],
        }
    ]
    assert second_response.status_code == 200
    assert token_requests == 1
    assert search_requests == 2


def test_game_search_rejects_blank_query(client: TestClient) -> None:
    app.dependency_overrides[get_igdb_client] = lambda: IgdbClient("client", "secret")
    _authenticate(client)

    response = client.get("/api/v1/games/search", params={"q": "  "})

    assert response.status_code == 422
    assert response.json() == {
        "detail": "La búsqueda debe contener al menos dos caracteres"
    }


def test_game_search_reports_missing_configuration(client: TestClient) -> None:
    app.dependency_overrides[get_igdb_client] = lambda: IgdbClient(None, None)
    _authenticate(client)

    response = client.get("/api/v1/games/search", params={"q": "Hades"})

    assert response.status_code == 503
    assert response.json() == {"detail": "La búsqueda de videojuegos no está configurada"}


def test_game_search_hides_provider_failure(client: TestClient) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(503, json={"message": "provider internals"})

    app.dependency_overrides[get_igdb_client] = lambda: IgdbClient(
        "client-id",
        "client-secret",
        transport=httpx.MockTransport(handler),
    )
    _authenticate(client)

    response = client.get("/api/v1/games/search", params={"q": "Hades"})

    assert response.status_code == 502
    assert response.json() == {
        "detail": "No se ha podido consultar el catálogo de videojuegos"
    }
    assert "provider internals" not in response.text


def test_game_search_rejects_invalid_provider_response(client: TestClient) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if str(request.url).startswith(TOKEN_URL):
            return httpx.Response(200, json={"access_token": "token", "expires_in": 3600})
        return httpx.Response(200, json=[{"id": "invalid", "name": None}])

    app.dependency_overrides[get_igdb_client] = lambda: IgdbClient(
        "client-id",
        "client-secret",
        transport=httpx.MockTransport(handler),
    )
    _authenticate(client)

    response = client.get("/api/v1/games/search", params={"q": "Hades"})

    assert response.status_code == 502


def _authenticate(client: TestClient) -> None:
    response = client.post("/api/v1/auth/register", json=REGISTER_DATA)
    assert response.status_code == 201