from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_session
from app.features.auth.schemas import UserResponse
from app.features.auth.security import clear_session_cookie
from app.features.auth.service import get_user_from_session

type SessionDependency = Annotated[Session, Depends(get_session)]
type SessionToken = Annotated[
    str | None,
    Cookie(alias=settings.session_cookie_name),
]


def require_authenticated_user(
    response: Response,
    session: SessionDependency,
    session_token: SessionToken = None,
) -> UserResponse:
    if session_token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")

    user = get_user_from_session(session, session_token)
    if user is None:
        clear_session_cookie(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")

    return user


type CurrentUserDependency = Annotated[UserResponse, Depends(require_authenticated_user)]