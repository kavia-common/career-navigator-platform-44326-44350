from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    Environment variables:
    - CORS_ALLOW_ORIGINS: Comma-separated list of allowed origins for CORS
    """

    cors_allow_origins: List[str] = Field(
        default_factory=lambda: ["*"],
        description="List of allowed origins for CORS",
        alias="CORS_ALLOW_ORIGINS",
    )

    class Config:
        env_file = ".env"
        case_sensitive = False


# PUBLIC_INTERFACE
@lru_cache()
def get_settings() -> Settings:
    """Return a cached Settings instance populated from environment variables."""
    return Settings()
