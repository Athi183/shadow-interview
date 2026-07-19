# Shadow Interview Chrome extension

This Manifest V3 extension runs only on `https://leetcode.com/problems/*`. It
detects the active problem, injects the Shadow Interview launcher, starts a
local backend interview session when available, and opens the React workspace.

## File guide

- `manifest.json` configures Manifest V3, LeetCode injection, and localhost API permissions.
- `content/domParser.js` owns LeetCode metadata selectors.
- `content/panel.js` builds the launcher, starts the backend session, and opens the workspace.
- `content/codeObserver.js` watches the LeetCode editor and sends debounced code snapshots.
- `content/content.js` wires the content modules together.
- `styles/panel.css` provides isolated dark styling and animations.
- `assets/icons/shadow-interview.svg` is the reusable microphone brand mark.

## Runtime behavior

- The launcher appears only on LeetCode problem pages.
- `Start Interview` creates a local FastAPI session at `http://localhost:8000/session/start` when the backend is running.
- The workspace opens at `http://localhost:5173/interview` with problem metadata and `sessionId`.
- Code snapshots are sent to `/session/update` after meaningful editor changes settle for 2.5 seconds.
- If the backend is unavailable, the workspace still opens without a session id.
