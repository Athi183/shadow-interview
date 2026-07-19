"""Records human-readable events for each interview session."""

from datetime import datetime, timezone

from app.models.interview_session import InterviewSession, TimelineEvent


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

    def _format_timestamp(self, elapsed_seconds: int) -> str:
        minutes, seconds = divmod(elapsed_seconds, 60)
        return f"{minutes:02d}:{seconds:02d}"


timeline_generator = TimelineGenerator()
