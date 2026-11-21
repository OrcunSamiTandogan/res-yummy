from __future__ import annotations

from bson import ObjectId
from fastapi import Depends, HTTPException, Request, status
from pymongo.asynchronous.database import AsyncDatabase

from app.config import Settings, get_settings
from app.database import database_dependency
from app.security import ACCESS_COOKIE, decode_access_token


async def get_current_admin(
    request: Request,
    db: AsyncDatabase = Depends(database_dependency),
    settings: Settings = Depends(get_settings),
) -> dict:
    token = request.cookies.get(ACCESS_COOKIE)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    user_id = decode_access_token(token, settings)
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    user = await db.entities_admin_users.find_one({"_id": ObjectId(user_id), "active": True})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user
