"""Coordinates stage selection, prompt construction, and AI responses."""

from app.models.interview_session import InterviewSession, InterviewStage
from app.prompts.interviewer import build_interviewer_prompt
from app.services.gpt_service import GPTService
from app.services.session_manager import SessionManager
from app.services.timeline_generator import TimelineGenerator


class InterviewOrchestrator:
    def __init__(
        self,
        session_manager: SessionManager,
        timeline_generator: TimelineGenerator,
        gpt_service: GPTService,
    ) -> None:
        self._session_manager = session_manager
        self._timeline_generator = timeline_generator
        self._gpt_service = gpt_service

    def handle_candidate_message(
        self,
        session: InterviewSession,
        candidate_message: str,
        current_code: str | None = None,
    ) -> str:
        if current_code is not None:
            self._session_manager.update_session(session, current_code=current_code)

        next_stage = self.decide_stage(session, candidate_message)
        if next_stage != session.interview_stage:
            self._session_manager.update_session(session, stage=next_stage)

        self._session_manager.add_message(session, "candidate", candidate_message)
        self._timeline_generator.record(session, "Candidate Message Received", self._summarize_candidate_message(candidate_message))

        prompt = self.decide_prompt(session)
        ai_response = self._gpt_service.generate_response(
            instructions=prompt,
            user_input=self._build_user_input(session, candidate_message),
        )

        self._session_manager.add_message(session, "interviewer", ai_response)
        self._timeline_generator.record(session, "AI Interviewer Responded", self._summarize_ai_response(ai_response))
        return ai_response

    def decide_stage(self, session: InterviewSession, candidate_message: str) -> InterviewStage:
        normalized = candidate_message.lower()
        if session.interview_stage == InterviewStage.INTRODUCTION:
            return InterviewStage.PROBLEM_UNDERSTANDING
        if any(word in normalized for word in ("brute", "approach", "idea", "plan")):
            return InterviewStage.INITIAL_APPROACH
        if any(word in normalized for word in ("code", "implement", "loop", "map", "function")):
            return InterviewStage.IMPLEMENTATION
        if any(word in normalized for word in ("optimize", "better", "trade-off")):
            return InterviewStage.OPTIMIZATION
        if any(word in normalized for word in ("edge", "empty", "duplicate", "negative")):
            return InterviewStage.EDGE_CASES
        if any(word in normalized for word in ("complexity", "time", "space", "big o")):
            return InterviewStage.COMPLEXITY
        return session.interview_stage

    def decide_prompt(self, session: InterviewSession) -> str:
        return build_interviewer_prompt(
            problem_title=session.problem_title,
            difficulty=session.difficulty,
            language=session.language,
            stage=session.interview_stage.value,
        )

    def _build_user_input(self, session: InterviewSession, candidate_message: str) -> str:
        return "\n".join(
            [
                f"Problem: {session.problem_title}",
                f"Difficulty: {session.difficulty}",
                f"Language: {session.language}",
                f"Current stage: {session.interview_stage.value}",
                f"Current code:\n{session.current_code or '(no code yet)'}",
                f"Candidate message:\n{candidate_message}",
            ]
        )

    def _summarize_candidate_message(self, candidate_message: str) -> str:
        if len(candidate_message) <= 90:
            return candidate_message
        return f"{candidate_message[:87]}..."

    def _summarize_ai_response(self, ai_response: str) -> str:
        if len(ai_response) <= 90:
            return ai_response
        return f"{ai_response[:87]}..."


from app.services.gpt_service import gpt_service
from app.services.session_manager import session_manager
from app.services.timeline_generator import timeline_generator

interview_orchestrator = InterviewOrchestrator(session_manager, timeline_generator, gpt_service)
