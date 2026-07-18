# Shadow Interview Chrome extension

This is the Milestone 1 foundation: a Manifest V3 extension that runs only on
`https://leetcode.com/problems/*`. It adds a polished local launcher and a
floating interview panel that shows the current page's title, difficulty, and
URL. It makes no network calls and contains no AI, backend, React, TypeScript,
framework, storage, or analytics code.

## File guide

- `manifest.json` configures Manifest V3 and restricts injection to LeetCode
  problem pages. JSON has no valid comment syntax, so its responsibility is
  recorded here and in its `description` value.
- `content/domParser.js` owns the changeable LeetCode selectors and metadata
  extraction logic.
- `content/panel.js` builds the launcher and panel and owns local interaction.
- `content/content.js` is the content-script entry point.
- `styles/panel.css` provides the isolated dark visual system and responsive,
  accessible animations.
- `assets/icons/shadow-interview.svg` is the reusable microphone brand mark.

The content scripts load in manifest order and use one `ShadowInterview`
namespace. This keeps the source modular while avoiding a bundler; Chrome does
not permit static ES-module imports in a content-script declaration.

## Load locally

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this `extension` folder.
4. Open any `https://leetcode.com/problems/...` page.

Reload the extension after editing its files, then refresh the LeetCode tab.

## Milestone 1 behavior

- The circular launcher stays fixed at the lower right while the page scrolls.
- Opening the panel refreshes page metadata so LeetCode navigation is handled.
- The launcher has a subtle idle glow; opening and closing the panel use smooth,
  reduced-motion-aware animations.
- Escape, clicking outside the panel, and its close button dismiss it. When
  open, Tab and Shift+Tab move only between its controls, then focus returns to
  the launcher when the panel closes.
- **Start Interview** is intentionally not connected in this milestone; it
  clearly reports that boundary without initiating a request.
