import unicodedata
from dataclasses import dataclass
from datetime import UTC, datetime

from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.features.auth.models import User, UserSession
from app.features.auth.schemas import LoginRequest, RegisterRequest, UserResponse
from app.features.auth.security import (
    dummy_password_hash,
    generate_session_token,
    hash_password,
    hash_session_token,
    password_needs_rehash,
    session_expiration,
    verify_password,
)


class RegistrationConflictError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


@dataclass(frozen=True)
class AuthenticationResult:
    user: UserResponse
    session_token: str


def register_user(session: Session, data: RegisterRequest) -> AuthenticationResult:
    display_name = unicodedata.normalize("NFKC", data.username).strip()
    user = User(
        email=_normalize_email(data.email),
        username=display_name.casefold(),
        display_name=display_name,
        password_hash=hash_password(data.password),
    )
    session_token = generate_session_token()
    user_session = UserSession(
        user=user,
        token_hash=hash_session_token(session_token),
        expires_at=session_expiration(),
    )

    try:
        session.add(user_session)
        session.commit()
    except IntegrityError as error:
        session.rollback()
        raise RegistrationConflictError from error

    return AuthenticationResult(user=_to_response(user), session_token=session_token)


def login_user(session: Session, data: LoginRequest) -> AuthenticationResult:
    user = session.scalar(select(User).where(User.email == _normalize_email(data.email)))
    password_hash = user.password_hash if user else dummy_password_hash

    if not verify_password(data.password, password_hash) or user is None:
        raise InvalidCredentialsError

    now = datetime.now(UTC)
    session.execute(
        delete(UserSession).where(
            UserSession.user_id == user.id,
            UserSession.expires_at <= now,
        )
    )

    if password_needs_rehash(user.password_hash):
        user.password_hash = hash_password(data.password)

    session_token = generate_session_token()
    session.add(
        UserSession(
            user_id=user.id,
            token_hash=hash_session_token(session_token),
            expires_at=session_expiration(),
        )
    )
    session.commit()

    return AuthenticationResult(user=_to_response(user), session_token=session_token)


def get_user_from_session(session: Session, token: str) -> UserResponse | None:
    user_session = session.scalar(
        select(UserSession).where(UserSession.token_hash == hash_session_token(token))
    )
    if user_session is None:
        return None

    if user_session.expires_at <= datetime.now(UTC):
        session.delete(user_session)
        session.commit()
        return None

    return _to_response(user_session.user)


def logout_user(session: Session, token: str | None) -> None:
    if token is None:
        return

    session.execute(
        delete(UserSession).where(UserSession.token_hash == hash_session_token(token))
    )
    session.commit()


def _normalize_email(email: str) -> str:
    return str(email).strip().casefold()


def _to_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        display_name=user.display_name,
        created_at=user.created_at,
    )