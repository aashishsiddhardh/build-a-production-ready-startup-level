"""AyurSage FastAPI application entrypoint."""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import admin, assessments, assistant, auth, herbs, privacy

settings = get_settings()
logger = logging.getLogger("ayursage")


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Create pgvector extension, tables and seed on startup.
    try:
        from app.seed import bootstrap

        bootstrap()
        logger.info("Database bootstrap complete")
    except Exception as exc:  # noqa: BLE001 — startup should log, not crash the container silently
        logger.exception("Bootstrap failed: %s", exc)
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Safety-first Ayurvedic wellness API. Educational only — not medical advice.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(assessments.router)
app.include_router(herbs.router)
app.include_router(assistant.router)
app.include_router(privacy.router)
app.include_router(admin.router)


@app.get("/api/health", tags=["meta"])
def health() -> dict:
    return {"status": "ok", "service": settings.app_name, "environment": settings.environment}


@app.get("/", tags=["meta"])
def root() -> dict:
    return {
        "service": settings.app_name,
        "docs": "/docs",
        "disclaimer": "Educational Ayurvedic wellness only. Not medical advice, diagnosis, or treatment.",
    }
