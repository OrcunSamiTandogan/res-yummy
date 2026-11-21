from __future__ import annotations

from collections.abc import AsyncIterator

from pymongo import ASCENDING, AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase

from app.config import Settings


async def ensure_indexes(db: AsyncDatabase, settings: Settings) -> None:
    await db.entities_admin_users.create_index("email", unique=True, name="admin_email_unique")
    await db.entities_sessions.create_index("token_hash", unique=True, name="session_token_unique")
    await db.entities_sessions.create_index("expires_at", expireAfterSeconds=0, name="session_expiry_ttl")
    await db.entities_rate_limits.create_index("expires_at", expireAfterSeconds=0, name="rate_limit_ttl")
    await db.entities_contact_dedupes.create_index("dedupe_hash", unique=True, name="contact_dedupe_unique")
    await db.entities_contact_dedupes.create_index("expires_at", expireAfterSeconds=0, name="contact_dedupe_ttl")
    await db.entities_contact_messages.create_index("expires_at", expireAfterSeconds=0, name="contact_retention_ttl")
    await db.entities_contact_messages.create_index([("created_at", ASCENDING)], name="contact_created")
    await db.entities_media.create_index("created_at", name="media_created")


async def database_dependency() -> AsyncIterator[AsyncDatabase]:
    from app.main import get_database
    yield get_database()
