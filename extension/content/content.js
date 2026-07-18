// Responsibility: content-script entry point. It waits for the LeetCode page
// DOM, then connects the parser to the floating Shadow Interview UI.

globalThis.ShadowInterview = globalThis.ShadowInterview || {};

function initializeShadowInterview() {
  const { domParser, panel } = globalThis.ShadowInterview;
  if (!domParser || !panel) return;
  panel.mount(domParser.getProblemData);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeShadowInterview, { once: true });
} else {
  initializeShadowInterview();
}
