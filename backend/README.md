# Shadow Interview API

This directory contains the FastAPI architecture scaffold for the future
Interview Engine. It defines the boundaries for session management,
orchestration, prompt templates, reasoning analysis, and evaluation.

The backend does not call GPT, connect to a database, authenticate users, or
communicate with the frontend yet.

## Structure

- `app/main.py`: FastAPI entrypoint.
- `app/routers/`: HTTP route definitions.
- `app/services/`: business logic boundaries.
- `app/models/`: internal domain models.
- `app/schemas/`: Pydantic request and response contracts.
- `app/prompts/`: future GPT prompt templates.
- `app/core/`: configuration.
- `app/utils/`: shared helpers.

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
POST /api/sessions
GET  /api/sessions/{session_id}
```
