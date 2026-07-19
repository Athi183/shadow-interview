# Shadow Interview architecture

## Product flow

```text
LeetCode
  -> Chrome Extension
  -> React Interview Workspace
  -> Interview Engine (FastAPI)
  -> Event Engine
  -> Context Builder
  -> GPTService / Evaluation Pipeline
```

The extension remains a lightweight LeetCode companion. It detects the active
problem, starts a backend session when available, opens the React workspace with
problem metadata and `sessionId`, then watches meaningful code edits with a
2.5-second debounce.

The React application owns the live interview UI. It uses the browser Web Speech
API for recording controls, live transcript display, and transcript sync. It
does not use external speech APIs.

The FastAPI backend owns the Interview Engine. Events flow through the Event
Engine, state machine, reasoning analyzer, timeline, Context Builder, and GPT
boundary. When the interview ends, the Evaluation Pipeline generates the final
structured report and personalized growth plan.

## Backend event flow

```text
Router
  -> EventEngine
  -> InterviewOrchestrator
  -> InterviewStateMachine
  -> ReasoningAnalyzer
  -> ContextBuilder
  -> GPTService
```

`ContextBuilder` is the only place that shapes GPT input. It creates a compact
object with current stage, current problem, latest code snapshot, recent
candidate transcript, recent conversation history, reasoning observations, and
recent timeline events.

## Supported events

- `INTERVIEW_STARTED`
- `PROBLEM_LOADED`
- `CANDIDATE_MESSAGE`
- `CODE_CHANGED`
- `TRANSCRIPT_UPDATED`
- `OPTIMIZATION_DETECTED`
- `EDGE_CASE_DISCUSSED`
- `AI_RESPONSE`
- `INTERVIEW_COMPLETED`

## Interview states

- `INTRODUCTION`
- `PROBLEM_UNDERSTANDING`
- `INITIAL_APPROACH`
- `IMPLEMENTATION`
- `OPTIMIZATION`
- `EDGE_CASES`
- `COMPLEXITY_ANALYSIS`
- `WRAP_UP`

## Deferred work

- Authentication
- Persistence or database storage
- External speech-to-text providers
- PDF export

## Evaluation pipeline

```text
EvaluationEngine
  -> CommunicationAnalyzer
  -> ReasoningAnalyzer
  -> CodeAnalyzer
  -> RecommendationEngine
  -> ReportGenerator
```

The report includes overall score, interview readiness, skill scores,
strengths, weaknesses, key observations, recommendations, next problems, and a
4-week roadmap.
