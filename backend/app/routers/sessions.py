"""HTTP endpoints for the Shadow Interview engine."""

from fastapi import APIRouter, HTTPException, status

from app.schemas.interview import (
    EndSessionRequest,
    MessageRequest,
    MessageResponse,
    SessionSummaryResponse,
    StartSessionRequest,
    StartSessionResponse,
    UpdateSessionRequest,
    UpdateSessionResponse,
)
from app.services.gpt_service import GPTServiceError, MissingOpenAIKeyError
from app.services.interview_orchestrator import interview_orchestrator
from app.services.session_manager import session_manager
from app.utils.session_mapper import session_to_summary, timeline_to_dicts

router = APIRouter(prefix="/session", tags=["session"])


def _get_session_or_404(session_id: str):
    session = session_manager.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid interview session.")
    return session


@router.post("/start", response_model=StartSessionResponse, status_code=status.HTTP_201_CREATED)
def start_session(payload: StartSessionRequest) -> StartSessionResponse:
    session = session_manager.create_session(
        problem_title=payload.problem_title,
        difficulty=payload.difficulty,
        problem_url=payload.problem_url,
        language=payload.language,
    )
    return StartSessionResponse(
        session_id=session.session_id,
        interview_stage=session.interview_stage,
        status=session.status,
        message="Interview session created.",
    )


@router.post("/message", response_model=MessageResponse)
def send_message(payload: MessageRequest) -> MessageResponse:
    if not payload.candidate_message.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Candidate message cannot be empty.")

    session = _get_session_or_404(payload.session_id)

    try:
        ai_response = interview_orchestrator.handle_candidate_message(
            session=session,
            candidate_message=payload.candidate_message.strip(),
            current_code=payload.current_code,
        )
    except MissingOpenAIKeyError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except GPTServiceError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    return MessageResponse(
        session_id=session.session_id,
        interview_stage=session.interview_stage,
        ai_response=ai_response,
        timeline=timeline_to_dicts(session),
    )


@router.post("/update", response_model=UpdateSessionResponse)
def update_session(payload: UpdateSessionRequest) -> UpdateSessionResponse:
    session = _get_session_or_404(payload.session_id)
    session_manager.update_session(
        session=session,
        current_code=payload.current_code,
        transcript=payload.transcript,
        stage=payload.stage,
        candidate_notes=payload.candidate_notes,
    )
    return UpdateSessionResponse(
        session_id=session.session_id,
        interview_stage=session.interview_stage,
        status=session.status,
        timeline=timeline_to_dicts(session),
    )


@router.post("/end", response_model=SessionSummaryResponse)
def end_session(payload: EndSessionRequest) -> SessionSummaryResponse:
    session = _get_session_or_404(payload.session_id)
    ended_session = session_manager.end_session(session)
    return SessionSummaryResponse(**session_to_summary(ended_session))
