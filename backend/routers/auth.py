from __future__ import annotations

from auth import create_access_token, get_db, hash_password, verify_password
from fastapi import APIRouter, Depends, HTTPException
from models import User
from schemas import AuthResponse, UserCreate, UserResponse
from sqlalchemy.orm import Session

router = APIRouter(prefix="/auth", tags=["auth"])
_get_db_dep = Depends(get_db)


@router.post("/register", status_code=201)
async def register(body: UserCreate, db: Session = _get_db_dep) -> AuthResponse:
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed = hash_password(body.password)
    user = User(email=body.email, hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return AuthResponse(user=UserResponse.model_validate(user), access_token=token)


@router.post("/login")
async def login(body: UserCreate, db: Session = _get_db_dep) -> AuthResponse:
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id)
    return AuthResponse(user=UserResponse.model_validate(user), access_token=token)
