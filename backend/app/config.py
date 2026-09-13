"""Application configuration (env-driven, 12-factor)."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "AyurSage API"
    environment: str = "development"

    # Postgres + pgvector
    database_url: str = "postgresql+psycopg://ayursage:ayursage@db:5432/ayursage"

    # Auth
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Optional LLM provider for the assistant's natural-language layer.
    # If unset, the backend falls back to a deterministic, template-based
    # explanation composed from retrieved knowledge-base chunks.
    llm_api_key: str | None = None
    llm_model: str = "gpt-4o-mini"

    # Embedding dimensionality for pgvector columns.
    embedding_dim: int = 256

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
