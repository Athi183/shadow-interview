"""Mapping helpers between domain sessions and HTTP schemas."""

from app.models.interview_session import InterviewSession
from app.schemas.interview import InterviewSessionResponse


def to_session_response(session: InterviewSession) -> InterviewSessionResponse:
    return InterviewSessionResponse(**session.__dict__)
