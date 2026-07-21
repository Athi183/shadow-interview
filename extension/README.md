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

## Install for judges

The easiest way to test the extension is to load it unpacked in Chrome:

1. Download or clone the repository.
2. Open Chrome and go to `chrome://extensions`.
3. Enable Developer Mode.
4. Click **Load unpacked**.
5. Select the `extension/` folder.
6. Open a LeetCode problem page, for example:

```text
https://leetcode.com/problems/valid-parentheses/
```

7. Click the Shadow Interview floating launcher.

For a ZIP package, run this from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/package-extension.ps1
```

This creates:

```text
dist/shadow-interview-extension.zip
```

Judges can unzip it and load the unzipped folder through `chrome://extensions`.

## Runtime behavior

- The launcher appears only on LeetCode problem pages.
- `Start Interview` creates a FastAPI session and starts listening in-place.
- Final spoken answers are sent to `/session/message`; interviewer responses are displayed and spoken aloud.
- Code snapshots are sent to `/session/update` after meaningful editor changes settle for 2.5 seconds.
- `Stop Interview` ends the session and opens the React evaluation page with the report context.

## Deployment URLs

The extension reads its backend/dashboard URLs from:

```text
content/config.js
```

The current demo configuration points to:

```text
https://shadow-interview-api.onrender.com
https://shadow-interview.vercel.app/evaluation
```
