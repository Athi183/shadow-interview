// Responsibility: observe meaningful LeetCode editor changes and send debounced
// code snapshots to the local Interview Engine when a session id is available.

globalThis.ShadowInterview = globalThis.ShadowInterview || {};

globalThis.ShadowInterview.codeObserver = (() => {
  const API_BASE_URL = "http://localhost:8000";
  const SESSION_STORAGE_KEY = "shadowInterview:sessionId";
  const DEBOUNCE_MS = 2500;
  const MIN_MEANINGFUL_DELTA = 12;
  const EDITOR_WAIT_MS = 1200;

  let lastSnapshot = "";
  let debounceId = null;
  let mounted = false;

  function getSessionId() {
    try {
      return window.localStorage.getItem(SESSION_STORAGE_KEY);
    } catch {
      return "";
    }
  }

  function getEditorRoot() {
    return document.querySelector(".monaco-editor") || document.querySelector(".CodeMirror");
  }

  function getEditorText() {
    const textArea = document.querySelector(".monaco-editor textarea");
    if (textArea?.value) return textArea.value;

    const viewLines = document.querySelector(".monaco-editor .view-lines");
    if (viewLines?.textContent) return viewLines.textContent;

    const codeMirror = document.querySelector(".CodeMirror-code");
    if (codeMirror?.textContent) return codeMirror.textContent;

    return "";
  }

  function countChangedCharacters(previousSnapshot, nextSnapshot) {
    const maxLength = Math.max(previousSnapshot.length, nextSnapshot.length);
    let changed = Math.abs(previousSnapshot.length - nextSnapshot.length);

    for (let index = 0; index < Math.min(previousSnapshot.length, nextSnapshot.length); index += 1) {
      if (previousSnapshot[index] !== nextSnapshot[index]) changed += 1;
      if (changed >= MIN_MEANINGFUL_DELTA) return changed;
    }

    return maxLength === 0 ? 0 : changed;
  }

  function isMeaningfulChange(nextSnapshot) {
    if (!nextSnapshot.trim()) return false;
    if (!lastSnapshot) return true;
    return countChangedCharacters(lastSnapshot, nextSnapshot) >= MIN_MEANINGFUL_DELTA;
  }

  async function sendSnapshot(snapshot) {
    const sessionId = getSessionId();
    if (!sessionId) return;

    await fetch(`${API_BASE_URL}/session/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        current_code: snapshot,
      }),
    });
  }

  function scheduleSnapshot() {
    window.clearTimeout(debounceId);
    debounceId = window.setTimeout(() => {
      const snapshot = getEditorText();
      if (!isMeaningfulChange(snapshot)) return;
      lastSnapshot = snapshot;
      sendSnapshot(snapshot).catch(() => undefined);
    }, DEBOUNCE_MS);
  }

  function mountWhenEditorIsReady() {
    if (mounted) return;

    const editor = getEditorRoot();
    if (!editor) {
      window.setTimeout(mountWhenEditorIsReady, EDITOR_WAIT_MS);
      return;
    }

    mounted = true;
    editor.addEventListener("input", scheduleSnapshot, true);
    editor.addEventListener("keyup", scheduleSnapshot, true);

    const observer = new MutationObserver(scheduleSnapshot);
    observer.observe(editor, { childList: true, characterData: true, subtree: true });
  }

  return { mount: mountWhenEditorIsReady };
})();
