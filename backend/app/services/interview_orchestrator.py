"""Coordinates session progression without calling GPT in this milestone."""

from app.models.interview_session import InterviewSession, InterviewStage


class InterviewOrchestrator:
    def set_stage(self, session: InterviewSession, stage: InterviewStage) -> InterviewSession:
        session.current_stage = stage
        return session


interview_orchestrator = InterviewOrchestrator()
