"""Finite-state workflow for interview stage transitions."""

from app.models.interview_event import InterviewEvent, InterviewEventType
from app.models.interview_session import InterviewSession, InterviewStage


class InterviewStateMachine:
    def next_stage(
        self,
        session: InterviewSession,
        event: InterviewEvent,
        observations: dict[str, bool | str] | None = None,
    ) -> InterviewStage:
        observations = observations or {}

        if event.event_type == InterviewEventType.INTERVIEW_STARTED:
            return InterviewStage.INTRODUCTION
        if event.event_type == InterviewEventType.PROBLEM_LOADED:
            return InterviewStage.PROBLEM_UNDERSTANDING
        if event.event_type == InterviewEventType.CODE_CHANGED:
            return InterviewStage.IMPLEMENTATION
        if event.event_type == InterviewEventType.OPTIMIZATION_DETECTED or observations.get("optimization_attempt"):
            return InterviewStage.OPTIMIZATION
        if event.event_type == InterviewEventType.EDGE_CASE_DISCUSSED or observations.get("edge_case_discussion"):
            return InterviewStage.EDGE_CASES
        if observations.get("complexity_discussion"):
            return InterviewStage.COMPLEXITY_ANALYSIS
        if event.event_type == InterviewEventType.INTERVIEW_COMPLETED:
            return InterviewStage.WRAP_UP

        if session.interview_stage == InterviewStage.INTRODUCTION:
            return InterviewStage.PROBLEM_UNDERSTANDING
        if observations.get("candidate_changed_strategy"):
            return InterviewStage.INITIAL_APPROACH
        if observations.get("implementation_detail"):
            return InterviewStage.IMPLEMENTATION

        return session.interview_stage


interview_state_machine = InterviewStateMachine()
