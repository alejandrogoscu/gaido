import os
from collections.abc import Generator
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import Engine, create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session, sessionmaker

from app.db.base import Base
from app.db.session import get_session
from app.main import app


@pytest.fixture(scope="session")
def test_database_engine() -> Generator[Engine]:
    admin_url_value = os.environ.get("TEST_DATABASE_ADMIN_URL")
    if not admin_url_value:
        pytest.fail("TEST_DATABASE_ADMIN_URL es obligatoria para aislar la base de datos de tests")

    admin_url = make_url(admin_url_value)
    database_name = f"gaido_test_{uuid4().hex}"
    test_database_url = admin_url.set(database=database_name)
    admin_engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")

    with admin_engine.connect() as connection:
        connection.execute(text(f'CREATE DATABASE "{database_name}"'))

    test_engine = create_engine(test_database_url)
    Base.metadata.create_all(test_engine)

    try:
        yield test_engine
    finally:
        test_engine.dispose()
        with admin_engine.connect() as connection:
            connection.execute(text(f'DROP DATABASE "{database_name}" WITH (FORCE)'))
        admin_engine.dispose()


@pytest.fixture
def client(test_database_engine: Engine) -> Generator[TestClient]:
    testing_session = sessionmaker(bind=test_database_engine, expire_on_commit=False)

    def override_get_session() -> Generator[Session]:
        with testing_session() as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session

    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        with test_database_engine.begin() as connection:
            connection.execute(
                text(
                    "TRUNCATE TABLE library_games, game_covers, game_editions, "
                    "game_localizations, platforms, games, user_sessions, users "
                    "RESTART IDENTITY CASCADE"
                )
            )