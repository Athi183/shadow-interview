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
    ai_provider: str = os.getenv("AI_PROVIDER", "auto").lower()
    enable_mock_fallback: bool = os.getenv("ENABLE_MOCK_FALLBACK", "true").lower() in {"1", "true", "yes", "on"}
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-5.6")
    groq_api_key: str | None = os.getenv("GROQ_API_KEY")
    groq_model: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    groq_transcription_model: str = os.getenv("GROQ_TRANSCRIPTION_MODEL", "whisper-large-v3-turbo")
    groq_base_url: str = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
    frontend_origins: str = os.getenv("FRONTEND_ORIGINS", "")

    @property
    def cors_origins(self) -> list[str]:
        configured_origins = [
            origin.strip()
            for origin in self.frontend_origins.split(",")
            if origin.strip()
        ]
        return [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://leetcode.com",
            *configured_origins,
        ]


settings = Settings()
