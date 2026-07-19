"""Coordinates event interpretation, context building, and AI responses."""

import json

from app.models.interview_event import InterviewEvent, InterviewEventType
from app.models.interview_session import InterviewSession
from app.prompts.interviewer import build_interviewer_prompt
from app.services.context_builder import ContextBuilder
from app.services.gpt_service import GPTService
from app.services.interview_state_machine import InterviewStateMachine
from app.services.reasoning_analyzer import ReasoningAnalyzer
from app.services.session_manager import SessionManager
from app.services.timeline_generator import TimelineGenerator


class InterviewOrchestrator:
    def __init__(
        self,
        session_manager: SessionManager,
        timeline_generator: TimelineGenerator,
        gpt_service: GPTService,
        reasoning_analyzer: ReasoningAnalyzer,
        state_machine: InterviewStateMachine,
        context_builder: ContextBuilder,
    ) -> None:
        self._session_manager = session_manager
        self._timeline_generator = timeline_generator
        self._gpt_service = gpt_service
        self._reasoning_analyzer = reasoning_analyzer
        self._state_machine = state_machine
        self._context_builder = context_builder

    def handle_event(self, session: InterviewSession, event: InterviewEvent) -> dict[str, object]:
        observations = self._analyze_event(session, event)
        next_stage = self._state_machine.next_stage(session, event, observations)
        if next_stage != session.interview_stage:
            self._session_manager.update_session(session, stage=next_stage)
            self._timeline_generator.record(session, "Stage Transition", f"Moved to {next_stage.value}.")

        if event.event_type != InterviewEventType.CANDIDATE_MESSAGE:
            return {"ai_response": "", "observations": observations, "context": self._context_builder.build(session, observations)}

        candidate_message = event.payload.get("message", "")
        self._session_manager.add_message(session, "candidate", candidate_message)

        context = self._context_builder.build(session, observations)
        ai_response = self._gpt_service.generate_response(
            instructions=build_interviewer_prompt(),
            user_input=json.dumps(context, default=str),
        )

        self._session_manager.add_message(session, "interviewer", ai_response)
        ai_event = InterviewEvent(
            event_type=InterviewEventType.AI_RESPONSE,
            session_id=session.session_id,
            payload={"summary": self._truncate(ai_response), "message": ai_response},
        )
        session.events.append(ai_event)
        self._timeline_generator.record_event(session, ai_event)

        return {"ai_response": ai_response, "observations": observations, "context": context}

    def _analyze_event(self, session: InterviewSession, event: InterviewEvent) -> dict[str, bool | str]:
        if event.event_type not in (InterviewEventType.CANDIDATE_MESSAGE, InterviewEventType.TRANSCRIPT_UPDATED, InterviewEventType.CODE_CHANGED):
            return {"summary": f"{event.event_type.value} received"}

        return self._reasoning_analyzer.analyze(
            candidate_message=event.payload.get("message", ""),
            current_code=event.payload.get("current_code", session.current_code),
            conversation_history=session.conversation_history,
            transcript=event.payload.get("transcript", session.transcript),
        )

    def _truncate(self, text: str, limit: int = 90) -> str:
        if len(text) <= limit:
            return text
        return f"{text[: limit - 3]}..."


from app.services.context_builder import context_builder
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
    context_builder=context_builder,
)
