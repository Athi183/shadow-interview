# Shadow Interview web workspace

This Vite + React application is Milestone 2: a polished, local-only interview
workspace. It uses React Router for the landing and interview routes and
Tailwind CSS for styling. It contains no API calls, AI integration, audio
recording, authentication, or persisted data.

## Architecture

- `src/pages/` contains route-level compositions.
- `src/components/` contains reusable UI units for the workspace.
- `src/data/interviewData.js` keeps static presentation data out of components.
- `src/styles/globals.css` defines Tailwind imports and shared design utilities.

## Run locally

```bash
npm install
npm run dev
```

Use `/` for the landing page and `/interview` for the workspace. Build a
production bundle with `npm run build`.
