// Responsibility: create the floating launcher and interview panel, and manage
// the local handoff from LeetCode into the Shadow Interview workspace.

globalThis.ShadowInterview = globalThis.ShadowInterview || {};

globalThis.ShadowInterview.panel = (() => {
  const IDS = {
    launcher: "shadow-interview-launcher",
    panel: "shadow-interview-panel",
    title: "shadow-interview-problem-title",
    difficulty: "shadow-interview-problem-difficulty",
    url: "shadow-interview-problem-url",
    status: "shadow-interview-status",
  };
  const INTERVIEW_WORKSPACE_URL = "http://localhost:5173/interview";
  const INTERVIEW_API_URL = "http://localhost:8000";
  const SESSION_STORAGE_KEY = "shadowInterview:sessionId";

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function createIcon() {
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = '<path d="M12 3a5 5 0 0 0-5 5v4a5 5 0 0 0 10 0V8a5 5 0 0 0-5-5Zm-7 8a1 1 0 0 0-2 0 9 9 0 0 0 8 8.94V22H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.06A9 9 0 0 0 21 11a1 1 0 1 0-2 0 7 7 0 0 1-14 0Z" />';
    return icon;
  }

  function createField(labelText, valueId) {
    const field = createElement("div", "si-field");
    const label = createElement("span", "si-field-label", labelText);
    const value = createElement("span", "si-field-value");
    value.id = valueId;
    field.append(label, value);
    return field;
  }

  function buildInterviewWorkspaceUrl(problemData, sessionId = "") {
    const workspaceUrl = new URL(INTERVIEW_WORKSPACE_URL);
    workspaceUrl.searchParams.set("title", problemData.title);
    workspaceUrl.searchParams.set("difficulty", problemData.difficulty);
    workspaceUrl.searchParams.set("problemUrl", problemData.url);
    if (sessionId) workspaceUrl.searchParams.set("sessionId", sessionId);
    return workspaceUrl.toString();
  }

  async function createInterviewSession(problemData) {
    const response = await fetch(`${INTERVIEW_API_URL}/session/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problem_title: problemData.title,
        difficulty: problemData.difficulty,
        problem_url: problemData.url,
        language: "JavaScript",
      }),
    });

    if (!response.ok) throw new Error("Unable to create interview session.");
    return response.json();
  }

  function storeSessionId(sessionId) {
    try {
      window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    } catch {
      // Storage may be unavailable in hardened browser contexts.
    }
  }

  function mount(getProblemData) {
    if (document.getElementById(IDS.launcher)) return;

    const launcher = createElement("button", "si-launcher");
    launcher.id = IDS.launcher;
    launcher.type = "button";
    launcher.title = "Open Shadow Interview";
    launcher.setAttribute("aria-label", "Open Shadow Interview");
    launcher.setAttribute("aria-expanded", "false");
    launcher.append(createIcon());

    const panel = createElement("aside", "si-panel");
    panel.id = IDS.panel;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", IDS.title);
    panel.setAttribute("aria-label", "Shadow Interview");
    panel.setAttribute("aria-hidden", "true");

    const header = createElement("header", "si-header");
    const brand = createElement("div", "si-brand");
    brand.append(createIcon(), createElement("span", "", "Shadow Interview"));
    const closeButton = createElement("button", "si-close", "\u00d7");
    closeButton.type = "button";
    closeButton.title = "Close Shadow Interview";
    closeButton.setAttribute("aria-label", "Close Shadow Interview");
    header.append(brand, closeButton);

    const content = createElement("div", "si-content");
    const status = createElement("div", "si-status");
    status.id = IDS.status;
    status.append(createElement("span", "si-status-dot"), createElement("span", "", "Ready"));
    const currentProblem = createElement("p", "si-section-label", "Current Problem");
    const problemTitle = createElement("h2", "si-problem-title");
    problemTitle.id = IDS.title;
    const fields = createElement("div", "si-fields");
    fields.append(createField("Difficulty", IDS.difficulty), createField("URL", IDS.url));
    const startButton = createElement("button", "si-start", "Start Interview");
    startButton.type = "button";
    startButton.setAttribute("aria-describedby", IDS.status);
    content.append(status, currentProblem, problemTitle, fields, startButton);
    panel.append(header, content);
    document.body.append(launcher, panel);

    function setStatus(text) {
      status.lastElementChild.textContent = text;
    }

    function refreshProblemData() {
      const { title, difficulty, url } = getProblemData();
      document.getElementById(IDS.title).textContent = title;
      document.getElementById(IDS.difficulty).textContent = difficulty;
      const urlElement = document.getElementById(IDS.url);
      urlElement.textContent = url;
      urlElement.title = url;
    }

    function setOpen(isOpen) {
      panel.classList.toggle("si-panel-open", isOpen);
      panel.setAttribute("aria-hidden", String(!isOpen));
      launcher.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) {
        refreshProblemData();
        closeButton.focus();
      } else {
        launcher.focus();
      }
    }

    function trapFocus(event) {
      if (event.key !== "Tab" || !panel.classList.contains("si-panel-open")) return;

      const focusableElements = [...panel.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )].filter((element) => element.getClientRects().length > 0);

      if (!focusableElements.length) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === first || !panel.contains(activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (activeElement === last || !panel.contains(activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }

    launcher.addEventListener("click", () => setOpen(true));
    closeButton.addEventListener("click", () => setOpen(false));
    startButton.addEventListener("click", async () => {
      const problemData = getProblemData();
      startButton.disabled = true;
      setStatus("Creating session");

      try {
        const session = await createInterviewSession(problemData);
        storeSessionId(session.session_id);
        window.open(buildInterviewWorkspaceUrl(problemData, session.session_id), "_blank", "noopener,noreferrer");
        setStatus("Session started");
      } catch {
        window.open(buildInterviewWorkspaceUrl(problemData), "_blank", "noopener,noreferrer");
        setStatus("Workspace opened without backend session");
      } finally {
        startButton.disabled = false;
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && panel.classList.contains("si-panel-open")) setOpen(false);
      trapFocus(event);
    });
    document.addEventListener("pointerdown", (event) => {
      if (panel.classList.contains("si-panel-open") && !panel.contains(event.target) && !launcher.contains(event.target)) setOpen(false);
    });
  }

  return { mount };
})();
