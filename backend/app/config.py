from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import AnyHttpUrl, EmailStr, Field, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = Field(default="development", pattern="^(development|test|production)$")
    mongodb_uri: SecretStr
    mongodb_database: str = "yummy"
    jwt_secret: SecretStr
    privacy_hash_secret: SecretStr
    admin_bootstrap_email: EmailStr | None = None
    admin_bootstrap_password: SecretStr | None = None
    public_origin: AnyHttpUrl
    admin_origin: AnyHttpUrl
    trusted_proxy_ips: str = ""
    media_root: Path = Path("./data/media")
    media_public_prefix: str = "/media"
    access_token_minutes: int = Field(default=15, ge=1, le=60)
    refresh_token_days: int = Field(default=14, ge=1, le=90)
    login_window_seconds: int = Field(default=900, ge=60, le=86400)
    login_max_attempts: int = Field(default=5, ge=1, le=30)
    contact_window_seconds: int = Field(default=3600, ge=60, le=86400)
    contact_max_attempts: int = Field(default=5, ge=1, le=30)
    contact_dedupe_seconds: int = Field(default=600, ge=10, le=3600)
    contact_retention_days: int = Field(default=365, ge=1, le=3650)
    media_max_bytes: int = Field(default=8 * 1024 * 1024, ge=1024, le=50 * 1024 * 1024)
    media_max_pixels: int = Field(default=24_000_000, ge=1_000_000, le=100_000_000)
    media_storage_quota_bytes: int = Field(default=512 * 1024 * 1024, ge=1_000_000)
    orphan_grace_hours: int = Field(default=24, ge=1, le=720)

    @field_validator("media_public_prefix")
    @classmethod
    def validate_media_prefix(cls, value: str) -> str:
        if not value.startswith("/") or value.rstrip("/") != value:
            raise ValueError("MEDIA_PUBLIC_PREFIX must start with one slash and not end with one")
        return value

    @property
    def allowed_origins(self) -> tuple[str, ...]:
        return tuple(dict.fromkeys((str(self.public_origin).rstrip("/"), str(self.admin_origin).rstrip("/"))))

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @model_validator(mode="after")
    def validate_production_safety(self) -> "Settings":
        if not self.is_production:
            return self
        secrets = (self.jwt_secret.get_secret_value(), self.privacy_hash_secret.get_secret_value())
        if any(len(value) < 32 or "replace" in value.casefold() for value in secrets):
            raise ValueError("Production secrets must be unique random values of at least 32 characters")
        if secrets[0] == secrets[1]:
            raise ValueError("Production secrets must be different values")
        if self.public_origin.scheme != "https" or self.admin_origin.scheme != "https":
            raise ValueError("Production origins must use HTTPS")
        return self

    @property
    def trusted_proxies(self) -> frozenset[str]:
        return frozenset(part.strip() for part in self.trusted_proxy_ips.split(",") if part.strip())


@lru_cache
def get_settings() -> Settings:
    return Settings()
