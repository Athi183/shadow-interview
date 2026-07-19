# Shadow Interview web workspace

This Vite + React application is the primary Shadow Interview UI. The Chrome
extension launches `/interview` with LeetCode problem metadata and, when
available, a backend `sessionId`.

The workspace includes browser-native voice controls through the Web Speech API,
live transcript sync, and a final evaluation dashboard with report export. No
external speech API, authentication, persistence, or PDF export is implemented.

## Architecture

- `src/pages/` contains route-level compositions.
- `src/components/` contains reusable UI units for the workspace.
- `src/features/interview/` contains interview-specific hooks and constants.
- `src/services/interviewApi.js` centralizes local FastAPI calls.
- `src/data/interviewData.js` keeps static presentation data out of components.
- `src/styles/globals.css` defines Tailwind imports and shared design utilities.

Routes:

- `/interview`: live interview workspace.
- `/evaluation`: final interview report dashboard.

## Run locally

```bash
npm install
npm run dev
```

Build a production bundle with:

```bash
npm run build
```
