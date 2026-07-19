# Shadow Interview architecture

## Product flow

```text
LeetCode
  -> Chrome Extension
  -> React Interview Workspace
  -> Interview Engine (FastAPI)
```

The extension is a lightweight launcher. It detects the active LeetCode problem,
opens the React workspace, and passes problem context through URL parameters.

The React application owns the interview UI. It renders problem context,
interview room, transcript, progress, and timeline surfaces. It still does not
call the backend in this milestone.

The FastAPI backend now owns the Interview Engine. It creates in-memory
sessions, records timeline events, tracks stage progression, and delegates all
OpenAI SDK communication to `GPTService`.

## Application boundaries

- `extension/`: page detection, launcher UI, handoff to React.
- `frontend/`: React workspace, UI state, route-level composition.
- `backend/`: FastAPI interview session engine and GPT orchestration.

## Backend modules

- `routers/`: HTTP endpoints for starting, updating, messaging, and ending sessions.
- `services/session_manager.py`: in-memory session lifecycle and state updates.
- `services/interview_orchestrator.py`: stage selection, prompt selection, and AI response orchestration.
- `services/gpt_service.py`: the only module that talks to the OpenAI SDK.
- `services/timeline_generator.py`: session event recording.
- `services/reasoning_analyzer.py`: placeholder boundary for future reasoning analysis.
- `services/evaluation_engine.py`: placeholder boundary for future final reports.
- `prompts/`: interviewer, reasoning analyzer, and final evaluation templates.
- `models/`: domain models and enums.
- `schemas/`: API contracts.
- `core/`: environment configuration.
- `utils/`: response mapping helpers.

## Interview session model

The backend uses a central in-memory `InterviewSession` with:

- `session_id`
- `problem_title`
- `difficulty`
- `problem_url`
- `language`
- `started_at`
- `created_at`
- `elapsed_time`
- `current_stage`
- `interview_stage`
- `current_code`
- `transcript`
- `conversation_history`
- `code_snapshots`
- `transcript_history`
- `candidate_notes`
- `timeline`
- `status`

## Deferred work

- Frontend-to-backend communication
- Voice recording or speech-to-text
- Authentication
- Persistence or database storage
- Full reasoning analysis implementation
- Final interview evaluation implementation
