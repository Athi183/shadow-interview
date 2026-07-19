"""FastAPI entrypoint for the Shadow Interview backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.sessions import router as sessions_router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Interview Engine for Shadow Interview. GPT calls are isolated inside GPTService.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://leetcode.com",
    ],
    allow_origin_regex=r"chrome-extension://.*",
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions_router)


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}
