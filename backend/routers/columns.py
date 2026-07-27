from __future__ import annotations

from auth import CurrentUser, get_current_user
from database import get_db
from fastapi import APIRouter, Body, Depends, HTTPException, status
from models import ColumnModel
from schemas import ColumnCreate, ColumnReorderItem, ColumnResponse, ColumnUpdate
from sqlalchemy import func
from sqlalchemy.orm import Session

router = APIRouter(prefix="/columns", tags=["columns"])


@router.get("", response_model=list[ColumnResponse])
async def get_columns(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ColumnModel]:
    return (
        db.query(ColumnModel)
        .filter(ColumnModel.user_id == current_user.id)
        .order_by(ColumnModel.position)
        .all()
    )


@router.post("", response_model=ColumnResponse, status_code=status.HTTP_201_CREATED)
async def create_column(
    body: ColumnCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ColumnModel:
    max_position = (
        db.query(func.coalesce(func.max(ColumnModel.position), -1))
        .filter(ColumnModel.user_id == current_user.id)
        .scalar()
    )
    column = ColumnModel(
        title=body.title,
        position=max_position + 1,
        user_id=current_user.id,
    )
    db.add(column)
    db.commit()
    db.refresh(column)
    return column


@router.put("/reorder", status_code=status.HTTP_200_OK)
async def reorder_columns(
    body: list[ColumnReorderItem] = Body(...),
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    if not body:
        return {"status": "ok"}

    ids = [item.id for item in body]
    owned_columns = (
        db.query(ColumnModel)
        .filter(ColumnModel.id.in_(ids), ColumnModel.user_id == current_user.id)
        .all()
    )
    owned_ids = {col.id for col in owned_columns}
    if len(owned_ids) != len(ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more columns not found",
        )

    column_map = {col.id: col for col in owned_columns}
    for item in body:
        col = column_map[item.id]
        col.position = item.position

    db.commit()
    return {"status": "ok"}


@router.put("/{column_id}", response_model=ColumnResponse)
async def update_column(
    column_id: int,
    body: ColumnUpdate,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ColumnModel:
    column = (
        db.query(ColumnModel)
        .filter(ColumnModel.id == column_id, ColumnModel.user_id == current_user.id)
        .first()
    )
    if column is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Column not found")
    column.title = body.title
    db.commit()
    db.refresh(column)
    return column


@router.delete("/{column_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_column(
    column_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    column = (
        db.query(ColumnModel)
        .filter(ColumnModel.id == column_id, ColumnModel.user_id == current_user.id)
        .first()
    )
    if column is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Column not found")
    db.delete(column)
    db.commit()
