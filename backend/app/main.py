"""FastAPI entrypoint for the future Shadow Interview engine."""

from fastapi import FastAPI

from app.core.config import settings
from app.routers.sessions import router as sessions_router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Interview session architecture scaffold. GPT integration is intentionally disabled.",
)

app.include_router(sessions_router)


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    """Expose a tiny health endpoint for local backend checks."""
    return {"status": "ok", "service": settings.app_name}
