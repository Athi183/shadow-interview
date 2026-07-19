"""Event model for event-driven interview orchestration."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import StrEnum
from uuid import uuid4


class InterviewEventType(StrEnum):
    INTERVIEW_STARTED = "INTERVIEW_STARTED"
    PROBLEM_LOADED = "PROBLEM_LOADED"
    CANDIDATE_MESSAGE = "CANDIDATE_MESSAGE"
    CODE_CHANGED = "CODE_CHANGED"
    TRANSCRIPT_UPDATED = "TRANSCRIPT_UPDATED"
    OPTIMIZATION_DETECTED = "OPTIMIZATION_DETECTED"
    EDGE_CASE_DISCUSSED = "EDGE_CASE_DISCUSSED"
    AI_RESPONSE = "AI_RESPONSE"
    INTERVIEW_COMPLETED = "INTERVIEW_COMPLETED"


@dataclass
class InterviewEvent:
    event_type: InterviewEventType
    session_id: str
    payload: dict[str, str] = field(default_factory=dict)
    event_id: str = field(default_factory=lambda: str(uuid4()))
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
