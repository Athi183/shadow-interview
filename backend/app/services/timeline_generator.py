"""Records human-readable events for each interview session."""

from datetime import datetime, timezone

from app.models.interview_session import InterviewSession, TimelineEvent
from app.models.interview_event import InterviewEvent, InterviewEventType


class TimelineGenerator:
    def record(self, session: InterviewSession, label: str, detail: str) -> TimelineEvent:
        elapsed_seconds = max(int((datetime.now(timezone.utc) - session.started_at).total_seconds()), 0)
        session.elapsed_time = elapsed_seconds
        event = TimelineEvent(
            timestamp=self._format_timestamp(elapsed_seconds),
            label=label,
            detail=detail,
        )
        session.timeline.append(event)
        return event

    def record_event(self, session: InterviewSession, event: InterviewEvent) -> TimelineEvent:
        label = self._event_label(event.event_type)
        detail = event.payload.get("summary") or event.payload.get("message") or event.payload.get("detail") or label
        return self.record(session, label, detail)

    def _format_timestamp(self, elapsed_seconds: int) -> str:
        minutes, seconds = divmod(elapsed_seconds, 60)
        return f"{minutes:02d}:{seconds:02d}"

    def _event_label(self, event_type: InterviewEventType) -> str:
        labels = {
            InterviewEventType.INTERVIEW_STARTED: "Interview Started",
            InterviewEventType.PROBLEM_LOADED: "Problem Loaded",
            InterviewEventType.CANDIDATE_MESSAGE: "Candidate Message",
            InterviewEventType.CODE_CHANGED: "Code Changed",
            InterviewEventType.TRANSCRIPT_UPDATED: "Transcript Updated",
            InterviewEventType.OPTIMIZATION_DETECTED: "Candidate Optimized Solution",
            InterviewEventType.EDGE_CASE_DISCUSSED: "Candidate Discussed Edge Cases",
            InterviewEventType.AI_RESPONSE: "AI Response",
            InterviewEventType.INTERVIEW_COMPLETED: "Interview Completed",
        }
        return labels[event_type]


timeline_generator = TimelineGenerator()
