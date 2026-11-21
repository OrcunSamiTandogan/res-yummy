from __future__ import annotations

import re
from typing import Self

from pydantic import BaseModel, ConfigDict, EmailStr, Field, HttpUrl, field_validator, model_validator

ID_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
IMAGE_RE = re.compile(r"^/(?:menu/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:jpg|jpeg|png|webp)|media/[0-9a-f]{32}\.webp)$")
SWATCH_RE = re.compile(r"^#[0-9a-fA-F]{6}$")


class LocalizedText(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    en: str = Field(min_length=1, max_length=400)
    id: str = Field(min_length=1, max_length=400)
    ru: str = Field(min_length=1, max_length=400)
    tr: str = Field(min_length=1, max_length=400)


class AddOn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    label: LocalizedText
    price: int = Field(ge=1000, le=50_000_000)


class MenuItem(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    id: str = Field(min_length=2, max_length=48, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    name: LocalizedText
    description: LocalizedText
    price: int = Field(ge=1000, le=50_000_000)
    images: list[str] = Field(default_factory=list, max_length=4)
    addOn: AddOn | None = None
    swatch: str | None = Field(default=None, pattern=r"^#[0-9a-fA-F]{6}$")

    @field_validator("images")
    @classmethod
    def check_images(cls, images: list[str]) -> list[str]:
        if any(not IMAGE_RE.fullmatch(path) for path in images):
            raise ValueError("Images must be local /menu or /media WebP paths")
        return images


class MenuCategory(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    id: str = Field(min_length=2, max_length=48, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    icon: str = Field(min_length=1, max_length=8)
    name: LocalizedText
    items: list[MenuItem] = Field(min_length=1, max_length=40)


class MenuWrite(BaseModel):
    model_config = ConfigDict(extra="forbid")
    categories: list[MenuCategory] = Field(min_length=1, max_length=12)
    revision: int | None = Field(default=None, ge=0)

    @model_validator(mode="after")
    def unique_ids(self) -> Self:
        category_ids: set[str] = set()
        item_ids: set[str] = set()
        for category in self.categories:
            if category.id in category_ids:
                raise ValueError(f"Duplicate category ID: {category.id}")
            category_ids.add(category.id)
            for item in category.items:
                if item.id in item_ids:
                    raise ValueError(f"Duplicate item ID: {item.id}")
                item_ids.add(item.id)
        return self


class WorkHours(BaseModel):
    model_config = ConfigDict(extra="forbid")
    days: LocalizedText
    hours: str = Field(min_length=3, max_length=40)


class SiteWrite(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    restaurantName: LocalizedText
    brandTagline: LocalizedText
    slogan: LocalizedText
    whatsappNumber: str = Field(pattern=r"^[0-9]{9,15}$")
    phone: str = Field(min_length=5, max_length=40)
    address: LocalizedText
    mapsUrl: HttpUrl
    mapsEmbed: HttpUrl
    workingHours: list[WorkHours] = Field(min_length=1, max_length=14)


class ContactCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    subject: str = Field(min_length=2, max_length=180)
    message: str = Field(min_length=10, max_length=5000)
    website: str = Field(default="", max_length=256)

    @field_validator("name", "subject", "message")
    @classmethod
    def reject_controls(cls, value: str) -> str:
        if any(ord(char) < 32 and char not in "\n\t" for char in value):
            raise ValueError("Control characters are not allowed")
        return value
