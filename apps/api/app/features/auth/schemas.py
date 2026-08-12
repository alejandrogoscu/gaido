import re
import unicodedata
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

USERNAME_PATTERN = re.compile(r"^[\w.-]+$", flags=re.UNICODE)


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str = Field(min_length=12, max_length=128)

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        display_name = unicodedata.normalize("NFKC", value).strip()
        normalized_username = display_name.casefold()

        if not 3 <= len(normalized_username) <= 30:
            raise ValueError("El nombre de usuario debe tener entre 3 y 30 caracteres")
        if not USERNAME_PATTERN.fullmatch(normalized_username):
            raise ValueError(
                "El nombre de usuario solo admite letras, números, puntos, guiones y guiones bajos"
            )

        return display_name


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    display_name: str
    created_at: datetime