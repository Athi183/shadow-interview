# Shadow Interview

> An AI interview layer for LeetCode that turns solo problem solving into a realistic, voice-driven technical interview.

Shadow Interview is a Chrome extension, React workspace, and FastAPI interview engine built for OpenAI Build Week. The extension appears directly on LeetCode problem pages, captures the current problem context and code, listens to the candidate's reasoning, and guides them through an interview-style conversation without revealing full solutions.

The project is designed for GPT-5.6 as the primary interviewer model, with Groq and local mock fallbacks so the live demo remains reliable even when API quota is unavailable.

## What it does

Shadow Interview transforms this flow:

```text
Open LeetCode
Solve silently
Check answer
```

into this:

```text
Open LeetCode
Click Shadow Interview
Explain your reasoning aloud
Receive Socratic interviewer follow-up
Keep coding while the assistant tracks context
End interview
Review evaluation dashboard and growth plan
```

The experience is intentionally not a solution generator. It behaves more like a senior technical interviewer: it asks concise questions, challenges assumptions, watches for optimization opportunities, and evaluates reasoning, communication, and problem-solving process.

## Current architecture

```text
LeetCode problem page
        |
        v
Chrome Extension, Manifest V3
        |
        |  problem metadata, code snapshots, audio turns
        v
FastAPI Interview Engine
        |
        |-- Session Manager
        |-- Event Engine
        |-- Interview State Machine
        |-- Context Builder
        |-- Interview Orchestrator
        |-- AI Provider Service
        |     |-- OpenAI GPT-5.6, primary
        |     |-- Groq, optional fallback
        |     |-- Local mock interviewer, demo fallback
        |-- Groq Whisper transcription
        |-- Reasoning Analyzer
        |-- Evaluation Pipeline
        |
        v
React Interview Workspace and Evaluation Dashboard
```

## Repository layout

```text
shadow-interview/
  extension/   Manifest V3 Chrome extension injected into LeetCode
  frontend/    Vite + React + Tailwind interview workspace and report UI
  backend/     FastAPI interview engine, AI orchestration, transcription, evaluation
  docs/        Product and architecture notes
  assets/      Shared visual assets
```

## Completed capabilities

### Chrome Extension

- Runs only on LeetCode problem pages: `https://leetcode.com/problems/*`
- Injects a polished floating launcher and interview panel.
- Detects problem title, difficulty, and URL from the LeetCode page.
- Falls back to the problem slug when LeetCode's DOM title changes.
- Starts the interview in-place without navigating away from LeetCode.
- Captures meaningful code snapshots from the LeetCode editor with debounce.
- Records spoken candidate answers as separate interview turns.
- Pauses microphone capture while the interviewer is speaking.
- Supports manual typed fallback if voice capture fails.
- Opens the React report dashboard only when the interview ends.

### React Workspace

- Built with Vite, React, React Router, and TailwindCSS.
- Includes a modern dark AI-product interface.
- Provides:
  - landing page
  - interview workspace
  - problem panel
  - interview room
  - transcript panel
  - progress tracker
  - timeline display
  - final evaluation dashboard
- Supports report export as Markdown and JSON.

### FastAPI Interview Engine

- Uses a modular clean architecture under `backend/app/`.
- Stores sessions in memory; no database required.
- Manages interview sessions, state transitions, timeline events, code snapshots, transcripts, and final reports.
- Provides event-driven orchestration instead of simple chat-only behavior.
- Builds compact model context instead of sending the entire raw history.
- Includes first-pass analyzers for:
  - reasoning signals
  - communication
  - code quality
  - optimization
  - complexity discussion
  - edge-case awareness
- Generates a structured final interview report and personalized improvement roadmap.

### Voice and AI Provider Stack

The current backend supports layered fallbacks:

```text
Interviewer response:
OpenAI GPT-5.6 -> Groq -> Local mock interviewer

Speech transcription:
Groq Whisper -> Browser Web Speech fallback -> Manual typed input
```

This keeps the project demoable even when one external provider is unavailable.

## Backend API

Core endpoints:

```text
GET  /health
POST /session/start
POST /session/update
POST /session/message
POST /session/event
POST /session/end
GET  /session/report/{session_id}
POST /session/report/export
POST /speech/transcribe
```

The most important runtime loop is:

```text
Extension records candidate speech
        |
        v
POST /speech/transcribe
        |
        v
POST /session/message
        |
        v
Interview Orchestrator builds compact context
        |
        v
AI provider generates next interviewer question
        |
        v
Extension displays and speaks the response
```

## Environment variables

Create:

```text
backend/.env
```

Example:

```env
AI_PROVIDER=auto
ENABLE_MOCK_FALLBACK=true

OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6

GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_TRANSCRIPTION_MODEL=whisper-large-v3-turbo
GROQ_BASE_URL=https://api.groq.com/openai/v1
```

Provider modes:

```text
AI_PROVIDER=auto    OpenAI first, Groq second, mock fallback last
AI_PROVIDER=openai  Force OpenAI only
AI_PROVIDER=groq    Force Groq only
AI_PROVIDER=mock    Local demo mode with no external AI call
```

Never commit real API keys. `backend/.env` is ignored by git.

## Run locally

### 1. Start the backend

```powershell
cd D:\PROJECTS\CODEX_PROJECT\shadow-interview\backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at:

```text
http://127.0.0.1:8000
```

API docs:

```text
http://127.0.0.1:8000/docs
```

### 2. Start the React workspace

```powershell
cd D:\PROJECTS\CODEX_PROJECT\shadow-interview\frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

### 3. Load the Chrome extension

1. Open Chrome.
2. Go to `chrome://extensions`.
3. Enable Developer Mode.
4. Click Load unpacked.
5. Select:

```text
D:\PROJECTS\CODEX_PROJECT\shadow-interview\extension
```

6. Open a LeetCode problem page.
7. Click the Shadow Interview floating launcher.

## Demo flow

1. Open a LeetCode problem.
2. Click the Shadow Interview launcher.
3. Click Start Interview.
4. Explain your first approach aloud.
5. Shadow Interview transcribes the audio, sends the reasoning and current code to the backend, and asks a follow-up question.
6. Continue solving while the extension tracks code changes and interview state.
7. Click Stop Interview.
8. Review the final evaluation dashboard.

## Design principles

- Enhance LeetCode instead of replacing it.
- Do not reveal full solutions.
- Ask one Socratic question at a time.
- Keep the candidate in the driver's seat.
- Treat reasoning and communication as first-class interview signals.
- Keep backend orchestration modular and provider-agnostic.
- Keep the Chrome extension lightweight and framework-free.

## Hackathon note

This project was developed during OpenAI Build Week with Codex assistance. The architecture is designed around GPT-5.6 as the primary AI interviewer while supporting Groq and local mock fallbacks for reliability during development and demos.

The fallback modes are intentionally explicit so the project remains honest, testable, and easy to run even when API quota or provider access changes.

## Status

Shadow Interview currently supports the full local interview loop:

```text
LeetCode context
+ candidate voice
+ code snapshots
+ event-driven backend orchestration
+ interviewer response
+ text-to-speech playback
+ final evaluation dashboard
```

Future work may include persistent storage, authentication, richer code analysis, production deployment, stronger evaluation calibration, and optional PDF report export.
