from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import text

from app.db.session import engine

router = APIRouter(prefix="/health", tags=["health"])


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"


class ReadinessResponse(HealthResponse):
    database: Literal["ok"] = "ok"


@router.get("/live", response_model=HealthResponse)
def liveness() -> HealthResponse:
    return HealthResponse()


@router.get("/ready", response_model=ReadinessResponse)
def readiness() -> ReadinessResponse:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return ReadinessResponse()
