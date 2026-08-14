from fastapi import APIRouter, HTTPException, Response, status

from app.features.auth.dependencies import (
    CurrentUserDependency,
    SessionDependency,
    SessionToken,
)
from app.features.auth.schemas import LoginRequest, RegisterRequest, UserResponse
from app.features.auth.security import clear_session_cookie, set_session_cookie
from app.features.auth.service import (
    InvalidCredentialsError,
    RegistrationConflictError,
    login_user,
    logout_user,
    register_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    data: RegisterRequest,
    response: Response,
    session: SessionDependency,
    session_token: SessionToken = None,
) -> UserResponse:
    try:
        result = register_user(session, data)
    except RegistrationConflictError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se ha podido crear la cuenta con esos datos",
        ) from error

    logout_user(session, session_token)
    set_session_cookie(response, result.session_token)
    return result.user


@router.post("/login", response_model=UserResponse)
def login(
    data: LoginRequest,
    response: Response,
    session: SessionDependency,
    session_token: SessionToken = None,
) -> UserResponse:
    try:
        result = login_user(session, data)
    except InvalidCredentialsError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        ) from error

    logout_user(session, session_token)
    set_session_cookie(response, result.session_token)
    return result.user


@router.get("/me", response_model=UserResponse)
def current_user(
    response: Response,
    user: CurrentUserDependency,
) -> UserResponse:
    response.headers["Cache-Control"] = "no-store"
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    session: SessionDependency,
    session_token: SessionToken = None,
) -> None:
    logout_user(session, session_token)
    clear_session_cookie(response)