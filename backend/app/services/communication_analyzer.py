"""Analyzes candidate communication quality from transcript and conversation."""

from app.models.interview_session import InterviewSession


class CommunicationAnalyzer:
    def analyze(self, session: InterviewSession) -> dict:
        transcript_words = session.transcript.split()
        candidate_messages = [message.content for message in session.conversation_history if message.role == "candidate"]
        total_words = len(transcript_words) + sum(len(message.split()) for message in candidate_messages)
        clarity_score = min(90, 45 + min(total_words, 120) // 3)
        if not candidate_messages and not session.transcript:
            clarity_score = 35

        return {
            "score": clarity_score,
            "signals": [
                "Explained reasoning verbally" if total_words > 20 else "Limited verbal reasoning captured",
                "Used interview-style clarification" if any("clarify" in item.lower() for item in candidate_messages) else "Could clarify assumptions earlier",
            ],
        }


communication_analyzer = CommunicationAnalyzer()
