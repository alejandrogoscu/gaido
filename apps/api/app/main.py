from fastapi import FastAPI

from app.api.routes.health import router as health_router
from app.features.auth.router import router as auth_router
from app.features.games.router import router as games_router

app = FastAPI(
    title="Gaido API",
    version="0.1.0",
    description="API de la biblioteca personal de videojuegos Gaido.",
)

app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(games_router, prefix="/api/v1")