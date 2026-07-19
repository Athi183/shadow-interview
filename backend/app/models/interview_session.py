"""Domain model for an in-memory interview session."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import StrEnum
from uuid import uuid4


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
    READY = "READY"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"


@dataclass
class InterviewSession:
    session_id: str
    problem_title: str
    difficulty: str
    problem_url: str
    language: str = "JavaScript"
    started_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    elapsed_time: int = 0
    current_stage: InterviewStage = InterviewStage.INTRODUCTION
    conversation_history: list[dict[str, str]] = field(default_factory=list)
    code_snapshots: list[dict[str, str]] = field(default_factory=list)
    transcript_history: list[dict[str, str]] = field(default_factory=list)
    candidate_notes: list[str] = field(default_factory=list)
    status: InterviewStatus = InterviewStatus.READY
    final_evaluation: dict[str, str] | None = None

    @classmethod
    def create(cls, problem_title: str, difficulty: str, problem_url: str, language: str = "JavaScript") -> "InterviewSession":
        return cls(
            session_id=str(uuid4()),
            problem_title=problem_title,
            difficulty=difficulty,
            problem_url=problem_url,
            language=language,
        )
