"""HTTP endpoints for the Shadow Interview engine."""

from fastapi import APIRouter, HTTPException, status

from app.schemas.interview import (
    EndSessionRequest,
    InterviewEventRequest,
    InterviewEventResponse,
    MessageRequest,
    MessageResponse,
    SessionSummaryResponse,
    StartSessionRequest,
    StartSessionResponse,
    UpdateSessionRequest,
    UpdateSessionResponse,
)
from app.models.interview_event import InterviewEvent, InterviewEventType
from app.services.gpt_service import GPTServiceError, MissingOpenAIKeyError
from app.services.event_engine import event_engine
from app.services.session_manager import session_manager
from app.utils.session_mapper import recent_events_to_dicts, session_to_summary, timeline_to_dicts

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
    event_engine.receive(
        session,
        InterviewEvent(
            event_type=InterviewEventType.INTERVIEW_STARTED,
            session_id=session.session_id,
            payload={"summary": f"Started {payload.problem_title} in {payload.language}."},
        ),
    )
    event_engine.receive(
        session,
        InterviewEvent(
            event_type=InterviewEventType.PROBLEM_LOADED,
            session_id=session.session_id,
            payload={"summary": f"Loaded {payload.problem_title} from LeetCode."},
        ),
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
    event_payload = {
        "message": payload.candidate_message.strip(),
        "summary": payload.candidate_message.strip(),
    }
    if payload.current_code is not None:
        event_payload["current_code"] = payload.current_code

    try:
        result = event_engine.receive(
            session,
            InterviewEvent(
                event_type=InterviewEventType.CANDIDATE_MESSAGE,
                session_id=session.session_id,
                payload=event_payload,
            ),
        )
    except MissingOpenAIKeyError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except GPTServiceError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    return MessageResponse(
        session_id=session.session_id,
        interview_stage=session.interview_stage,
        ai_response=str(result["ai_response"]),
        observations=result["observations"],
        recent_events=recent_events_to_dicts(session),
        timeline=timeline_to_dicts(session),
    )


@router.post("/update", response_model=UpdateSessionResponse)
def update_session(payload: UpdateSessionRequest) -> UpdateSessionResponse:
    session = _get_session_or_404(payload.session_id)
    if payload.current_code is not None:
        event_engine.receive(
            session,
            InterviewEvent(
                event_type=InterviewEventType.CODE_CHANGED,
                session_id=session.session_id,
                payload={"current_code": payload.current_code, "summary": "Candidate code changed."},
            ),
        )
    if payload.transcript is not None:
        event_engine.receive(
            session,
            InterviewEvent(
                event_type=InterviewEventType.TRANSCRIPT_UPDATED,
                session_id=session.session_id,
                payload={"transcript": payload.transcript, "summary": "Candidate transcript updated."},
            ),
        )
    if payload.stage is not None or payload.candidate_notes:
        session_manager.update_session(session=session, stage=payload.stage, candidate_notes=payload.candidate_notes)
    return UpdateSessionResponse(
        session_id=session.session_id,
        interview_stage=session.interview_stage,
        status=session.status,
        recent_events=recent_events_to_dicts(session),
        timeline=timeline_to_dicts(session),
    )


@router.post("/event", response_model=InterviewEventResponse)
def receive_event(payload: InterviewEventRequest) -> InterviewEventResponse:
    session = _get_session_or_404(payload.session_id)
    if payload.event_type == InterviewEventType.CANDIDATE_MESSAGE and not payload.payload.get("message", "").strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Candidate message cannot be empty.")

    event = InterviewEvent(
        event_type=payload.event_type,
        session_id=session.session_id,
        payload=payload.payload,
    )
    try:
        event_engine.receive(session, event)
    except MissingOpenAIKeyError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except GPTServiceError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    return InterviewEventResponse(
        session_id=session.session_id,
        interview_stage=session.interview_stage,
        event_type=event.event_type,
        recent_events=recent_events_to_dicts(session),
        timeline=timeline_to_dicts(session),
    )


@router.post("/end", response_model=SessionSummaryResponse)
def end_session(payload: EndSessionRequest) -> SessionSummaryResponse:
    session = _get_session_or_404(payload.session_id)
    event_engine.receive(
        session,
        InterviewEvent(
            event_type=InterviewEventType.INTERVIEW_COMPLETED,
            session_id=session.session_id,
            payload={"summary": "Interview session ended."},
        ),
    )
    ended_session = session
    return SessionSummaryResponse(**session_to_summary(ended_session))
