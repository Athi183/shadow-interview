// Responsibility: create the floating launcher, run the live interview on
// LeetCode, and open the React report/workspace only after the interview stops.

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
  const INTERVIEW_WORKSPACE_URL = "http://localhost:5173/evaluation";
  const INTERVIEW_API_URL = "http://localhost:8000";
  const SESSION_STORAGE_KEY = "shadowInterview:sessionId";

  let sessionId = "";
  let isInterviewActive = false;
  let recognition = null;
  let finalTranscript = "";

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

  function buildReportUrl(problemData) {
    const workspaceUrl = new URL(INTERVIEW_WORKSPACE_URL);
    workspaceUrl.searchParams.set("title", problemData.title);
    workspaceUrl.searchParams.set("difficulty", problemData.difficulty);
    workspaceUrl.searchParams.set("problemUrl", problemData.url);
    if (sessionId) workspaceUrl.searchParams.set("sessionId", sessionId);
    return workspaceUrl.toString();
  }

  async function request(path, payload) {
    try {
      const response = await fetch(`${INTERVIEW_API_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = new Error(await response.text());
        error.status = response.status;
        throw error;
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        error.status = 0;
      }
      throw error;
    }
  }

  async function createInterviewSession(problemData) {
    return request("/session/start", {
      problem_title: problemData.title,
      difficulty: problemData.difficulty,
      problem_url: problemData.url,
      language: "JavaScript",
    });
  }

  function storeSessionId(nextSessionId) {
    sessionId = nextSessionId;
    try {
      window.localStorage.setItem(SESSION_STORAGE_KEY, nextSessionId);
    } catch {
      // Storage may be unavailable in hardened browser contexts.
    }
  }

  function getSpeechRecognition() {
    return window.SpeechRecognition || window.webkitSpeechRecognition;
  }

  function speak(text, setStatus) {
    if (!window.speechSynthesis || !text) {
      setStatus("Listening");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onstart = () => setStatus("AI Speaking");
    utterance.onend = () => setStatus(isInterviewActive ? "Listening" : "Ready");
    utterance.onerror = () => setStatus(isInterviewActive ? "Listening" : "Ready");
    window.speechSynthesis.speak(utterance);
  }

  function interviewErrorMessage(error) {
    if (error.status === 0) return "Unable to contact Interview Engine. Start FastAPI on localhost:8000.";
    if (error.status === 503) return "OpenAI API key is missing. Set OPENAI_API_KEY in the backend terminal and restart FastAPI.";
    if (error.status === 502) return "OpenAI could not generate a response. Check your model/key, then try again.";
    return "The Interview Engine could not respond. Check the backend terminal for details.";
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

    const liveArea = createElement("div", "si-live-area");
    const transcriptBox = createElement("div", "si-live-card");
    transcriptBox.append(createElement("p", "si-section-label", "You said"), createElement("p", "si-live-text", "Your final spoken answer will appear here."));
    const aiBox = createElement("div", "si-live-card si-live-card-accent");
    aiBox.append(createElement("p", "si-section-label", "Interviewer"), createElement("p", "si-live-text", "Click Start Interview and explain your approach aloud."));
    liveArea.append(transcriptBox, aiBox);

    const startButton = createElement("button", "si-start", "Start Interview");
    startButton.type = "button";
    startButton.setAttribute("aria-describedby", IDS.status);
    content.append(status, currentProblem, problemTitle, fields, liveArea, startButton);
    panel.append(header, content);
    document.body.append(launcher, panel);

    const transcriptText = transcriptBox.querySelector(".si-live-text");
    const aiText = aiBox.querySelector(".si-live-text");

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

    async function sendCandidateMessage(candidateMessage) {
      if (!sessionId || !candidateMessage.trim()) return;

      setStatus("Processing");
      transcriptText.textContent = candidateMessage;
      try {
        const currentCode = globalThis.ShadowInterview.codeObserver?.getCurrentCode?.() || "";
        const response = await request("/session/message", {
          session_id: sessionId,
          candidate_message: candidateMessage,
          current_code: currentCode,
        });
        aiText.textContent = response.ai_response;
        speak(response.ai_response, setStatus);
      } catch (error) {
        aiText.textContent = interviewErrorMessage(error);
        setStatus("Ready");
      }
    }

    function startListening() {
      const SpeechRecognition = getSpeechRecognition();
      if (!SpeechRecognition) {
        aiText.textContent = "Speech recognition is not available in this browser.";
        setStatus("Ready");
        return;
      }

      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event) => {
        let interimText = "";
        let finalText = "";

        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index];
          const text = result[0]?.transcript || "";
          if (result.isFinal) finalText += text;
          else interimText += text;
        }

        if (interimText.trim()) transcriptText.textContent = `${finalTranscript} ${interimText}`.trim();
        if (finalText.trim()) {
          finalTranscript = `${finalTranscript} ${finalText}`.trim();
          sendCandidateMessage(finalText.trim());
        }
      };
      recognition.onerror = () => {
        aiText.textContent = "I lost microphone access. Click Stop Interview, then start again.";
        setStatus("Ready");
      };
      recognition.onend = () => {
        if (isInterviewActive) {
          try {
            recognition.start();
          } catch {
            setStatus("Ready");
          }
        }
      };
      recognition.start();
      setStatus("Listening");
    }

    async function startInterview() {
      const problemData = getProblemData();
      startButton.disabled = true;
      setStatus("Creating session");
      try {
        const session = await createInterviewSession(problemData);
        storeSessionId(session.session_id);
        isInterviewActive = true;
        finalTranscript = "";
        startButton.textContent = "Stop Interview";
        aiText.textContent = "I'm listening. Start by explaining your first approach before writing code.";
        startListening();
      } catch {
        aiText.textContent = "Unable to contact Interview Engine. Start the FastAPI backend, then try again.";
        setStatus("Ready");
      } finally {
        startButton.disabled = false;
      }
    }

    async function stopInterview() {
      isInterviewActive = false;
      startButton.disabled = true;
      setStatus("Ending interview");
      recognition?.stop();
      window.speechSynthesis?.cancel();
      try {
        if (sessionId) await request("/session/end", { session_id: sessionId });
      } catch {
        // The report page can still open and show fallback state if the backend is down.
      } finally {
        startButton.textContent = "Start Interview";
        startButton.disabled = false;
        setStatus("Ready");
        window.open(buildReportUrl(getProblemData()), "_blank", "noopener,noreferrer");
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
    startButton.addEventListener("click", () => {
      if (isInterviewActive) stopInterview();
      else startInterview();
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
