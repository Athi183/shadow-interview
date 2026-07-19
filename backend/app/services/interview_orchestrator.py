"""Coordinates event interpretation, stage transitions, prompts, and AI responses."""

from app.models.interview_event import InterviewEvent, InterviewEventType
from app.models.interview_session import InterviewSession
from app.prompts.interviewer import build_interviewer_prompt
from app.services.gpt_service import GPTService
from app.services.interview_state_machine import InterviewStateMachine
from app.services.reasoning_analyzer import ReasoningAnalyzer
from app.services.session_manager import SessionManager
from app.services.timeline_generator import TimelineGenerator
from app.utils.session_mapper import recent_events_to_dicts, timeline_to_dicts


class InterviewOrchestrator:
    def __init__(
        self,
        session_manager: SessionManager,
        timeline_generator: TimelineGenerator,
        gpt_service: GPTService,
        reasoning_analyzer: ReasoningAnalyzer,
        state_machine: InterviewStateMachine,
    ) -> None:
        self._session_manager = session_manager
        self._timeline_generator = timeline_generator
        self._gpt_service = gpt_service
        self._reasoning_analyzer = reasoning_analyzer
        self._state_machine = state_machine

    def handle_event(self, session: InterviewSession, event: InterviewEvent) -> dict[str, object]:
        observations = self._analyze_event(session, event)
        next_stage = self._state_machine.next_stage(session, event, observations)
        if next_stage != session.interview_stage:
            self._session_manager.update_session(session, stage=next_stage)
            self._timeline_generator.record(session, "Stage Transition", f"Moved to {next_stage.value}.")

        if event.event_type != InterviewEventType.CANDIDATE_MESSAGE:
            return {"ai_response": "", "observations": observations}

        candidate_message = event.payload.get("message", "")
        self._session_manager.add_message(session, "candidate", candidate_message)

        prompt = self.decide_prompt(session, observations)
        ai_response = self._gpt_service.generate_response(
            instructions=prompt,
            user_input=self._build_user_input(session, event, observations),
        )

        self._session_manager.add_message(session, "interviewer", ai_response)
        ai_event = InterviewEvent(
            event_type=InterviewEventType.AI_RESPONSE,
            session_id=session.session_id,
            payload={"summary": self._truncate(ai_response), "message": ai_response},
        )
        session.events.append(ai_event)
        self._timeline_generator.record_event(session, ai_event)

        return {"ai_response": ai_response, "observations": observations}

    def decide_prompt(self, session: InterviewSession, observations: dict[str, bool | str]) -> str:
        return build_interviewer_prompt(
            problem_title=session.problem_title,
            difficulty=session.difficulty,
            language=session.language,
            stage=session.interview_stage.value,
            observations=observations.get("summary", ""),
        )

    def _analyze_event(self, session: InterviewSession, event: InterviewEvent) -> dict[str, bool | str]:
        if event.event_type != InterviewEventType.CANDIDATE_MESSAGE:
            return {"summary": f"{event.event_type.value} received"}
        return self._reasoning_analyzer.analyze(
            candidate_message=event.payload.get("message", ""),
            current_code=event.payload.get("current_code", session.current_code),
            conversation_history=session.conversation_history,
        )

    def _build_user_input(
        self,
        session: InterviewSession,
        event: InterviewEvent,
        observations: dict[str, bool | str],
    ) -> str:
        recent_messages = session.conversation_history[-6:]
        conversation = "\n".join(f"{item.role}: {item.content}" for item in recent_messages) or "(no prior messages)"
        recent_events = recent_events_to_dicts(session)
        timeline = timeline_to_dicts(session)

        return "\n".join(
            [
                f"Current stage: {session.interview_stage.value}",
                f"Recent events: {recent_events}",
                f"Timeline: {timeline[-8:]}",
                f"Reasoning observations: {observations}",
                f"Conversation history:\n{conversation}",
                f"Candidate explanation:\n{event.payload.get('message', '')}",
                f"Current code:\n{event.payload.get('current_code', session.current_code) or '(no code yet)'}",
            ]
        )

    def _truncate(self, text: str, limit: int = 90) -> str:
        if len(text) <= limit:
            return text
        return f"{text[: limit - 3]}..."


from app.services.gpt_service import gpt_service
from app.services.interview_state_machine import interview_state_machine
from app.services.reasoning_analyzer import reasoning_analyzer
from app.services.session_manager import session_manager
from app.services.timeline_generator import timeline_generator

interview_orchestrator = InterviewOrchestrator(
    session_manager=session_manager,
    timeline_generator=timeline_generator,
    gpt_service=gpt_service,
    reasoning_analyzer=reasoning_analyzer,
    state_machine=interview_state_machine,
)
