import json
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.schema import ContactCreate, MenuWrite, SiteWrite

ROOT = Path(__file__).resolve().parents[2]


def test_existing_menu_seed_validates():
    menu = json.loads((ROOT / "data" / "menu.json").read_text(encoding="utf-8"))
    validated = MenuWrite.model_validate({"categories": menu, "revision": 0})
    assert len(validated.categories) > 0
    assert sum(len(category.items) for category in validated.categories) > 0


def test_existing_site_seed_validates():
    site = json.loads((ROOT / "data" / "site.json").read_text(encoding="utf-8"))
    validated = SiteWrite.model_validate(site)
    assert validated.whatsappNumber.isdigit()
    assert all(validated.slogan.model_dump().values())


def test_duplicate_category_is_rejected():
    menu = json.loads((ROOT / "data" / "menu.json").read_text(encoding="utf-8"))
    with pytest.raises(ValidationError):
        MenuWrite.model_validate({"categories": [menu[0], menu[0]]})


def test_duplicate_item_across_categories_is_rejected():
    menu = json.loads((ROOT / "data" / "menu.json").read_text(encoding="utf-8"))
    if len(menu) < 2:
        pytest.skip("Requires two categories")
    menu[1]["items"][0]["id"] = menu[0]["items"][0]["id"]
    with pytest.raises(ValidationError):
        MenuWrite.model_validate({"categories": menu})


def test_remote_image_is_rejected():
    menu = json.loads((ROOT / "data" / "menu.json").read_text(encoding="utf-8"))
    menu[0]["items"][0]["images"] = ["https://evil.example/image.jpg"]
    with pytest.raises(ValidationError):
        MenuWrite.model_validate({"categories": menu})


def test_four_locales_required():
    site = json.loads((ROOT / "data" / "site.json").read_text(encoding="utf-8"))
    del site["slogan"]["ru"]
    with pytest.raises(ValidationError):
        SiteWrite.model_validate(site)


def test_contact_honeypot_and_text_limits():
    payload = ContactCreate.model_validate({
        "name": "Test User", "email": "test@example.com", "subject": "Question",
        "message": "A valid inquiry about the restaurant.", "website": "",
    })
    assert payload.website == ""
    with pytest.raises(ValidationError):
        ContactCreate.model_validate({**payload.model_dump(), "message": "short"})
