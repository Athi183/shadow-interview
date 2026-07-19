"""HTTP schemas for interview session endpoints."""

from datetime import datetime

from pydantic import BaseModel, Field

from app.models.interview_session import InterviewStage, InterviewStatus


class CreateInterviewSessionRequest(BaseModel):
    problem_title: str = Field(min_length=1)
    difficulty: str = Field(min_length=1)
    problem_url: str = Field(min_length=1)
    language: str = "JavaScript"


class InterviewSessionResponse(BaseModel):
    session_id: str
    problem_title: str
    difficulty: str
    problem_url: str
    language: str
    started_at: datetime
    elapsed_time: int
    current_stage: InterviewStage
    conversation_history: list[dict[str, str]]
    code_snapshots: list[dict[str, str]]
    transcript_history: list[dict[str, str]]
    candidate_notes: list[str]
    status: InterviewStatus
    final_evaluation: dict[str, str] | None
