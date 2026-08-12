from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://gaido:gaido@database:5432/gaido"
    session_cookie_name: str = "gaido_session"
    session_cookie_secure: bool = False
    session_duration_days: int = 7

    model_config = SettingsConfigDict(case_sensitive=False)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()