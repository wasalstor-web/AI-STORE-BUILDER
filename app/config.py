"""
AI Store Builder — Application Configuration
Uses pydantic-settings for type-safe env var loading.
"""

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ──
    APP_NAME: str = "WebFlow-Builder"
    APP_VERSION: str = "2.5.0"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # ── API ──
    API_V1_PREFIX: str = "/api/v1"
    HOST: str = "127.0.0.1"
    PORT: int = 8000

    # ── Database ──
    DATABASE_URL: str = "sqlite+aiosqlite:///./ai_store_builder.db"

    # ── Redis (Optional) ──
    REDIS_URL: str = ""

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
        "http://localhost:3003",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://147.93.120.99",
        "http://147.93.120.99:8000",
        "https://ai-store-builder.pages.dev",
    ]
    CORS_ORIGIN_REGEX: str = r"https://.*\.ai-store-builder\.pages\.dev"

    # ── AI (Multi-Provider) ──
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    AI_PRIMARY_PROVIDER: Literal["anthropic", "openai", "google"] = "anthropic"
    CLAUDE_MODEL: str = "claude-sonnet-4-20250514"
    GPT_MODEL: str = "gpt-4o-mini"
    GEMINI_MODEL: str = "gemini-2.0-flash"
    AI_TEMPERATURE: float = 0.7
    AI_MAX_TOKENS: int = 16000
    
    # ── Supabase (Real-time Database) ──
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    
    # ── Real-time Features ──
    ENABLE_WEBSOCKETS: bool = True
    AI_LEARNING_MODE: bool = True
    STORE_AI_CONVERSATIONS: bool = True

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
