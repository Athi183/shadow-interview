# Shadow Interview API

This directory contains the FastAPI Interview Engine for Shadow Interview. It
manages in-memory interview sessions, receives interview events, tracks a
finite-state workflow, records timeline entries, analyzes candidate reasoning,
and isolates OpenAI API communication inside `GPTService`.

The backend does not use a database, authentication, voice input, or final
scoring yet. The React frontend still uses local UI data in this milestone.

## Structure

- `app/main.py`: FastAPI entrypoint.
- `app/routers/`: HTTP route definitions for `/session/*`.
- `app/models/`: interview session, event, timeline, and enum domain models.
- `app/schemas/`: Pydantic request and response contracts.
- `app/services/session_manager.py`: in-memory session state.
- `app/services/event_engine.py`: event ingestion boundary.
- `app/services/interview_state_machine.py`: finite-state interview workflow.
- `app/services/interview_orchestrator.py`: prompt context, stage transitions, and AI response orchestration.
- `app/services/reasoning_analyzer.py`: first-pass deterministic reasoning observations.
- `app/services/timeline_generator.py`: timeline event recording.
- `app/services/gpt_service.py`: OpenAI SDK boundary.
- `app/prompts/`: reusable prompt templates.
- `app/core/`: environment-based configuration.
- `app/utils/`: mapping helpers.

## Environment

Set your OpenAI API key before calling `/session/message`:

```bash
export OPENAI_API_KEY="your_api_key_here"
```

Optionally override the model:

```bash
export OPENAI_MODEL="gpt-5.6"
```

## Local commands

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the API:

```bash
uvicorn app.main:app --reload
```

Available local endpoints:

```text
GET  /health
POST /session/start
POST /session/update
POST /session/message
POST /session/event
POST /session/end
```
