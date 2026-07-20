"""HTTP endpoints for high-accuracy speech transcription."""

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.config import settings
from app.schemas.speech import TranscriptionResponse
from app.services.gpt_service import GPTServiceError, MissingOpenAIKeyError, gpt_service

router = APIRouter(prefix="/speech", tags=["speech"])


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_speech(audio: UploadFile = File(...)) -> TranscriptionResponse:
    """Transcribe a candidate audio turn using Groq Whisper."""

    if not audio.content_type or not audio.content_type.startswith("audio/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Upload must be an audio file.")

    content = await audio.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Audio file cannot be empty.")

    try:
        transcript = gpt_service.transcribe_audio(
            filename=audio.filename or "candidate-turn.webm",
            content=content,
            content_type=audio.content_type,
        )
    except MissingOpenAIKeyError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except GPTServiceError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    return TranscriptionResponse(
        transcript=transcript,
        provider="groq",
        model=settings.groq_transcription_model,
    )
