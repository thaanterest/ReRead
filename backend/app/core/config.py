"""
ReRead Backend — Core Configuration

Loads all settings from environment variables via Pydantic Settings.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://reread:reread_secret@db:5432/reread_db"

    # JWT
    JWT_SECRET: str = "change-me-to-a-random-secret-key"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""

    # App
    APP_NAME: str = "ReRead API"
    DEBUG: bool = False



settings = Settings()
