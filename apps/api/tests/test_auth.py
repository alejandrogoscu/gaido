from datetime import UTC, datetime, timedelta

import pytest
from argon2 import PasswordHasher
from fastapi.testclient import TestClient
from sqlalchemy import Engine, func, select, update
from sqlalchemy.orm import Session

from app.features.auth.models import User, UserSession

REGISTER_DATA = {
    "email": "alejandro@example.com",
    "username": "Alejandro",
    "password": "una contraseña segura",
}


def test_register_normalizes_identity_hashes_password_and_starts_session(
    client: TestClient,
    test_database_engine: Engine,
) -> None:
    response = client.post("/api/v1/auth/register", json=REGISTER_DATA)

    assert response.status_code == 201
    assert response.json() == {
        "id": 1,
        "email": "alejandro@example.com",
        "username": "alejandro",
        "display_name": "Alejandro",
        "created_at": response.json()["created_at"],
    }
    assert "password" not in response.json()
    assert "gaido_session=" in response.headers["set-cookie"]
    assert "HttpOnly" in response.headers["set-cookie"]
    assert "SameSite=lax" in response.headers["set-cookie"]
    assert response.headers["cache-control"] == "no-store"

    with Session(test_database_engine) as session:
        user = session.scalar(select(User))
        user_session = session.scalar(select(UserSession))
        assert user is not None
        assert user_session is not None
        assert user.password_hash != REGISTER_DATA["password"]
        assert PasswordHasher().verify(user.password_hash, REGISTER_DATA["password"])
        assert user_session.token_hash != client.cookies.get("gaido_session")
        assert len(user_session.token_hash) == 64
        assert timedelta(days=6, hours=23) < user_session.expires_at - user_session.created_at
        assert user_session.expires_at - user_session.created_at <= timedelta(days=7, minutes=1)
        assert session.scalar(select(func.count()).select_from(UserSession)) == 1


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("email", "ALEJANDRO@example.com"),
        ("username", "aLeJaNdRo"),
    ],
)
def test_register_rejects_duplicate_normalized_identity(
    client: TestClient,
    field: str,
    value: str,
) -> None:
    first_response = client.post("/api/v1/auth/register", json=REGISTER_DATA)
    duplicate_data = {
        **REGISTER_DATA,
        "email": "other@example.com",
        "username": "OtherUser",
        field: value,
    }

    duplicate_response = client.post("/api/v1/auth/register", json=duplicate_data)

    assert first_response.status_code == 201
    assert duplicate_response.status_code == 409
    assert duplicate_response.json() == {
        "detail": "No se ha podido crear la cuenta con esos datos"
    }


def test_register_rejects_short_password(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={**REGISTER_DATA, "password": "demasiado"},
    )

    assert response.status_code == 422


def test_login_uses_email_and_creates_a_new_session(client: TestClient) -> None:
    register_response = client.post("/api/v1/auth/register", json=REGISTER_DATA)
    logout_response = client.post("/api/v1/auth/logout")

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "ALEJANDRO@example.com", "password": REGISTER_DATA["password"]},
    )
    current_user_response = client.get("/api/v1/auth/me")

    assert register_response.status_code == 201
    assert logout_response.status_code == 204
    assert login_response.status_code == 200
    assert login_response.json()["username"] == "alejandro"
    assert current_user_response.status_code == 200
    assert current_user_response.json() == login_response.json()


def test_login_replaces_current_browser_session(
    client: TestClient,
    test_database_engine: Engine,
) -> None:
    register_response = client.post("/api/v1/auth/register", json=REGISTER_DATA)

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": REGISTER_DATA["email"], "password": REGISTER_DATA["password"]},
    )

    assert register_response.status_code == 201
    assert login_response.status_code == 200
    with Session(test_database_engine) as session:
        assert session.scalar(select(func.count()).select_from(UserSession)) == 1


@pytest.mark.parametrize(
    ("email", "password"),
    [
        ("alejandro@example.com", "contraseña incorrecta"),
        ("nobody@example.com", "contraseña incorrecta"),
    ],
)
def test_login_returns_same_error_for_invalid_credentials(
    client: TestClient,
    email: str,
    password: str,
) -> None:
    register_response = client.post("/api/v1/auth/register", json=REGISTER_DATA)

    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )

    assert register_response.status_code == 201
    assert response.status_code == 401
    assert response.json() == {"detail": "Correo o contraseña incorrectos"}


def test_logout_deletes_current_session(
    client: TestClient,
    test_database_engine: Engine,
) -> None:
    register_response = client.post("/api/v1/auth/register", json=REGISTER_DATA)

    logout_response = client.post("/api/v1/auth/logout")
    current_user_response = client.get("/api/v1/auth/me")

    assert register_response.status_code == 201
    assert logout_response.status_code == 204
    assert current_user_response.status_code == 401
    with Session(test_database_engine) as session:
        assert session.scalar(select(func.count()).select_from(UserSession)) == 0


def test_expired_session_is_rejected_and_deleted(
    client: TestClient,
    test_database_engine: Engine,
) -> None:
    register_response = client.post("/api/v1/auth/register", json=REGISTER_DATA)
    with test_database_engine.begin() as connection:
        connection.execute(
            update(UserSession).values(expires_at=datetime.now(UTC) - timedelta(seconds=1))
        )

    current_user_response = client.get("/api/v1/auth/me")

    assert register_response.status_code == 201
    assert current_user_response.status_code == 401
    assert current_user_response.json() == {"detail": "No autenticado"}
    with Session(test_database_engine) as session:
        assert session.scalar(select(func.count()).select_from(UserSession)) == 0