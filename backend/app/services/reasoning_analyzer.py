"""First-pass deterministic reasoning analyzer for live interview events."""

from app.models.interview_session import ConversationMessage
from app.prompts.reasoning_analyzer import REASONING_ANALYZER_PROMPT


class ReasoningAnalyzer:
    def analyze(
        self,
        candidate_message: str,
        current_code: str,
        conversation_history: list[ConversationMessage],
    ) -> dict[str, bool | str]:
        message = candidate_message.lower()
        code = current_code.lower()
        previous_candidate_text = " ".join(
            item.content.lower() for item in conversation_history if item.role == "candidate"
        )

        candidate_changed_strategy = self._has_strategy_shift(message, previous_candidate_text)
        optimization_attempt = any(token in message for token in ("optimize", "better", "hash map", "hashmap", "o(n)", "linear"))
        complexity_discussion = any(token in message for token in ("time complexity", "space complexity", "big o", "o(n", "o(1"))
        edge_case_discussion = any(token in message for token in ("edge case", "empty", "duplicate", "negative", "single element"))
        implementation_detail = any(token in message for token in ("code", "implement", "loop", "function", "return", "map"))
        explanation_mentions_hash = any(token in message for token in ("hash map", "hashmap", "dictionary", "dict"))
        code_mentions_hash = any(token in code for token in ("map", "dict", "{}", "setdefault"))

        possible_mismatch = bool(explanation_mentions_hash and current_code.strip() and not code_mentions_hash)

        return {
            "candidate_changed_strategy": candidate_changed_strategy,
            "optimization_attempt": optimization_attempt,
            "complexity_discussion": complexity_discussion,
            "edge_case_discussion": edge_case_discussion,
            "implementation_detail": implementation_detail,
            "possible_mismatch": possible_mismatch,
            "summary": self._summarize(
                candidate_changed_strategy,
                optimization_attempt,
                complexity_discussion,
                edge_case_discussion,
                possible_mismatch,
            ),
        }

    def describe_capability(self) -> dict[str, str]:
        return {
            "status": "active",
            "prompt_template": REASONING_ANALYZER_PROMPT,
        }

    def _has_strategy_shift(self, message: str, previous_candidate_text: str) -> bool:
        strategy_words = ("switch", "instead", "rather than", "move from", "change approach")
        if any(word in message for word in strategy_words):
            return True
        return "brute" in previous_candidate_text and any(token in message for token in ("hash map", "hashmap", "optimized"))

    def _summarize(
        self,
        candidate_changed_strategy: bool,
        optimization_attempt: bool,
        complexity_discussion: bool,
        edge_case_discussion: bool,
        possible_mismatch: bool,
    ) -> str:
        observations: list[str] = []
        if candidate_changed_strategy:
            observations.append("candidate changed strategy")
        if optimization_attempt:
            observations.append("optimization attempt detected")
        if complexity_discussion:
            observations.append("complexity discussed")
        if edge_case_discussion:
            observations.append("edge cases discussed")
        if possible_mismatch:
            observations.append("possible explanation/code mismatch")
        return "; ".join(observations) if observations else "no major reasoning signal detected"


reasoning_analyzer = ReasoningAnalyzer()
