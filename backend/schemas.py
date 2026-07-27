from __future__ import annotations

from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    email: str = Field(
        ..., max_length=255, pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    )
    password: str = Field(..., min_length=6, max_length=128)


class UserResponse(BaseModel):
    id: int
    email: str

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ColumnCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)


class ColumnUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)


class ColumnResponse(BaseModel):
    id: int
    title: str
    position: int
    user_id: int

    model_config = {"from_attributes": True}


class CardCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    column_id: int


class CardUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)


class CardMove(BaseModel):
    column_id: int


class CardResponse(BaseModel):
    id: int
    title: str
    description: str
    position: int
    column_id: int
    user_id: int

    model_config = {"from_attributes": True}
