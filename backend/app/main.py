"""FastAPI entrypoint for the Shadow Interview backend."""

from fastapi import FastAPI

from app.core.config import settings
from app.routers.sessions import router as sessions_router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Interview Engine for Shadow Interview. GPT calls are isolated inside GPTService.",
)

app.include_router(sessions_router)


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}
