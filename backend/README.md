# Shadow Interview API

This directory contains the FastAPI Interview Engine. It manages in-memory
interview sessions, receives interview events, tracks a finite-state workflow,
records timeline entries, analyzes candidate reasoning, builds compact GPT
context, generates final evaluation reports, and isolates OpenAI API communication inside `GPTService`.

The backend does not use a database, authentication, external speech APIs, or PDF export yet.

## Structure

- `app/main.py`: FastAPI entrypoint and local CORS policy.
- `app/models/`: interview session, event, timeline, and enum domain models.
- `app/schemas/`: Pydantic request and response contracts.
- `app/services/event_engine.py`: event ingestion boundary.
- `app/services/interview_state_machine.py`: finite-state interview workflow.
- `app/services/reasoning_analyzer.py`: transcript/code reasoning observations.
- `app/services/context_builder.py`: compact GPT input object.
- `app/services/interview_orchestrator.py`: stage transitions and interviewer response orchestration.
- `app/services/timeline_generator.py`: timeline event recording.
- `app/services/gpt_service.py`: OpenAI SDK boundary.
- `app/services/evaluation_engine.py`: final report pipeline coordinator.
- `app/services/communication_analyzer.py`: communication scoring signals.
- `app/services/code_analyzer.py`: code quality and complexity signals.
- `app/services/recommendation_engine.py`: personalized growth plan.
- `app/services/report_generator.py`: JSON and Markdown report shapes.
- `app/prompts/`: reusable prompt templates.

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

```bash
pip install -r requirements.txt
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
GET  /session/report/{session_id}
POST /session/report/export
```
