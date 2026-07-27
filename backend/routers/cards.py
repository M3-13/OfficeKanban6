from __future__ import annotations

from auth import CurrentUser, get_current_user
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, Query
from models import Card, ColumnModel
from schemas import CardCreate, CardMove, CardResponse, CardUpdate
from sqlalchemy.orm import Session

router = APIRouter(prefix="/cards", tags=["cards"])

_db_dependency = Depends(get_db)
_current_user_dependency = Depends(get_current_user)


@router.get("", response_model=list[CardResponse])
def get_cards(
    column_id: int = Query(...),
    db: Session = _db_dependency,
    current_user: CurrentUser = _current_user_dependency,
) -> list[Card]:
    column = (
        db.query(ColumnModel)
        .filter(ColumnModel.id == column_id, ColumnModel.user_id == current_user.id)
        .first()
    )
    if not column:
        raise HTTPException(status_code=404, detail="Column not found")
    return db.query(Card).filter(Card.column_id == column_id).order_by(Card.position).all()


@router.post("", response_model=CardResponse, status_code=201)
def create_card(
    body: CardCreate,
    db: Session = _db_dependency,
    current_user: CurrentUser = _current_user_dependency,
) -> Card:
    column = (
        db.query(ColumnModel)
        .filter(
            ColumnModel.id == body.column_id,
            ColumnModel.user_id == current_user.id,
        )
        .first()
    )
    if not column:
        raise HTTPException(status_code=404, detail="Column not found")

    max_card = (
        db.query(Card)
        .filter(Card.column_id == body.column_id)
        .order_by(Card.position.desc())
        .first()
    )
    new_position = (max_card.position + 1) if max_card else 0

    card = Card(
        title=body.title,
        description=body.description,
        position=new_position,
        column_id=body.column_id,
        user_id=current_user.id,
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


@router.put("/move", response_model=CardResponse)
def move_card(
    body: CardMove,
    db: Session = _db_dependency,
    current_user: CurrentUser = _current_user_dependency,
) -> Card:
    card = db.query(Card).filter(Card.id == body.card_id, Card.user_id == current_user.id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    target_column = (
        db.query(ColumnModel)
        .filter(
            ColumnModel.id == body.target_column_id,
            ColumnModel.user_id == current_user.id,
        )
        .first()
    )
    if not target_column:
        raise HTTPException(status_code=404, detail="Target column not found")

    source_column_id = card.column_id
    old_position = card.position

    if source_column_id == body.target_column_id:
        if old_position < body.target_position:
            db.query(Card).filter(
                Card.column_id == source_column_id,
                Card.position > old_position,
                Card.position <= body.target_position,
            ).update({Card.position: Card.position - 1}, synchronize_session="fetch")
        elif old_position > body.target_position:
            db.query(Card).filter(
                Card.column_id == source_column_id,
                Card.position >= body.target_position,
                Card.position < old_position,
            ).update({Card.position: Card.position + 1}, synchronize_session="fetch")
        card.position = body.target_position
    else:
        db.query(Card).filter(
            Card.column_id == source_column_id,
            Card.position > old_position,
        ).update({Card.position: Card.position - 1}, synchronize_session="fetch")

        db.query(Card).filter(
            Card.column_id == body.target_column_id,
            Card.position >= body.target_position,
        ).update({Card.position: Card.position + 1}, synchronize_session="fetch")

        card.column_id = body.target_column_id
        card.position = body.target_position

    db.commit()
    db.refresh(card)
    return card


@router.put("/{card_id}", response_model=CardResponse)
def update_card(
    card_id: int,
    body: CardUpdate,
    db: Session = _db_dependency,
    current_user: CurrentUser = _current_user_dependency,
) -> Card:
    card = db.query(Card).filter(Card.id == card_id, Card.user_id == current_user.id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    if body.title is not None:
        card.title = body.title
    if body.description is not None:
        card.description = body.description

    db.commit()
    db.refresh(card)
    return card


@router.delete("/{card_id}", status_code=204)
def delete_card(
    card_id: int,
    db: Session = _db_dependency,
    current_user: CurrentUser = _current_user_dependency,
) -> None:
    card = db.query(Card).filter(Card.id == card_id, Card.user_id == current_user.id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    db.delete(card)
    db.commit()
