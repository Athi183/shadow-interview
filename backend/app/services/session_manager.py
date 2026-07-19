"""In-memory lifecycle manager for interview sessions."""

from app.models.interview_session import InterviewSession, InterviewStatus


class SessionManager:
    def __init__(self) -> None:
        self._sessions: dict[str, InterviewSession] = {}

    def create_session(self, problem_title: str, difficulty: str, problem_url: str, language: str) -> InterviewSession:
        session = InterviewSession.create(
            problem_title=problem_title,
            difficulty=difficulty,
            problem_url=problem_url,
            language=language,
        )
        session.status = InterviewStatus.ACTIVE
        self._sessions[session.session_id] = session
        return session

    def get_session(self, session_id: str) -> InterviewSession | None:
        return self._sessions.get(session_id)


session_manager = SessionManager()
