from __future__ import annotations

from datetime import timedelta
from typing import Annotated

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pymongo import ReturnDocument
from pymongo.asynchronous.database import AsyncDatabase

from app.config import Settings, get_settings
from app.database import database_dependency
from app.dependencies import get_current_admin
from app.http import admin_origin_guard, enforce_rate_limit, request_identity
from app.security import (
    REFRESH_COOKIE,
    clear_session_cookies,
    create_access_token,
    create_refresh_token,
    private_fingerprint,
    set_session_cookies,
    token_hash,
    utc_now,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    email: EmailStr
    password: str = Field(min_length=12, max_length=1024)


class AdminResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: EmailStr


async def _create_session(db: AsyncDatabase, user_id: ObjectId, request: Request, settings: Settings) -> tuple[str, str]:
    raw_refresh, refresh_hash = create_refresh_token()
    now = utc_now()
    await db.entities_sessions.insert_one(
        {
            "user_id": user_id,
            "token_hash": refresh_hash,
            "created_at": now,
            "expires_at": now + timedelta(days=settings.refresh_token_days),
            "revoked_at": None,
            "ip_hash": private_fingerprint(request_identity(request, settings), settings),
        }
    )
    return create_access_token(str(user_id), settings), raw_refresh


@router.post("/login", response_model=AdminResponse)
async def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: Annotated[AsyncDatabase, Depends(database_dependency)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> AdminResponse:
    await admin_origin_guard(request, settings)
    identity = request_identity(request, settings)
    await enforce_rate_limit(
        db,
        key=f"login:{private_fingerprint(f'{identity}:{payload.email.casefold()}', settings)}",
        limit=settings.login_max_attempts,
        window_seconds=settings.login_window_seconds,
    )
    user = await db.entities_admin_users.find_one({"email": str(payload.email).casefold(), "active": True})
    if not user or not verify_password(user["password_hash"], payload.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access, refresh = await _create_session(db, user["_id"], request, settings)
    set_session_cookies(response, access, refresh, settings)
    return AdminResponse(email=user["email"])


@router.post("/refresh", response_model=AdminResponse)
async def refresh(
    request: Request,
    response: Response,
    db: Annotated[AsyncDatabase, Depends(database_dependency)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> AdminResponse:
    await admin_origin_guard(request, settings)
    raw_token = request.cookies.get(REFRESH_COOKIE)
    if not raw_token:
        clear_session_cookies(response, settings)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    now = utc_now()
    session = await db.entities_sessions.find_one_and_update(
        {"token_hash": token_hash(raw_token), "revoked_at": None, "expires_at": {"$gt": now}},
        {"$set": {"revoked_at": now, "rotated_at": now}},
        return_document=ReturnDocument.BEFORE,
    )
    if not session:
        clear_session_cookies(response, settings)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    user = await db.entities_admin_users.find_one({"_id": session["user_id"], "active": True})
    if not user:
        clear_session_cookies(response, settings)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    access, new_refresh = await _create_session(db, user["_id"], request, settings)
    set_session_cookies(response, access, new_refresh, settings)
    return AdminResponse(email=user["email"])


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: Request,
    response: Response,
    db: Annotated[AsyncDatabase, Depends(database_dependency)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> None:
    await admin_origin_guard(request, settings)
    raw_token = request.cookies.get(REFRESH_COOKIE)
    if raw_token:
        await db.entities_sessions.update_one(
            {"token_hash": token_hash(raw_token), "revoked_at": None}, {"$set": {"revoked_at": utc_now()}}
        )
    clear_session_cookies(response, settings)


@router.get("/me", response_model=AdminResponse)
async def current_admin(
    request: Request,
    user: Annotated[dict, Depends(get_current_admin)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> AdminResponse:
    await admin_origin_guard(request, settings)
    return AdminResponse(email=user["email"])
