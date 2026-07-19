"""Domain model for an in-memory Shadow Interview session."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import StrEnum
from uuid import uuid4

from app.models.interview_event import InterviewEvent


class InterviewStage(StrEnum):
    INTRODUCTION = "INTRODUCTION"
    PROBLEM_UNDERSTANDING = "PROBLEM_UNDERSTANDING"
    INITIAL_APPROACH = "INITIAL_APPROACH"
    IMPLEMENTATION = "IMPLEMENTATION"
    OPTIMIZATION = "OPTIMIZATION"
    EDGE_CASES = "EDGE_CASES"
    COMPLEXITY_ANALYSIS = "COMPLEXITY_ANALYSIS"
    WRAP_UP = "WRAP_UP"


class InterviewStatus(StrEnum):
    ACTIVE = "ACTIVE"
    ENDED = "ENDED"


@dataclass
class TimelineEvent:
    timestamp: str
    label: str
    detail: str


@dataclass
class ConversationMessage:
    role: str
    content: str
    stage: InterviewStage
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class InterviewSession:
    session_id: str
    problem_title: str
    difficulty: str
    problem_url: str
    language: str
    started_at: datetime
    created_at: datetime
    elapsed_time: int
    current_stage: InterviewStage
    interview_stage: InterviewStage
    current_code: str
    transcript: str
    conversation_history: list[ConversationMessage]
    code_snapshots: list[dict[str, str]]
    transcript_history: list[dict[str, str]]
    candidate_notes: list[str]
    events: list[InterviewEvent]
    timeline: list[TimelineEvent]
    status: InterviewStatus
    final_evaluation: dict | None

    @classmethod
    def create(cls, problem_title: str, difficulty: str, problem_url: str, language: str) -> "InterviewSession":
        created_at = datetime.now(timezone.utc)
        return cls(
            session_id=str(uuid4()),
            problem_title=problem_title,
            difficulty=difficulty,
            problem_url=problem_url,
            language=language,
            started_at=created_at,
            created_at=created_at,
            elapsed_time=0,
            current_stage=InterviewStage.INTRODUCTION,
            interview_stage=InterviewStage.INTRODUCTION,
            current_code="",
            transcript="",
            conversation_history=[],
            code_snapshots=[],
            transcript_history=[],
            candidate_notes=[],
            events=[],
            timeline=[],
            status=InterviewStatus.ACTIVE,
            final_evaluation=None,
        )

    def sync_stage(self, stage: InterviewStage) -> None:
        self.current_stage = stage
        self.interview_stage = stage
