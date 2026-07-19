"""Defines the future GPT interviewer boundary without external API calls."""

from app.prompts.interviewer import INTERVIEWER_AGENT_PROMPT


class GPTInterviewer:
    def describe_capability(self) -> dict[str, str]:
        return {
            "status": "disabled",
            "prompt_template": INTERVIEWER_AGENT_PROMPT,
        }


gpt_interviewer = GPTInterviewer()
