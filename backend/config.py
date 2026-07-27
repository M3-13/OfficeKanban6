from __future__ import annotations

import os

SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
DB_PATH: str = os.getenv("DB_PATH", os.path.join(os.path.dirname(__file__), "kanban.db"))
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
