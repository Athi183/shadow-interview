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
interview room, transcript, progress, and timeline surfaces. It does not call
GPT or the backend yet.

The FastAPI backend owns future interview business logic. It defines session
models, session routes, service boundaries, and prompt templates, but no GPT
service calls are active in this milestone.

## Application boundaries

- `extension/`: page detection, launcher UI, handoff to React.
- `frontend/`: React workspace, UI state, route-level composition.
- `backend/`: FastAPI session engine, orchestration boundaries, prompt modules.

## Interview session model

The backend introduces a central in-memory `InterviewSession` with:

- `session_id`
- `problem_title`
- `difficulty`
- `problem_url`
- `language`
- `started_at`
- `elapsed_time`
- `current_stage`
- `conversation_history`
- `code_snapshots`
- `transcript_history`
- `candidate_notes`
- `status`
- `final_evaluation`

## Deferred work

- GPT-5.6 calls
- Frontend-to-backend communication
- Voice recording or speech-to-text
- Authentication
- Persistence or database storage
- Final report generation
