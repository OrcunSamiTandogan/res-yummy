from __future__ import annotations

import os
import uuid
import warnings
from datetime import datetime
from io import BytesIO
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from PIL import Image, ImageOps, UnidentifiedImageError
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError, PyMongoError
from pymongo.asynchronous.database import AsyncDatabase

from app.config import Settings
from app.security import utc_now

_MAGIC_TYPES = (
    (b"\xff\xd8\xff", "jpeg"),
    (b"\x89PNG\r\n\x1a\n", "png"),
    (b"GIF87a", "gif"),
    (b"GIF89a", "gif"),
    (b"RIFF", "webp"),
)


def detect_raster(payload: bytes) -> str | None:
    for magic, kind in _MAGIC_TYPES:
        if payload.startswith(magic):
            if kind != "webp" or payload[8:12] == b"WEBP":
                return kind
    return None


async def store_upload(upload: UploadFile, db: AsyncDatabase, settings: Settings) -> dict:
    payload = await upload.read(settings.media_max_bytes + 1)
    if not payload or len(payload) > settings.media_max_bytes:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Image is too large")
    if not detect_raster(payload):
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Only recognized raster images are allowed")
    rendered, width, height = render_upload(payload, settings.media_max_pixels)
    try:
        reservation = await db.entities_media_usage.find_one_and_update(
            {"_id": "media", "bytes": {"$lte": settings.media_storage_quota_bytes - len(rendered)}},
            {"$inc": {"bytes": len(rendered)}},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )
    except DuplicateKeyError:
        reservation = None
    if not reservation:
        raise HTTPException(status_code=status.HTTP_507_INSUFFICIENT_STORAGE, detail="Media storage quota exceeded")
    filename = f"{uuid.uuid4().hex}.webp"
    root = settings.media_root.resolve()
    root.mkdir(parents=True, exist_ok=True)
    target = root / filename
    temporary = root / f".{filename}.tmp"
    try:
        with temporary.open("xb") as file_handle:
            file_handle.write(rendered)
            file_handle.flush()
            os.fsync(file_handle.fileno())
        os.replace(temporary, target)
    except OSError as exc:
        temporary.unlink(missing_ok=True)
        await db.entities_media_usage.update_one({"_id": "media"}, {"$inc": {"bytes": -len(rendered)}})
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Media storage is unavailable") from exc
    now = utc_now()
    document = {
        "filename": filename,
        "url": f"{settings.media_public_prefix}/{filename}",
        "bytes": len(rendered),
        "width": width,
        "height": height,
        "created_at": now,
    }
    try:
        result = await db.entities_media.insert_one(document)
    except PyMongoError as exc:
        target.unlink(missing_ok=True)
        await db.entities_media_usage.update_one({"_id": "media"}, {"$inc": {"bytes": -len(rendered)}})
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Media metadata storage is unavailable") from exc
    document["id"] = str(result.inserted_id)
    return document


def render_upload(payload: bytes, max_pixels: int) -> tuple[bytes, int, int]:
    """Decode, orient and normalize an uploaded raster into a metadata-free WebP."""
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(BytesIO(payload)) as source:
                # ``Image.open`` reads image metadata without decoding the full raster. Check
                # the declared dimensions before ``verify`` or orientation can allocate pixels.
                _enforce_pixel_limit(source.size, max_pixels)
                source.verify()
            with Image.open(BytesIO(payload)) as source:
                with ImageOps.exif_transpose(source) as oriented:
                    width, height = oriented.size
                    _enforce_pixel_limit((width, height), max_pixels)
                    normalized = oriented.convert("RGBA") if "A" in oriented.getbands() else oriented.convert("RGB")
                    encoded = BytesIO()
                    normalized.save(encoded, format="WEBP", method=6, quality=88)
                    rendered = encoded.getvalue()
    except (Image.DecompressionBombError, Image.DecompressionBombWarning) as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Image pixel limit exceeded") from exc
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Image decode failed") from exc
    return rendered, width, height


def _enforce_pixel_limit(size: tuple[int, int], max_pixels: int) -> None:
    width, height = size
    if width <= 0 or height <= 0 or width * height > max_pixels:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Image pixel limit exceeded")


async def cleanup_orphan_media(db: AsyncDatabase, settings: Settings, older_than: datetime) -> tuple[int, int]:
    """Remove unreferenced files older than the supplied verified cutoff."""
    referenced: set[str] = set()
    menu = await db.entities_menu.find_one({"_id": "menu"}, {"categories": 1})
    # Never prune uploads when the authoritative menu document is missing.
    if not menu:
        return 0, 0
    for category in menu.get("categories", []):
        for item in category.get("items", []):
            for url in item.get("images", []):
                if isinstance(url, str) and url.startswith(f"{settings.media_public_prefix}/"):
                    referenced.add(url.rsplit("/", 1)[-1])
    deleted_files = 0
    deleted_metadata = 0
    async for media in db.entities_media.find({"created_at": {"$lt": older_than}}):
        if media["filename"] in referenced:
            continue
        path = settings.media_root.resolve() / media["filename"]
        try:
            path.unlink(missing_ok=True)
        except OSError:
            continue
        await db.entities_media.delete_one({"_id": media["_id"]})
        await db.entities_media_usage.update_one({"_id": "media"}, {"$inc": {"bytes": -media["bytes"]}})
        deleted_files += 1
        deleted_metadata += 1
    return deleted_files, deleted_metadata
