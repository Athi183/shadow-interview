"""Placeholder boundary for future reasoning analysis."""

from app.prompts.reasoning_analyzer import REASONING_ANALYZER_PROMPT


class ReasoningAnalyzer:
    def describe_capability(self) -> dict[str, str]:
        return {
            "status": "placeholder",
            "prompt_template": REASONING_ANALYZER_PROMPT,
        }


reasoning_analyzer = ReasoningAnalyzer()
