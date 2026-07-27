from __future__ import annotations

from fastapi import APIRouter
from schemas import UserCreate
from starlette.responses import JSONResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(body: UserCreate) -> JSONResponse:
    return JSONResponse(status_code=501, content={"detail": "Not implemented"})


@router.post("/login")
async def login(body: UserCreate) -> JSONResponse:
    return JSONResponse(status_code=501, content={"detail": "Not implemented"})
