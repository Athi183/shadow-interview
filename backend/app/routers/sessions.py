"""Session routes for the future interview engine."""

from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.schemas.interview import CreateInterviewSessionRequest, InterviewSessionResponse
from app.services.session_manager import session_manager
from app.utils.session_mapper import to_session_response

router = APIRouter(prefix=f"{settings.api_prefix}/sessions", tags=["sessions"])


@router.post("", response_model=InterviewSessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(payload: CreateInterviewSessionRequest) -> InterviewSessionResponse:
    session = session_manager.create_session(
        problem_title=payload.problem_title,
        difficulty=payload.difficulty,
        problem_url=payload.problem_url,
        language=payload.language,
    )
    return to_session_response(session)


@router.get("/{session_id}", response_model=InterviewSessionResponse)
def get_session(session_id: str) -> InterviewSessionResponse:
    session = session_manager.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")
    return to_session_response(session)
