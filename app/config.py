"""
AI Store Builder — Application Configuration
Uses pydantic-settings for type-safe env var loading.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ──
    APP_NAME: str = "AI-Store-Builder"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # ── API ──
    API_V1_PREFIX: str = "/api/v1"

    # ── Database ──
    DATABASE_URL: str = "sqlite+aiosqlite:///./ai_store_builder.db"

    # ── Redis ──
    REDIS_URL: str = "redis://redis:6379/0"

    # ── JWT ──
    JWT_SECRET_KEY: str = "CHANGE-ME-generate-a-real-secret-with-openssl-rand-hex-64"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Security ──
    MAX_STORES_FREE: int = 3
    MAX_STORES_PRO: int = 20
    MAX_STORES_ENTERPRISE: int = 1000

    # ── CORS ──
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://ai-store-builder.pages.dev",
        "https://*.ai-store-builder.pages.dev",
    ]

    # ── AI (Phase 2) ──
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""

    # ── Payment (Phase 3) ──
    MOYASAR_API_KEY: str = ""
    TAP_SECRET_KEY: str = ""

    # ── Cloudflare R2 Storage ──
    CLOUDFLARE_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "store-images"
    R2_PUBLIC_URL: str = ""

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
