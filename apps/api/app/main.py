from fastapi import FastAPI

from app.api.routes.health import router as health_router

app = FastAPI(
    title="Gaido API",
    version="0.1.0",
    description="API de la biblioteca personal de videojuegos Gaido.",
)

app.include_router(health_router, prefix="/api/v1")
