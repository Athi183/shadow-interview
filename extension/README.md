# Shadow Interview Chrome extension

This Manifest V3 extension runs only on `https://leetcode.com/problems/*`. It
detects the active problem, injects the Shadow Interview launcher, and runs the
live interview directly on LeetCode.

## File guide

- `manifest.json` configures Manifest V3, LeetCode injection, and localhost API permissions.
- `content/domParser.js` owns LeetCode metadata selectors.
- `content/panel.js` builds the launcher, starts/stops the backend session, records speech, sends final answers to the interviewer, and speaks responses.
- `content/codeObserver.js` watches the LeetCode editor and sends debounced code snapshots.
- `content/content.js` wires the content modules together.
- `styles/panel.css` provides isolated dark styling and animations.
- `assets/icons/shadow-interview.svg` is the reusable microphone brand mark.

## Runtime behavior

- The launcher appears only on LeetCode problem pages.
- `Start Interview` creates a local FastAPI session at `http://localhost:8000/session/start` and starts listening in-place.
- Final spoken answers are sent to `/session/message`; interviewer responses are displayed and spoken aloud.
- Code snapshots are sent to `/session/update` after meaningful editor changes settle for 2.5 seconds.
- `Stop Interview` ends the session and opens the React evaluation page with the report context.
