"""Pydantic schemas for speech transcription API responses."""

from pydantic import BaseModel


class TranscriptionResponse(BaseModel):
    transcript: str
    provider: str
    model: str
