from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pymongo import AsyncMongoClient
from pymongo.errors import PyMongoError

from app.config import Settings, get_settings
from app.database import create_client, ensure_indexes
from app.routers import admin, auth, public

logger = logging.getLogger(__name__)
_client: AsyncMongoClient | None = None
_settings: Settings | None = None


def get_database():
    if _client is None or _settings is None:
        raise RuntimeError("Database client is not initialized")
    return _client[_settings.mongodb_database]


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _client, _settings
    settings = get_settings()
    _settings = settings
    settings.media_root.mkdir(parents=True, exist_ok=True)
    _client = AsyncMongoClient(settings.mongodb_uri.get_secret_value(), serverSelectionTimeoutMS=3000)
    try:
        await _client.admin.command("ping")
        await ensure_indexes(_client[settings.mongodb_database], settings)
    except PyMongoError:
        # The API remains available so health and callers can receive a clear degraded state.
        logger.warning("MongoDB unavailable while starting API; requests will return service unavailable")
    yield
    if _client is not None:
        await _client.close()
    _client = None
    _settings = None


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Yummy Restaurant CMS API",
        version="1.0.0",
        lifespan=lifespan,
        docs_url=None if settings.is_production else "/docs",
        redoc_url=None if settings.is_production else "/redoc",
        openapi_url=None if settings.is_production else "/openapi.json",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.allowed_origins),
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type"],
        max_age=600,
    )

    @app.middleware("http")
    async def security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "same-origin"
        if request.url.path.startswith(("/api/v1/auth", "/api/v1/admin")):
            response.headers["Cache-Control"] = "no-store, private"
        return response

    @app.exception_handler(PyMongoError)
    async def mongo_unavailable(_: Request, __: PyMongoError) -> JSONResponse:
        return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content={"detail": "Database is unavailable"})

    @app.get("/health", tags=["health"])
    async def health() -> JSONResponse:
        try:
            await get_database().command("ping")
        except (PyMongoError, RuntimeError):
            return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content={"status": "degraded", "database": "unavailable"})
        return JSONResponse(content={"status": "ok", "database": "ok"})

    app.include_router(public.router, prefix="/api/v1")
    app.include_router(auth.router, prefix="/api/v1")
    app.include_router(admin.router, prefix="/api/v1")
    app.mount(settings.media_public_prefix, StaticFiles(directory=settings.media_root, check_dir=False), name="media")
    return app


app = create_app()
