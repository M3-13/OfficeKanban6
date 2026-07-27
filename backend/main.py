from __future__ import annotations

from contextlib import asynccontextmanager, suppress

import models  # noqa: F401 — registers table metadata with Base before create_all
from database import Base, engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, cards, columns


@asynccontextmanager
async def lifespan(app: FastAPI):
    with suppress(Exception):
        Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="OfficeKanban6", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(columns.router, prefix="/api")
app.include_router(cards.router, prefix="/api")


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
