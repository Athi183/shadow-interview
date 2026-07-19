"""Analyzes code quality and implementation signals from snapshots."""

from app.models.interview_session import InterviewSession


class CodeAnalyzer:
    def analyze(self, session: InterviewSession) -> dict:
        code = session.current_code or ""
        lowered = code.lower()
        has_loop = "for " in lowered or "while " in lowered
        has_hash_structure = any(token in lowered for token in ("dict", "map", "{}", "set()"))
        has_return = "return" in lowered
        nested_loops = lowered.count("for ") >= 2 or ("for " in lowered and "while " in lowered)

        code_quality = 40
        if code.strip():
            code_quality += 15
        if has_loop:
            code_quality += 10
        if has_hash_structure:
            code_quality += 15
        if has_return:
            code_quality += 10
        if nested_loops:
            code_quality -= 8

        return {
            "code_quality": max(0, min(code_quality, 95)),
            "optimization": 82 if has_hash_structure else 52,
            "complexity_analysis": 78 if any(token in session.transcript.lower() for token in ("o(n)", "time complexity", "space complexity")) else 48,
            "edge_case_awareness": 72 if any(token in session.transcript.lower() for token in ("edge", "empty", "duplicate", "negative")) else 46,
            "signals": {
                "has_loop": has_loop,
                "uses_hash_structure": has_hash_structure,
                "has_return": has_return,
                "nested_loops": nested_loops,
            },
        }


code_analyzer = CodeAnalyzer()
