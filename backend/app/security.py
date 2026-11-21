from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError
from fastapi import HTTPException, Request, status

from app.config import Settings

password_hasher = PasswordHasher()
ACCESS_COOKIE = "yummy_access"
REFRESH_COOKIE = "yummy_refresh"


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def iso(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(hash_value: str, password: str) -> bool:
    try:
        return password_hasher.verify(hash_value, password)
    except (VerifyMismatchError, InvalidHashError):
        return False


def create_access_token(user_id: str, settings: Settings) -> str:
    now = utc_now()
    return jwt.encode(
        {"sub": user_id, "typ": "access", "iat": now, "exp": now + timedelta(minutes=settings.access_token_minutes)},
        settings.jwt_secret.get_secret_value(),
        algorithm="HS256",
    )


def decode_access_token(token: str, settings: Settings) -> str:
    try:
        payload = jwt.decode(token, settings.jwt_secret.get_secret_value(), algorithms=["HS256"])
        if payload.get("typ") != "access" or not isinstance(payload.get("sub"), str):
            raise jwt.InvalidTokenError("Unexpected token")
        return payload["sub"]
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required") from exc


def create_refresh_token() -> tuple[str, str]:
    token = secrets.token_urlsafe(48)
    return token, token_hash(token)


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def client_ip(request: Request, settings: Settings) -> str:
    peer = request.client.host if request.client else "unknown"
    forwarded = request.headers.get("x-forwarded-for")
    if peer in settings.trusted_proxies and forwarded:
        return forwarded.split(",", 1)[0].strip() or peer
    return peer


def require_exact_origin(request: Request, allowed_origins: tuple[str, ...]) -> None:
    origin = request.headers.get("origin")
    if origin not in allowed_origins:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Untrusted request origin")


def private_fingerprint(value: str, settings: Settings) -> str:
    return hmac.new(
        settings.privacy_hash_secret.get_secret_value().encode("utf-8"),
        value.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def set_session_cookies(response, access_token: str, refresh_token: str, settings: Settings) -> None:
    common = {"httponly": True, "secure": settings.is_production, "samesite": "lax", "path": "/api/v1"}
    response.set_cookie(ACCESS_COOKIE, access_token, max_age=settings.access_token_minutes * 60, **common)
    response.set_cookie(REFRESH_COOKIE, refresh_token, max_age=settings.refresh_token_days * 86400, **common)


def clear_session_cookies(response, settings: Settings) -> None:
    response.delete_cookie(ACCESS_COOKIE, path="/api/v1", secure=settings.is_production, httponly=True, samesite="lax")
    response.delete_cookie(REFRESH_COOKIE, path="/api/v1", secure=settings.is_production, httponly=True, samesite="lax")
