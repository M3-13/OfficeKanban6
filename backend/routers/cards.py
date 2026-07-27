from __future__ import annotations

from fastapi import APIRouter
from schemas import CardCreate, CardMove, CardUpdate
from starlette.responses import JSONResponse

router = APIRouter(prefix="/cards", tags=["cards"])


@router.get("")
async def get_cards() -> JSONResponse:
    return JSONResponse(status_code=501, content={"detail": "Not implemented"})


@router.post("")
async def create_card(body: CardCreate) -> JSONResponse:
    return JSONResponse(status_code=501, content={"detail": "Not implemented"})


@router.put("/{card_id}")
async def update_card(card_id: int, body: CardUpdate) -> JSONResponse:
    return JSONResponse(status_code=501, content={"detail": "Not implemented"})


@router.delete("/{card_id}")
async def delete_card(card_id: int) -> JSONResponse:
    return JSONResponse(status_code=501, content={"detail": "Not implemented"})


@router.put("/move")
async def move_card(body: CardMove) -> JSONResponse:
    return JSONResponse(status_code=501, content={"detail": "Not implemented"})
