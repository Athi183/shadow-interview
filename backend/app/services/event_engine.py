"""Event ingestion boundary for live interview orchestration."""

from app.models.interview_event import InterviewEvent, InterviewEventType
from app.models.interview_session import InterviewSession
from app.services.interview_orchestrator import InterviewOrchestrator
from app.services.session_manager import SessionManager
from app.services.timeline_generator import TimelineGenerator


class EventEngine:
    def __init__(
        self,
        session_manager: SessionManager,
        timeline_generator: TimelineGenerator,
        orchestrator: InterviewOrchestrator,
    ) -> None:
        self._session_manager = session_manager
        self._timeline_generator = timeline_generator
        self._orchestrator = orchestrator

    def receive(self, session: InterviewSession, event: InterviewEvent) -> dict[str, object]:
        self._apply_event_payload(session, event)
        session.events.append(event)
        self._timeline_generator.record_event(session, event)
        return self._orchestrator.handle_event(session, event)

    def _apply_event_payload(self, session: InterviewSession, event: InterviewEvent) -> None:
        if event.event_type == InterviewEventType.CODE_CHANGED:
            self._session_manager.update_session(session, current_code=event.payload.get("current_code", ""))
        if event.event_type == InterviewEventType.TRANSCRIPT_UPDATED:
            self._session_manager.update_session(session, transcript=event.payload.get("transcript", ""))
        if event.event_type == InterviewEventType.CANDIDATE_MESSAGE and event.payload.get("current_code") is not None:
            self._session_manager.update_session(session, current_code=event.payload.get("current_code", ""))
        if event.event_type == InterviewEventType.INTERVIEW_COMPLETED:
            self._session_manager.end_session(session)


from app.services.interview_orchestrator import interview_orchestrator
from app.services.session_manager import session_manager
from app.services.timeline_generator import timeline_generator

event_engine = EventEngine(session_manager, timeline_generator, interview_orchestrator)
