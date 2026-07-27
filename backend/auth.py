from __future__ import annotations

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security = HTTPBearer()
_security_dependency = Depends(security)


def create_access_token(data: dict) -> str:
    raise NotImplementedError


def verify_token(token: str) -> dict:
    raise NotImplementedError


def hash_password(password: str) -> str:
    raise NotImplementedError


def verify_password(plain_password: str, hashed_password: str) -> bool:
    raise NotImplementedError


def get_current_user(
    credentials: HTTPAuthorizationCredentials = _security_dependency,
) -> dict:
    raise NotImplementedError
