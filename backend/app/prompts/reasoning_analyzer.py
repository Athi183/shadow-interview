"""Reasoning analyzer prompt template."""

REASONING_ANALYZER_PROMPT = """
Compare the candidate explanation against their code.
Identify mismatches between stated intent, implemented logic, complexity claims, and edge-case handling.
Return concise observations that help the interviewer ask the next useful question.
""".strip()
