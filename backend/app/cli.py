from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

from pymongo import AsyncMongoClient
from pymongo.errors import DuplicateKeyError

from app.config import get_settings
from app.database import ensure_indexes
from app.security import hash_password, utc_now
from app.schema import MenuWrite, SiteWrite

PROJECT_ROOT = Path(__file__).resolve().parents[2]


async def open_database():
    settings = get_settings()
    client = AsyncMongoClient(settings.mongodb_uri.get_secret_value(), serverSelectionTimeoutMS=5000)
    await client.admin.command("ping")
    db = client[settings.mongodb_database]
    await ensure_indexes(db, settings)
    return client, db, settings


async def bootstrap_admin() -> int:
    client, db, settings = await open_database()
    try:
        if not settings.admin_bootstrap_email or not settings.admin_bootstrap_password:
            print("ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD are required", file=sys.stderr)
            return 2
        email = str(settings.admin_bootstrap_email).casefold()
        if await db.entities_admin_users.find_one({"email": email}):
            print("Admin already exists; refusing overwrite", file=sys.stderr)
            return 1
        await db.entities_admin_users.insert_one({
            "email": email, "password_hash": hash_password(settings.admin_bootstrap_password.get_secret_value()),
            "active": True, "created_at": utc_now(),
        })
        print("Admin bootstrap completed")
        return 0
    except DuplicateKeyError:
        return 1
    finally:
        await client.close()


async def seed_content() -> int:
    """Import checked-in initial Yummy content exactly once, without overwriting CMS edits."""
    menu_file = PROJECT_ROOT / "data" / "menu.json"
    site_file = PROJECT_ROOT / "data" / "site.json"
    menu = MenuWrite.model_validate({"categories": json.loads(menu_file.read_text(encoding="utf-8"))})
    site = SiteWrite.model_validate(json.loads(site_file.read_text(encoding="utf-8")))
    client, db, _ = await open_database()
    try:
        await db.entities_menu.update_one({"_id": "menu"}, {
            "$setOnInsert": {
                "categories": [category.model_dump(mode="json", exclude_none=True) for category in menu.categories],
                "revision": 0, "updated_at": utc_now(),
            }
        }, upsert=True)
        await db.entities_site_content.update_one({"_id": "site"}, {
            "$setOnInsert": site.model_dump(mode="json") | {"updated_at": utc_now()}
        }, upsert=True)
        print("Initial menu and restaurant settings available. Existing CMS content was not overwritten.")
        return 0
    finally:
        await client.close()


def main() -> int:
    parser = argparse.ArgumentParser(description="Yummy CMS management")
    parser.add_argument("command", choices=("bootstrap-admin", "seed-content"))
    command = parser.parse_args().command
    return asyncio.run(bootstrap_admin() if command == "bootstrap-admin" else seed_content())


if __name__ == "__main__":
    raise SystemExit(main())
