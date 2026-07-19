# Shadow Interview web workspace

This Vite + React application is the primary Shadow Interview UI. The Chrome
extension launches `/interview` with LeetCode problem metadata and, when
available, a backend `sessionId`.

Milestone 6 adds browser-native voice controls through the Web Speech API and
syncs live transcript updates to the local FastAPI backend. No external speech
API, authentication, persistence, or final scoring is implemented.

## Architecture

- `src/pages/` contains route-level compositions.
- `src/components/` contains reusable UI units for the workspace.
- `src/features/interview/` contains interview-specific hooks and constants.
- `src/services/interviewApi.js` centralizes local FastAPI calls.
- `src/data/interviewData.js` keeps static presentation data out of components.
- `src/styles/globals.css` defines Tailwind imports and shared design utilities.

## Run locally

```bash
npm install
npm run dev
```

Build a production bundle with:

```bash
npm run build
```
