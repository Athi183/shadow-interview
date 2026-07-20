"""Dedicated LLM boundary for interviewer responses.

OpenAI remains the primary provider for the hackathon architecture. Groq is
available as an optional OpenAI-compatible fallback, and a local mock
interviewer keeps demos/test runs usable when external API quota is exhausted.
"""

from openai import APIError, OpenAI, OpenAIError

from app.core.config import settings


class MissingOpenAIKeyError(RuntimeError):
    pass


class GPTServiceError(RuntimeError):
    pass


class GPTService:
    def __init__(self) -> None:
        self._openai_client: OpenAI | None = None
        self._groq_client: OpenAI | None = None

    def _get_openai_client(self) -> OpenAI:
        if not settings.openai_api_key:
            raise MissingOpenAIKeyError("OPENAI_API_KEY is not configured.")
        if self._openai_client is None:
            self._openai_client = OpenAI(api_key=settings.openai_api_key)
        return self._openai_client

    def _get_groq_client(self) -> OpenAI:
        if not settings.groq_api_key:
            raise MissingOpenAIKeyError("GROQ_API_KEY is not configured.")
        if self._groq_client is None:
            self._groq_client = OpenAI(api_key=settings.groq_api_key, base_url=settings.groq_base_url)
        return self._groq_client

    def generate_response(self, instructions: str, user_input: str) -> str:
        provider = settings.ai_provider
        if provider == "mock":
            return self._generate_mock_response(user_input)
        if provider == "openai":
            return self._generate_openai_response(instructions, user_input)
        if provider == "groq":
            return self._generate_groq_response(instructions, user_input)
        if provider != "auto":
            raise GPTServiceError(f"Unsupported AI_PROVIDER '{settings.ai_provider}'. Use auto, openai, groq, or mock.")

        errors: list[str] = []
        if settings.openai_api_key:
            try:
                return self._generate_openai_response(instructions, user_input)
            except (MissingOpenAIKeyError, GPTServiceError) as exc:
                errors.append(str(exc))

        if settings.groq_api_key:
            try:
                return self._generate_groq_response(instructions, user_input)
            except (MissingOpenAIKeyError, GPTServiceError) as exc:
                errors.append(str(exc))

        if settings.enable_mock_fallback:
            return self._generate_mock_response(user_input)

        if errors:
            raise GPTServiceError(" | ".join(errors))
        raise MissingOpenAIKeyError("No AI provider is configured. Set OPENAI_API_KEY, GROQ_API_KEY, or AI_PROVIDER=mock.")

    def _generate_openai_response(self, instructions: str, user_input: str) -> str:
        try:
            response = self._get_openai_client().responses.create(
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

    def _generate_groq_response(self, instructions: str, user_input: str) -> str:
        try:
            response = self._get_groq_client().chat.completions.create(
                model=settings.groq_model,
                messages=[
                    {"role": "system", "content": instructions},
                    {"role": "user", "content": user_input},
                ],
                temperature=0.45,
                max_tokens=220,
            )
        except APIError as exc:
            raise GPTServiceError(f"Groq API error: {exc}") from exc
        except OpenAIError as exc:
            raise GPTServiceError(f"Groq SDK error: {exc}") from exc

        output_text = response.choices[0].message.content if response.choices else ""
        if not output_text or not output_text.strip():
            raise GPTServiceError("Groq returned an empty response.")
        return output_text.strip()

    def _generate_mock_response(self, user_input: str) -> str:
        lowered_input = user_input.lower()
        if "complexity" in lowered_input or "o(" in lowered_input:
            return "Good. Now justify that complexity against the worst case. What state space are you counting, and where could repeated work still appear?"
        if "hash" in lowered_input or "map" in lowered_input or "set" in lowered_input:
            return "That sounds promising. What exactly will you store in the set or map, and how will it prevent checking impossible paths?"
        if "dp" in lowered_input or "dynamic" in lowered_input:
            return "Nice direction. Define your DP state precisely: what does one state represent, and what transition proves the next jump is valid?"
        if "edge" in lowered_input or "empty" in lowered_input:
            return "Good instinct. Pick one tricky edge case and walk me through how your logic handles it without special pleading."
        return "Let’s make that more concrete. What is your first approach, what data structure would you use, and why is it valid for this problem?"


gpt_service = GPTService()
