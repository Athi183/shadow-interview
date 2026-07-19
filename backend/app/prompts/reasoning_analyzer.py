"""Prompt template reserved for future reasoning analysis."""

REASONING_ANALYZER_PROMPT = """
Compare the candidate explanation against their code.
Detect mismatches between stated intent, implemented logic, complexity claims, and edge-case handling.
Return observations only; do not grade the candidate yet.
""".strip()
