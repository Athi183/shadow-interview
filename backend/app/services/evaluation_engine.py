"""Coordinates the final interview evaluation pipeline."""

import json

from app.models.interview_session import InterviewSession
from app.prompts.evaluation import EVALUATION_AGENT_PROMPT
from app.services.code_analyzer import CodeAnalyzer
from app.services.communication_analyzer import CommunicationAnalyzer
from app.services.gpt_service import GPTService, GPTServiceError, MissingOpenAIKeyError
from app.services.reasoning_analyzer import ReasoningAnalyzer
from app.services.recommendation_engine import RecommendationEngine
from app.services.report_generator import ReportGenerator


class EvaluationEngine:
    def __init__(
        self,
        communication_analyzer: CommunicationAnalyzer,
        code_analyzer: CodeAnalyzer,
        reasoning_analyzer: ReasoningAnalyzer,
        recommendation_engine: RecommendationEngine,
        report_generator: ReportGenerator,
        gpt_service: GPTService,
    ) -> None:
        self._communication_analyzer = communication_analyzer
        self._code_analyzer = code_analyzer
        self._reasoning_analyzer = reasoning_analyzer
        self._recommendation_engine = recommendation_engine
        self._report_generator = report_generator
        self._gpt_service = gpt_service

    def evaluate(self, session: InterviewSession) -> dict:
        communication = self._communication_analyzer.analyze(session)
        code = self._code_analyzer.analyze(session)
        reasoning = self._reasoning_analyzer.analyze(
            candidate_message=session.transcript,
            current_code=session.current_code,
            conversation_history=session.conversation_history,
            transcript=session.transcript,
        )

        scores = {
            "technical_knowledge": self._technical_score(code, reasoning),
            "communication": communication["score"],
            "problem_solving": self._problem_solving_score(session, reasoning),
            "code_quality": code["code_quality"],
            "optimization": code["optimization"],
            "complexity_analysis": code["complexity_analysis"],
            "edge_case_awareness": code["edge_case_awareness"],
        }
        recommendations = self._recommendation_engine.generate(scores, session)
        sections = self._sections(communication, code, reasoning, session)
        draft = {
            "problem": {
                "title": session.problem_title,
                "difficulty": session.difficulty,
                "url": session.problem_url,
            },
            "scores": scores,
            "sections": sections,
            "recommendations": recommendations,
        }
        gpt_feedback = self._generate_gpt_feedback(draft)
        report = self._report_generator.generate(session, scores, sections, recommendations, gpt_feedback)
        session.final_evaluation = report
        return report

    def export_markdown(self, report: dict) -> str:
        return self._report_generator.to_markdown(report)

    def _generate_gpt_feedback(self, draft: dict) -> str:
        try:
            return self._gpt_service.generate_response(
                instructions=EVALUATION_AGENT_PROMPT,
                user_input=json.dumps(draft, default=str),
            )
        except MissingOpenAIKeyError:
            return "Evaluation generated locally. Add OPENAI_API_KEY for GPT-written coaching feedback."
        except GPTServiceError:
            return "Evaluation generated locally because GPT feedback is unavailable. Check OpenAI billing, quota, model access, or backend logs."

    def _technical_score(self, code: dict, reasoning: dict[str, bool | str]) -> int:
        base = round((code["code_quality"] + code["complexity_analysis"]) / 2)
        if reasoning.get("explanation_matches_implementation"):
            base += 6
        if reasoning.get("explanation_contradicts_implementation"):
            base -= 12
        return max(0, min(base, 95))

    def _problem_solving_score(self, session: InterviewSession, reasoning: dict[str, bool | str]) -> int:
        score = 55
        if reasoning.get("pattern_change"):
            score += 12
        if reasoning.get("optimization_attempt"):
            score += 12
        if len(session.timeline) >= 5:
            score += 8
        return min(score, 92)

    def _sections(self, communication: dict, code: dict, reasoning: dict[str, bool | str], session: InterviewSession) -> dict:
        strengths = []
        weaknesses = []
        if reasoning.get("optimization_attempt"):
            strengths.append("Identified an optimization path instead of staying with brute force.")
        if reasoning.get("explanation_matches_implementation"):
            strengths.append("Explanation aligned with implementation signals.")
        if communication["score"] >= 70:
            strengths.append("Communicated reasoning with enough detail for interviewer follow-up.")
        if not strengths:
            strengths.append("Established enough context to produce a targeted practice plan.")

        if reasoning.get("explanation_contradicts_implementation"):
            weaknesses.append("Explanation and implementation appear to diverge.")
        if code["complexity_analysis"] < 70:
            weaknesses.append("Complexity analysis needs more explicit justification.")
        if code["edge_case_awareness"] < 70:
            weaknesses.append("Edge-case discussion was limited.")
        if not session.current_code.strip():
            weaknesses.append("No substantial code snapshot was available for review.")

        return {
            "strengths": strengths,
            "weaknesses": weaknesses,
            "key_observations": [
                reasoning["summary"],
                *communication["signals"],
                f"Code signals: {code['signals']}",
            ],
        }


from app.services.code_analyzer import code_analyzer
from app.services.communication_analyzer import communication_analyzer
from app.services.gpt_service import gpt_service
from app.services.reasoning_analyzer import reasoning_analyzer
from app.services.recommendation_engine import recommendation_engine
from app.services.report_generator import report_generator

evaluation_engine = EvaluationEngine(
    communication_analyzer=communication_analyzer,
    code_analyzer=code_analyzer,
    reasoning_analyzer=reasoning_analyzer,
    recommendation_engine=recommendation_engine,
    report_generator=report_generator,
    gpt_service=gpt_service,
)
