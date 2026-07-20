// Responsibility: centralize LeetCode DOM selectors and safely extract the
// current problem's metadata without changing or sending page content.

globalThis.ShadowInterview = globalThis.ShadowInterview || {};

globalThis.ShadowInterview.domParser = (() => {
  // Keep selectors in one place so adapting to a LeetCode markup change is easy.
  const SELECTORS = {
    title: [
      '[data-cy="question-title"]',
      '[class*="question-title"]',
      'h1',
    ],
    difficulty: [
      '[data-cy="question-difficulty"]',
      '[class*="text-difficulty"]',
      '[class*="difficulty"]',
    ],
  };

  const DIFFICULTIES = new Set(["Easy", "Medium", "Hard"]);

  function getText(element) {
    return element?.textContent?.replace(/\s+/g, " ").trim() || "";
  }

  function findFirstText(selectors) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      const text = getText(element);
      if (text) return text;
    }
    return "";
  }

  function findDifficulty() {
    for (const selector of SELECTORS.difficulty) {
      const candidates = document.querySelectorAll(selector);
      for (const candidate of candidates) {
        const text = getText(candidate);
        if (DIFFICULTIES.has(text)) return text;
      }
    }

    return "Not detected";
  }

  function titleFromUrl() {
    const problemSlug = window.location.pathname.match(/\/problems\/([^/]+)/)?.[1];
    if (!problemSlug) return "";

    return problemSlug
      .split("-")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function getProblemData() {
    return {
      title: findFirstText(SELECTORS.title) || titleFromUrl() || "Problem title not detected",
      difficulty: findDifficulty(),
      url: window.location.href,
    };
  }

  return { getProblemData, SELECTORS };
})();
