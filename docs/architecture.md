# Shadow Interview architecture

## Product flow

```text
LeetCode
  -> Chrome Extension
  -> React Interview Workspace
  -> Interview Engine (FastAPI)
  -> Event Engine
  -> Interview Orchestrator
  -> GPTService
```

The extension remains a lightweight launcher. It detects the active LeetCode
problem, opens the React workspace, and passes problem context through URL
parameters.

The React application owns the interview UI. Its center surface now presents a
live interview timeline with current stage, recent events, AI question, and
candidate response. It still does not call the backend in this milestone.

The FastAPI backend owns the Interview Engine. Existing `/session/*` endpoints
now emit structured events, and the Event Engine routes those events through
the orchestrator, state machine, analyzer, timeline, and GPT boundary.

## Backend event flow

```text
Router
  -> EventEngine
  -> InterviewOrchestrator
  -> InterviewStateMachine
  -> ReasoningAnalyzer
  -> TimelineGenerator
  -> GPTService
```

Supported events:

- `INTERVIEW_STARTED`
- `PROBLEM_LOADED`
- `CANDIDATE_MESSAGE`
- `CODE_CHANGED`
- `TRANSCRIPT_UPDATED`
- `OPTIMIZATION_DETECTED`
- `EDGE_CASE_DISCUSSED`
- `AI_RESPONSE`
- `INTERVIEW_COMPLETED`

## Backend modules

- `routers/`: HTTP endpoints for starting, updating, messaging, receiving events, and ending sessions.
- `models/interview_event.py`: event types and event payload model.
- `models/interview_session.py`: in-memory session, conversation, timeline, and stage models.
- `services/event_engine.py`: event ingestion and orchestration dispatch.
- `services/interview_state_machine.py`: finite-state interview workflow.
- `services/interview_orchestrator.py`: prompt context, stage transitions, and AI response orchestration.
- `services/reasoning_analyzer.py`: first version of code/reasoning observations.
- `services/timeline_generator.py`: automatic timeline recording.
- `services/gpt_service.py`: the only module that talks to the OpenAI SDK.
- `prompts/`: interviewer, reasoning analyzer, and final evaluation templates.

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

- Frontend-to-backend communication
- Voice recording or speech-to-text
- Authentication
- Persistence or database storage
- Final scoring and report generation
