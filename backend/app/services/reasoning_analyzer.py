"""Defines the future reasoning analyzer boundary without external API calls."""

from app.prompts.reasoning_analyzer import REASONING_ANALYZER_PROMPT


class ReasoningAnalyzer:
    def describe_capability(self) -> dict[str, str]:
        return {
            "status": "disabled",
            "prompt_template": REASONING_ANALYZER_PROMPT,
        }


reasoning_analyzer = ReasoningAnalyzer()
