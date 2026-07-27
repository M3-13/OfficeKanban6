from __future__ import annotations

from fastapi import APIRouter
from schemas import ColumnCreate, ColumnUpdate
from starlette.responses import JSONResponse

router = APIRouter(prefix="/columns", tags=["columns"])


@router.get("")
async def get_columns() -> JSONResponse:
    return JSONResponse(status_code=501, content={"detail": "Not implemented"})


@router.post("")
async def create_column(body: ColumnCreate) -> JSONResponse:
    return JSONResponse(status_code=501, content={"detail": "Not implemented"})


@router.put("/{column_id}")
async def update_column(column_id: int, body: ColumnUpdate) -> JSONResponse:
    return JSONResponse(status_code=501, content={"detail": "Not implemented"})


@router.delete("/{column_id}")
async def delete_column(column_id: int) -> JSONResponse:
    return JSONResponse(status_code=501, content={"detail": "Not implemented"})


@router.put("/reorder")
async def reorder_columns(body: list[int]) -> JSONResponse:
    return JSONResponse(status_code=501, content={"detail": "Not implemented"})
