"""Mapping helpers between internal session models and API payloads."""

from app.models.interview_session import InterviewSession


def timeline_to_dicts(session: InterviewSession) -> list[dict[str, str]]:
    return [event.__dict__ for event in session.timeline]


def session_to_summary(session: InterviewSession) -> dict:
    return {
        "session_id": session.session_id,
        "problem_title": session.problem_title,
        "difficulty": session.difficulty,
        "problem_url": session.problem_url,
        "language": session.language,
        "started_at": session.started_at,
        "created_at": session.created_at,
        "elapsed_time": session.elapsed_time,
        "current_stage": session.current_stage,
        "interview_stage": session.interview_stage,
        "current_code": session.current_code,
        "transcript": session.transcript,
        "conversation_history": [message.__dict__ for message in session.conversation_history],
        "code_snapshots": session.code_snapshots,
        "transcript_history": session.transcript_history,
        "candidate_notes": session.candidate_notes,
        "timeline": timeline_to_dicts(session),
        "status": session.status,
    }
