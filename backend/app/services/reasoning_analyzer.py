"""First-pass deterministic reasoning analyzer for live interview context."""

from app.models.interview_session import ConversationMessage
from app.prompts.reasoning_analyzer import REASONING_ANALYZER_PROMPT


class ReasoningAnalyzer:
    def analyze(
        self,
        candidate_message: str,
        current_code: str,
        conversation_history: list[ConversationMessage],
        transcript: str = "",
    ) -> dict[str, bool | str]:
        explanation = " ".join(part for part in (transcript, candidate_message) if part).lower()
        code = current_code.lower()
        previous_candidate_text = " ".join(
            item.content.lower() for item in conversation_history if item.role == "candidate"
        )

        optimization_attempt = self._contains_any(explanation, ("optimize", "better", "hash map", "hashmap", "o(n)", "linear"))
        complexity_discussion = self._contains_any(explanation, ("time complexity", "space complexity", "big o", "o(n", "o(1"))
        edge_case_discussion = self._contains_any(explanation, ("edge case", "empty", "duplicate", "negative", "single element"))
        pattern_change = self._has_pattern_change(explanation, previous_candidate_text)
        explanation_matches_implementation = self._explanation_matches_code(explanation, code)
        explanation_contradicts_implementation = self._explanation_contradicts_code(explanation, code)

        return {
            "explanation_matches_implementation": explanation_matches_implementation,
            "explanation_contradicts_implementation": explanation_contradicts_implementation,
            "optimization_attempt": optimization_attempt,
            "pattern_change": pattern_change,
            "complexity_discussion": complexity_discussion,
            "edge_case_discussion": edge_case_discussion,
            "implementation_detail": self._contains_any(explanation, ("code", "implement", "loop", "function", "return", "map")),
            "summary": self._summarize(
                explanation_matches_implementation,
                explanation_contradicts_implementation,
                optimization_attempt,
                pattern_change,
                complexity_discussion,
                edge_case_discussion,
            ),
        }

    def describe_capability(self) -> dict[str, str]:
        return {
            "status": "active",
            "prompt_template": REASONING_ANALYZER_PROMPT,
        }

    def _contains_any(self, text: str, tokens: tuple[str, ...]) -> bool:
        return any(token in text for token in tokens)

    def _has_pattern_change(self, explanation: str, previous_candidate_text: str) -> bool:
        explicit_shift = self._contains_any(explanation, ("switch", "instead", "rather than", "move from", "change approach"))
        brute_to_hash = "brute" in previous_candidate_text and self._contains_any(explanation, ("hash map", "hashmap", "dictionary", "dict"))
        return explicit_shift or brute_to_hash

    def _explanation_matches_code(self, explanation: str, code: str) -> bool:
        if not explanation.strip() or not code.strip():
            return False
        mentions_hash = self._contains_any(explanation, ("hash map", "hashmap", "dictionary", "dict"))
        implements_hash = self._contains_any(code, ("map", "dict", "{}", "set()", "setdefault"))
        mentions_loop = self._contains_any(explanation, ("loop", "iterate", "scan"))
        implements_loop = self._contains_any(code, ("for ", "while "))
        return (mentions_hash and implements_hash) or (mentions_loop and implements_loop)

    def _explanation_contradicts_code(self, explanation: str, code: str) -> bool:
        if not explanation.strip() or not code.strip():
            return False
        claims_hash = self._contains_any(explanation, ("hash map", "hashmap", "dictionary", "dict"))
        lacks_hash_code = not self._contains_any(code, ("map", "dict", "{}", "set()", "setdefault"))
        claims_linear = self._contains_any(explanation, ("o(n)", "linear"))
        nested_loop_code = code.count("for ") >= 2 or ("for " in code and "while " in code)
        return (claims_hash and lacks_hash_code) or (claims_linear and nested_loop_code)

    def _summarize(
        self,
        explanation_matches_implementation: bool,
        explanation_contradicts_implementation: bool,
        optimization_attempt: bool,
        pattern_change: bool,
        complexity_discussion: bool,
        edge_case_discussion: bool,
    ) -> str:
        observations: list[str] = []
        if explanation_matches_implementation:
            observations.append("explanation matches implementation")
        if explanation_contradicts_implementation:
            observations.append("explanation contradicts implementation")
        if optimization_attempt:
            observations.append("optimization attempt detected")
        if pattern_change:
            observations.append("pattern change detected")
        if complexity_discussion:
            observations.append("complexity discussed")
        if edge_case_discussion:
            observations.append("edge cases discussed")
        return "; ".join(observations) if observations else "no major reasoning signal detected"


reasoning_analyzer = ReasoningAnalyzer()
