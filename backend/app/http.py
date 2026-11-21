from __future__ import annotations

from datetime import timedelta

from fastapi import HTTPException, Request, status
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError
from pymongo.asynchronous.database import AsyncDatabase

from app.config import Settings
from app.security import client_ip, utc_now


async def admin_origin_guard(request: Request, settings: Settings) -> None:
    from app.security import require_exact_origin

    require_exact_origin(request, (str(settings.admin_origin).rstrip("/"),))


async def public_origin_guard(request: Request, settings: Settings) -> None:
    from app.security import require_exact_origin

    require_exact_origin(request, (str(settings.public_origin).rstrip("/"),))


async def enforce_rate_limit(
    db: AsyncDatabase,
    *,
    key: str,
    limit: int,
    window_seconds: int,
) -> None:
    now = utc_now()
    bucket = int(now.timestamp()) // window_seconds
    bucket_key = f"{key}:{bucket}"
    try:
        document = await db.entities_rate_limits.find_one_and_update(
            {"_id": bucket_key, "count": {"$lt": limit}},
            {
                "$inc": {"count": 1},
                "$setOnInsert": {
                    "key": key,
                    "created_at": now,
                    "expires_at": now + timedelta(seconds=window_seconds * 2),
                },
            },
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )
    except DuplicateKeyError as exc:
        # A concurrent request consumed the final slot before this upsert.
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many requests. Try again later.") from exc
    if not document:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many requests. Try again later.")


def request_identity(request: Request, settings: Settings) -> str:
    return client_ip(request, settings)
