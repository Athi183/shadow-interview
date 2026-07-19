"""Defines the future final evaluation boundary without external API calls."""

from app.prompts.evaluation import EVALUATION_AGENT_PROMPT


class EvaluationEngine:
    def describe_capability(self) -> dict[str, str]:
        return {
            "status": "disabled",
            "prompt_template": EVALUATION_AGENT_PROMPT,
        }


evaluation_engine = EvaluationEngine()
