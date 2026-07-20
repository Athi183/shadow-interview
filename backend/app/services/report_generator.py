"""Generates structured report payloads and export formats."""

from app.models.interview_session import InterviewSession


class ReportGenerator:
    def generate(self, session: InterviewSession, scores: dict[str, int], sections: dict, recommendations: dict, gpt_feedback: str) -> dict:
        overall_score = round(sum(scores.values()) / len(scores))
        readiness = min(100, max(0, round((overall_score * 0.72) + (scores["communication"] * 0.18) + (scores["optimization"] * 0.1))))
        interviewer_questions = [
            message.content
            for message in session.conversation_history
            if message.role == "assistant"
        ]

        return {
            "session_id": session.session_id,
            "problem": {
                "title": session.problem_title,
                "difficulty": session.difficulty,
                "url": session.problem_url,
                "language": session.language,
            },
            "timeline": [event.__dict__ for event in session.timeline],
            "interviewer_questions": interviewer_questions,
            "overall_score": overall_score,
            "interview_readiness": readiness,
            "scores": scores,
            "strengths": sections["strengths"],
            "weaknesses": sections["weaknesses"],
            "key_observations": sections["key_observations"],
            "recommendations": recommendations,
            "gpt_feedback": gpt_feedback,
        }

    def to_markdown(self, report: dict) -> str:
        scores = "\n".join(f"- {name.replace('_', ' ').title()}: {score}" for name, score in report["scores"].items())
        strengths = "\n".join(f"- {item}" for item in report["strengths"])
        weaknesses = "\n".join(f"- {item}" for item in report["weaknesses"])
        roadmap = "\n".join(
            f"- {item['week']}: {item['focus']} - {item['goal']}"
            for item in report["recommendations"]["four_week_roadmap"]
        )
        return "\n".join(
            [
                "# Shadow Interview Report",
                "",
                f"Overall Score: {report['overall_score']}/100",
                f"Interview Readiness: {report['interview_readiness']}%",
                f"Problem: {report.get('problem', {}).get('title', 'Unknown problem')}",
                "",
                "## Scores",
                scores,
                "",
                "## Strengths",
                strengths,
                "",
                "## Weaknesses",
                weaknesses,
                "",
                "## 4-Week Roadmap",
                roadmap,
                "",
                "## Feedback",
                report.get("gpt_feedback") or "No GPT feedback generated.",
            ]
        )


report_generator = ReportGenerator()
