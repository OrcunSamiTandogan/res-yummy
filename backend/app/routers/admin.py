from __future__ import annotations

from typing import Annotated

from bson import ObjectId
from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from pydantic import BaseModel, ConfigDict
from pymongo import ReturnDocument
from pymongo.asynchronous.database import AsyncDatabase

from app.config import Settings, get_settings
from app.database import database_dependency
from app.dependencies import get_current_admin
from app.http import admin_origin_guard
from app.media import store_upload
from app.schema import MenuWrite, SiteWrite
from app.security import iso, utc_now

router = APIRouter(prefix="/admin", tags=["admin"])


class ReadState(BaseModel):
    model_config = ConfigDict(extra="forbid")
    read: bool


async def guard(request: Request, settings: Settings) -> None:
    await admin_origin_guard(request, settings)


@router.get("/menu")
async def admin_menu(
    request: Request,
    _: Annotated[dict, Depends(get_current_admin)],
    db: Annotated[AsyncDatabase, Depends(database_dependency)],
    settings: Annotated[Settings, Depends(get_settings)],
):
    await guard(request, settings)
    document = await db.entities_menu.find_one({"_id": "menu"})
    if not document:
        raise HTTPException(status_code=503, detail="Menu not seeded")
    return {"categories": document["categories"], "revision": document["revision"]}


@router.put("/menu")
async def update_menu(
    payload: MenuWrite,
    request: Request,
    _: Annotated[dict, Depends(get_current_admin)],
    db: Annotated[AsyncDatabase, Depends(database_dependency)],
    settings: Annotated[Settings, Depends(get_settings)],
):
    await guard(request, settings)
    if payload.revision is None:
        raise HTTPException(status_code=428, detail="Menu revision required; reload before saving")
    categories = [category.model_dump(mode="json", exclude_none=True) for category in payload.categories]
    document = await db.entities_menu.find_one_and_update(
        {"_id": "menu", "revision": payload.revision},
        {"$set": {"categories": categories, "updated_at": utc_now()}, "$inc": {"revision": 1}},
        return_document=ReturnDocument.AFTER,
    )
    if not document:
        raise HTTPException(status_code=409, detail="Menu changed elsewhere; reload before saving")
    return {
        "categories": len(categories),
        "items": sum(len(category["items"]) for category in categories),
        "revision": document["revision"],
    }


@router.get("/site-content", response_model=SiteWrite)
async def get_site(
    request: Request,
    _: Annotated[dict, Depends(get_current_admin)],
    db: Annotated[AsyncDatabase, Depends(database_dependency)],
    settings: Annotated[Settings, Depends(get_settings)],
):
    await guard(request, settings)
    document = await db.entities_site_content.find_one({"_id": "site"})
    if not document:
        raise HTTPException(status_code=503, detail="Site content not seeded")
    return {field: document[field] for field in SiteWrite.model_fields}


@router.put("/site-content", response_model=SiteWrite)
async def save_site(
    payload: SiteWrite,
    request: Request,
    _: Annotated[dict, Depends(get_current_admin)],
    db: Annotated[AsyncDatabase, Depends(database_dependency)],
    settings: Annotated[Settings, Depends(get_settings)],
):
    await guard(request, settings)
    data = payload.model_dump(mode="json")
    await db.entities_site_content.update_one(
        {"_id": "site"}, {"$set": data | {"updated_at": utc_now()}}, upsert=True
    )
    return payload


def message_response(document: dict) -> dict:
    return {
        "id": str(document["_id"]),
        "name": document["name"],
        "email": document["email"],
        "subject": document["subject"],
        "message": document["message"],
        "read": document["read"],
        "created_at": iso(document["created_at"]),
    }


@router.get("/messages")
async def list_messages(
    request: Request,
    _: Annotated[dict, Depends(get_current_admin)],
    db: Annotated[AsyncDatabase, Depends(database_dependency)],
    settings: Annotated[Settings, Depends(get_settings)],
    limit: int = 50,
    offset: int = 0,
):
    await guard(request, settings)
    if not 1 <= limit <= 100 or offset < 0:
        raise HTTPException(status_code=422, detail="Invalid pagination")
    cursor = db.entities_contact_messages.find({}).sort("created_at", -1).skip(offset).limit(limit)
    return [message_response(document) async for document in cursor]


@router.patch("/messages/{message_id}")
async def set_message_read(
    message_id: str,
    payload: ReadState,
    request: Request,
    _: Annotated[dict, Depends(get_current_admin)],
    db: Annotated[AsyncDatabase, Depends(database_dependency)],
    settings: Annotated[Settings, Depends(get_settings)],
):
    await guard(request, settings)
    if not ObjectId.is_valid(message_id):
        raise HTTPException(status_code=404, detail="Message not found")
    document = await db.entities_contact_messages.find_one_and_update(
        {"_id": ObjectId(message_id)},
        {"$set": {"read": payload.read}},
        return_document=ReturnDocument.AFTER,
    )
    if not document:
        raise HTTPException(status_code=404, detail="Message not found")
    return message_response(document)


@router.post("/media", status_code=status.HTTP_201_CREATED)
async def upload_media(
    request: Request,
    upload: UploadFile = File(...),
    _: dict = Depends(get_current_admin),
    db: AsyncDatabase = Depends(database_dependency),
    settings: Settings = Depends(get_settings),
):
    await guard(request, settings)
    media = await store_upload(upload, db, settings)
    return {"path": media["url"], "width": media["width"], "height": media["height"]}
