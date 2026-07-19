"""Pydantic schemas for the interview engine API."""

from datetime import datetime

from pydantic import BaseModel, Field

from app.models.interview_event import InterviewEventType
from app.models.interview_session import InterviewStage, InterviewStatus


class StartSessionRequest(BaseModel):
    problem_title: str = Field(min_length=1)
    difficulty: str = Field(min_length=1)
    problem_url: str = Field(min_length=1)
    language: str = "JavaScript"


class StartSessionResponse(BaseModel):
    session_id: str
    interview_stage: InterviewStage
    status: InterviewStatus
    message: str


class MessageRequest(BaseModel):
    session_id: str = Field(min_length=1)
    candidate_message: str = Field(min_length=1)
    current_code: str | None = None


class MessageResponse(BaseModel):
    session_id: str
    interview_stage: InterviewStage
    ai_response: str
    observations: dict[str, bool | str]
    context: dict
    recent_events: list[dict[str, str]]
    timeline: list[dict[str, str]]


class UpdateSessionRequest(BaseModel):
    session_id: str = Field(min_length=1)
    current_code: str | None = None
    transcript: str | None = None
    stage: InterviewStage | None = None
    candidate_notes: str | None = None


class UpdateSessionResponse(BaseModel):
    session_id: str
    interview_stage: InterviewStage
    status: InterviewStatus
    recent_events: list[dict[str, str]]
    timeline: list[dict[str, str]]


class InterviewEventRequest(BaseModel):
    session_id: str = Field(min_length=1)
    event_type: InterviewEventType
    payload: dict[str, str] = Field(default_factory=dict)


class InterviewEventResponse(BaseModel):
    session_id: str
    interview_stage: InterviewStage
    event_type: InterviewEventType
    context: dict | None = None
    recent_events: list[dict[str, str]]
    timeline: list[dict[str, str]]


class EndSessionRequest(BaseModel):
    session_id: str = Field(min_length=1)


class ExportReportRequest(BaseModel):
    session_id: str = Field(min_length=1)
    format: str = "markdown"


class ConversationMessageResponse(BaseModel):
    role: str
    content: str
    stage: InterviewStage
    created_at: datetime


class SessionSummaryResponse(BaseModel):
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
    conversation_history: list[ConversationMessageResponse]
    code_snapshots: list[dict[str, str]]
    transcript_history: list[dict[str, str]]
    candidate_notes: list[str]
    recent_events: list[dict[str, str]]
    timeline: list[dict[str, str]]
    status: InterviewStatus
    final_evaluation: dict | None = None


class InterviewReportResponse(BaseModel):
    session_id: str
    report: dict


class ExportReportResponse(BaseModel):
    session_id: str
    format: str
    content: str
