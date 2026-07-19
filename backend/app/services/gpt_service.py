"""Dedicated OpenAI SDK boundary for interviewer responses."""

from openai import APIError, OpenAI, OpenAIError

from app.core.config import settings


class MissingOpenAIKeyError(RuntimeError):
    pass


class GPTServiceError(RuntimeError):
    pass


class GPTService:
    def __init__(self) -> None:
        self._client: OpenAI | None = None

    def _get_client(self) -> OpenAI:
        if not settings.openai_api_key:
            raise MissingOpenAIKeyError("OPENAI_API_KEY is not configured.")
        if self._client is None:
            self._client = OpenAI(api_key=settings.openai_api_key)
        return self._client

    def generate_response(self, instructions: str, user_input: str) -> str:
        try:
            response = self._get_client().responses.create(
                model=settings.openai_model,
                instructions=instructions,
                input=user_input,
            )
        except APIError as exc:
            raise GPTServiceError(f"OpenAI API error: {exc}") from exc
        except OpenAIError as exc:
            raise GPTServiceError(f"OpenAI SDK error: {exc}") from exc

        output_text = getattr(response, "output_text", "").strip()
        if not output_text:
            raise GPTServiceError("OpenAI returned an empty response.")
        return output_text


gpt_service = GPTService()
