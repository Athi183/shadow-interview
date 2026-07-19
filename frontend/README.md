# Shadow Interview web workspace

This Vite + React application is the primary Shadow Interview UI. The Chrome
extension launches `/interview` with LeetCode problem metadata in query
parameters, and the React workspace renders the interview surface locally.

There are still no backend calls, GPT calls, audio recording, authentication, or
persisted data in the frontend.

## Architecture

- `src/pages/` contains route-level compositions.
- `src/components/` contains reusable UI units for the workspace.
- `src/features/interview/` contains interview-specific hooks and constants.
- `src/hooks/` preserves compatibility exports for shared hook paths.
- `src/data/interviewData.js` keeps static presentation data out of components.
- `src/styles/globals.css` defines Tailwind imports and shared design utilities.

## Run locally

```bash
npm install
npm run dev
```

Use `/` for the landing page and `/interview` for the workspace. The extension
opens URLs like:

```text
http://localhost:5173/interview?title=Two%20Sum&difficulty=Easy&problemUrl=https%3A%2F%2Fleetcode.com%2Fproblems%2Ftwo-sum%2F
```

Build a production bundle with:

```bash
npm run build
```
