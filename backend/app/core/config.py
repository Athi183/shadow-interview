"""Central backend configuration loaded from environment variables.

This module is the single place where the backend reads runtime settings.
It loads values from ``backend/.env`` during local development while still
allowing real environment variables to override those values in production.
"""

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


BACKEND_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_ROOT / ".env")


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("APP_NAME", "Shadow Interview API")
    app_version: str = os.getenv("APP_VERSION", "0.1.0")
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-5.6")


settings = Settings()
