"""Builds compact GPT context from the live interview session."""

from app.models.interview_session import InterviewSession
from app.utils.session_mapper import recent_events_to_dicts, timeline_to_dicts


class ContextBuilder:
    def build(self, session: InterviewSession, observations: dict[str, bool | str]) -> dict[str, object]:
        recent_conversation = session.conversation_history[-6:]
        latest_code_snapshot = session.code_snapshots[-1]["code"] if session.code_snapshots else session.current_code
        recent_transcript = session.transcript_history[-1]["transcript"] if session.transcript_history else session.transcript

        return {
            "current_interview_stage": session.interview_stage.value,
            "current_problem": {
                "title": session.problem_title,
                "difficulty": session.difficulty,
                "url": session.problem_url,
                "language": session.language,
            },
            "latest_code_snapshot": latest_code_snapshot or "",
            "recent_candidate_transcript": recent_transcript or "",
            "recent_conversation_history": [
                {
                    "role": message.role,
                    "content": message.content,
                    "stage": message.stage.value,
                }
                for message in recent_conversation
            ],
            "reasoning_analyzer_observations": observations,
            "recent_timeline_events": timeline_to_dicts(session)[-8:],
            "recent_events": recent_events_to_dicts(session),
        }


context_builder = ContextBuilder()
