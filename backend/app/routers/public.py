from __future__ import annotations

from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pymongo.errors import DuplicateKeyError, PyMongoError
from pymongo.asynchronous.database import AsyncDatabase

from app.config import Settings, get_settings
from app.database import database_dependency
from app.http import enforce_rate_limit, public_origin_guard, request_identity
from app.schema import ContactCreate, MenuCategory, SiteWrite
from app.security import private_fingerprint, utc_now

router = APIRouter(tags=["public"])


@router.get("/menu", response_model=list[MenuCategory])
async def get_menu(db: Annotated[AsyncDatabase, Depends(database_dependency)]):
    document = await db.entities_menu.find_one({"_id": "menu"})
    if not document:
        raise HTTPException(status_code=503, detail="Restaurant menu is unavailable")
    return document["categories"]


@router.get("/site-content", response_model=SiteWrite)
async def get_site(db: Annotated[AsyncDatabase, Depends(database_dependency)]):
    document = await db.entities_site_content.find_one({"_id": "site"})
    if not document:
        raise HTTPException(status_code=503, detail="Restaurant content is unavailable")
    return {field: document[field] for field in SiteWrite.model_fields}


@router.post("/contact", status_code=status.HTTP_201_CREATED)
async def create_contact(
    payload: ContactCreate,
    request: Request,
    db: Annotated[AsyncDatabase, Depends(database_dependency)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> dict[str, str]:
    await public_origin_guard(request, settings)
    if payload.website:
        return {"status": "accepted"}
    identity = request_identity(request, settings)
    identity_hash = private_fingerprint(identity, settings)
    await enforce_rate_limit(
        db,
        key=f"contact:{identity_hash}",
        limit=settings.contact_max_attempts,
        window_seconds=settings.contact_window_seconds,
    )
    now = utc_now()
    canonical = "|".join((str(payload.email).lower(), payload.subject.casefold(), payload.message.casefold()))
    dedupe_hash = private_fingerprint(canonical, settings)
    try:
        await db.entities_contact_dedupes.insert_one({
            "dedupe_hash": dedupe_hash,
            "created_at": now,
            "expires_at": now + timedelta(seconds=settings.contact_dedupe_seconds),
        })
    except DuplicateKeyError:
        return {"status": "accepted"}
    try:
        await db.entities_contact_messages.insert_one({
            "name": payload.name,
            "email": str(payload.email),
            "subject": payload.subject,
            "message": payload.message,
            "read": False,
            "created_at": now,
            "expires_at": now + timedelta(days=settings.contact_retention_days),
            "request_ip_hash": identity_hash,
        })
    except PyMongoError:
        await db.entities_contact_dedupes.delete_one({"dedupe_hash": dedupe_hash})
        raise
    return {"status": "accepted"}
