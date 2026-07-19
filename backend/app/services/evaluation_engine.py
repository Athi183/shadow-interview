"""Placeholder boundary for future final interview evaluation."""

from app.prompts.evaluation import EVALUATION_AGENT_PROMPT


class EvaluationEngine:
    def describe_capability(self) -> dict[str, str]:
        return {
            "status": "placeholder",
            "prompt_template": EVALUATION_AGENT_PROMPT,
        }


evaluation_engine = EvaluationEngine()
