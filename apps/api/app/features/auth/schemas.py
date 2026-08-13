import re
import unicodedata
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

USERNAME_PATTERN = re.compile(r"^[A-Za-z0-9_-]+$")


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str = Field(min_length=12, max_length=128)

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        display_name = unicodedata.normalize("NFKC", value).strip()

        if not 3 <= len(display_name) <= 20:
            raise ValueError("El nombre de usuario debe tener entre 3 y 20 caracteres")
        if not USERNAME_PATTERN.fullmatch(display_name):
            raise ValueError(
                "El nombre de usuario solo admite letras, números, guiones y guiones bajos"
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