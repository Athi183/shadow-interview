"""In-memory lifecycle manager for interview sessions."""

from app.models.interview_session import ConversationMessage, InterviewSession, InterviewStage, InterviewStatus


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
        self._sessions[session.session_id] = session
        return session

    def get_session(self, session_id: str) -> InterviewSession | None:
        return self._sessions.get(session_id)

    def add_message(self, session: InterviewSession, role: str, content: str) -> ConversationMessage:
        message = ConversationMessage(role=role, content=content, stage=session.interview_stage)
        session.conversation_history.append(message)
        return message

    def update_session(
        self,
        session: InterviewSession,
        current_code: str | None = None,
        transcript: str | None = None,
        stage: InterviewStage | None = None,
        candidate_notes: str | None = None,
    ) -> InterviewSession:
        if current_code is not None:
            session.current_code = current_code
            session.code_snapshots.append({"stage": session.interview_stage, "code": current_code})

        if transcript is not None:
            session.transcript = transcript
            session.transcript_history.append({"stage": session.interview_stage, "transcript": transcript})

        if stage is not None:
            session.sync_stage(stage)

        if candidate_notes:
            session.candidate_notes.append(candidate_notes)

        return session

    def end_session(self, session: InterviewSession) -> InterviewSession:
        session.status = InterviewStatus.ENDED
        session.sync_stage(InterviewStage.WRAP_UP)
        return session


session_manager = SessionManager()
