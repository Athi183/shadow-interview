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
    trailCount: "shadow-interview-trail-count",
  };
  const INTERVIEW_WORKSPACE_URL = "http://localhost:5173/evaluation";
  const INTERVIEW_API_URL = "http://localhost:8000";
  const SESSION_STORAGE_KEY = "shadowInterview:sessionId";
  const SPEECH_SILENCE_MS = 1800;
  const VOICE_SILENCE_MS = 1700;
  const MIN_VOICE_TURN_MS = 800;
  const VOICE_RMS_THRESHOLD = 0.025;

  let sessionId = "";
  let isInterviewActive = false;
  let isRecognitionPausedForSpeech = false;
  let recognition = null;
  let voiceStream = null;
  let audioContext = null;
  let analyser = null;
  let voiceMonitorId = null;
  let mediaRecorder = null;
  let audioChunks = [];
  let coveredItems = [];
  let recordingStartedAt = 0;
  let silenceStartedAt = 0;
  let pendingTranscript = "";
  let interimTranscript = "";
  let speechSilenceTimer = null;

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
    icon.innerHTML = [
      '<path class="si-icon-shadow" d="M15.7 3.2a8.8 8.8 0 1 0 4.9 13.8 7.4 7.4 0 1 1-4.9-13.8Z" />',
      '<path class="si-icon-mic" d="M12 4.2a3.8 3.8 0 0 0-3.8 3.8v3.2a3.8 3.8 0 1 0 7.6 0V8A3.8 3.8 0 0 0 12 4.2Z" />',
      '<path class="si-icon-line" d="M5.6 11.1a6.4 6.4 0 0 0 12.8 0M12 17.5v3.1M8.8 20.6h6.4" />',
      '<path class="si-icon-spark" d="M17.7 5.2 18.2 4l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5ZM4.7 6.8 5.1 6l.4.8.8.4-.8.4-.4.8-.4-.8-.8-.4.8-.4Z" />',
    ].join("");
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

  async function transcribeAudio(audioBlob) {
    const formData = new FormData();
    formData.append("audio", audioBlob, "candidate-turn.webm");

    const response = await fetch(`${INTERVIEW_API_URL}/speech/transcribe`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = new Error(await response.text());
      error.status = response.status;
      throw error;
    }

    return response.json();
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

  function speak(text, setStatus, onDone) {
    if (!window.speechSynthesis || !text) {
      setStatus("Listening");
      onDone?.();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onstart = () => setStatus("AI Speaking");
    utterance.onend = () => {
      setStatus(isInterviewActive ? "Listening" : "Ready");
      onDone?.();
    };
    utterance.onerror = () => {
      setStatus(isInterviewActive ? "Listening" : "Ready");
      onDone?.();
    };
    window.speechSynthesis.speak(utterance);
  }

  function interviewErrorMessage(error) {
    const details = error.message || "";
    if (error.status === 0) return "Unable to contact Interview Engine. Start FastAPI on localhost:8000.";
    if (error.status === 503 && /GROQ_API_KEY/i.test(details)) return "Groq API key is missing. Add GROQ_API_KEY to backend/.env and restart FastAPI.";
    if (error.status === 503) return "OpenAI API key is missing. Set OPENAI_API_KEY in the backend terminal and restart FastAPI.";
    if (error.status === 502 && /transcription|audio|Groq/i.test(details)) return "High-accuracy voice transcription failed. Check your Groq key/model and backend logs.";
    if (error.status === 502 && /quota|insufficient_quota|billing/i.test(details)) {
      return "OpenAI quota is exhausted. Check your API billing/quota, then try again.";
    }
    if (error.status === 502) return "OpenAI could not generate a response. Check your model, key, billing, or backend logs.";
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
    launcher.append(createElement("span", "si-launcher-label", "Shadow Interview"));
    const launcherBadge = createElement("span", "si-launcher-badge", "0");
    launcherBadge.id = IDS.trailCount;
    launcherBadge.setAttribute("aria-label", "Covered interview items");
    launcher.append(launcherBadge);

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

    const trailBox = createElement("div", "si-trail-card");
    const trailHeader = createElement("div", "si-trail-header");
    trailHeader.append(createElement("p", "si-section-label", "Covered so far"), createElement("span", "si-trail-pill", "0"));
    const trailList = createElement("ul", "si-trail-list");
    trailList.append(createElement("li", "si-trail-empty", "Interview questions and key events will appear here."));
    trailBox.append(trailHeader, trailList);

    const manualInput = createElement("textarea", "si-manual-input");
    manualInput.placeholder = "If speech recognition stalls, type your thought here and send it to the interviewer.";
    manualInput.rows = 3;
    manualInput.setAttribute("aria-label", "Manual candidate response");
    const manualSendButton = createElement("button", "si-send", "Send to Interviewer");
    manualSendButton.type = "button";
    const manualControls = createElement("div", "si-manual-controls");
    manualControls.append(manualInput, manualSendButton);

    const startButton = createElement("button", "si-start", "Start Interview");
    startButton.type = "button";
    startButton.setAttribute("aria-describedby", IDS.status);
    content.append(status, currentProblem, problemTitle, fields, liveArea, trailBox, manualControls, startButton);
    panel.append(header, content);
    document.body.append(launcher, panel);

    const transcriptText = transcriptBox.querySelector(".si-live-text");
    const aiText = aiBox.querySelector(".si-live-text");
    const trailPill = trailBox.querySelector(".si-trail-pill");

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

    function updateCoveredItems(nextTimeline = []) {
      const usefulItems = nextTimeline
        .filter((event) => ["AI Response", "Candidate Message", "Stage Transition"].includes(event.label))
        .map((event) => ({
          label: event.label,
          detail: event.detail,
          timestamp: event.timestamp,
        }));

      if (usefulItems.length) coveredItems = usefulItems.slice(-6);

      trailList.innerHTML = "";
      if (!coveredItems.length) {
        trailList.append(createElement("li", "si-trail-empty", "Interview questions and key events will appear here."));
      } else {
        coveredItems.forEach((item) => {
          const listItem = createElement("li", "si-trail-item");
          const icon = item.label === "AI Response" ? "🎤" : item.label === "Candidate Message" ? "🗣️" : "↗";
          listItem.append(
            createElement("span", "si-trail-icon", icon),
            createElement("span", "si-trail-copy", `${item.timestamp} · ${item.detail}`),
          );
          trailList.append(listItem);
        });
      }

      const count = String(coveredItems.length);
      trailPill.textContent = count;
      launcherBadge.textContent = count;
      launcherBadge.classList.toggle("si-launcher-badge-visible", coveredItems.length > 0);
    }

    function pauseRecognitionForInterviewer() {
      isRecognitionPausedForSpeech = true;
      window.clearTimeout(speechSilenceTimer);
      if (mediaRecorder?.state === "recording") {
        try {
          mediaRecorder.stop();
        } catch {
          // The recorder may already be closing this turn.
        }
      }
      if (!recognition) return;
      try {
        recognition.stop();
      } catch {
        // The browser may already have stopped recognition between speech turns.
      }
    }

    function resumeRecognitionAfterInterviewer() {
      if (!isInterviewActive) return;

      isRecognitionPausedForSpeech = false;
      if (!recognition) return;
      try {
        recognition.start();
      } catch {
        // Chrome can throw if recognition is already active; the current session can continue.
      }
    }

    async function sendCandidateMessage(candidateMessage) {
      if (!sessionId || !candidateMessage.trim()) return;

      setStatus("Processing");
      transcriptText.textContent = candidateMessage;
      pauseRecognitionForInterviewer();
      try {
        const currentCode = globalThis.ShadowInterview.codeObserver?.getCurrentCode?.() || "";
        const response = await request("/session/message", {
          session_id: sessionId,
          candidate_message: candidateMessage,
          current_code: currentCode,
        });
        aiText.textContent = response.ai_response;
        updateCoveredItems(response.timeline);
        speak(response.ai_response, setStatus, resumeRecognitionAfterInterviewer);
      } catch (error) {
        aiText.textContent = interviewErrorMessage(error);
        if (isInterviewActive) {
          setStatus("Listening");
          resumeRecognitionAfterInterviewer();
        } else {
          setStatus("Ready");
        }
      }
    }

    function resetSpeechBuffers() {
      pendingTranscript = "";
      interimTranscript = "";
      window.clearTimeout(speechSilenceTimer);
    }

    function readableTranscript() {
      return [pendingTranscript, interimTranscript].filter(Boolean).join(" ").trim();
    }

    function scheduleSpeechSend() {
      window.clearTimeout(speechSilenceTimer);
      speechSilenceTimer = window.setTimeout(() => {
        const candidateMessage = (pendingTranscript || interimTranscript).trim();
        if (!candidateMessage) return;

        pendingTranscript = "";
        interimTranscript = "";
        transcriptText.textContent = candidateMessage;
        sendCandidateMessage(candidateMessage);
      }, SPEECH_SILENCE_MS);
    }

    function preferredAudioMimeType() {
      const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
      return candidates.find((type) => window.MediaRecorder?.isTypeSupported?.(type)) || "";
    }

    function currentMicVolume() {
      if (!analyser) return 0;

      const samples = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(samples);

      let sumSquares = 0;
      for (const sample of samples) {
        const normalized = (sample - 128) / 128;
        sumSquares += normalized * normalized;
      }
      return Math.sqrt(sumSquares / samples.length);
    }

    function startAudioTurn() {
      if (!voiceStream || mediaRecorder?.state === "recording") return;

      const mimeType = preferredAudioMimeType();
      audioChunks = [];
      mediaRecorder = new MediaRecorder(voiceStream, mimeType ? { mimeType } : undefined);
      recordingStartedAt = Date.now();
      silenceStartedAt = 0;
      transcriptText.textContent = "Listening to your answer...";

      mediaRecorder.ondataavailable = (event) => {
        if (event.data?.size) audioChunks.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const duration = Date.now() - recordingStartedAt;
        const blob = new Blob(audioChunks, { type: mediaRecorder.mimeType || "audio/webm" });
        audioChunks = [];
        if (duration >= MIN_VOICE_TURN_MS && blob.size > 0 && isInterviewActive) {
          processAudioTurn(blob);
        }
      };
      mediaRecorder.start();
      setStatus("Listening");
    }

    function stopAudioTurn() {
      if (mediaRecorder?.state !== "recording") return;

      try {
        mediaRecorder.stop();
      } catch {
        // MediaRecorder can throw if Chrome has already ended this chunk.
      }
    }

    async function processAudioTurn(audioBlob) {
      if (isRecognitionPausedForSpeech) return;

      setStatus("Transcribing");
      try {
        const transcription = await transcribeAudio(audioBlob);
        const transcript = transcription.transcript?.trim();
        if (!transcript) {
          setStatus("Listening");
          return;
        }
        resetSpeechBuffers();
        transcriptText.textContent = transcript;
        sendCandidateMessage(transcript);
      } catch (error) {
        aiText.textContent = interviewErrorMessage(error);
        setStatus(isInterviewActive ? "Listening" : "Ready");
      }
    }

    function monitorVoice() {
      if (!isInterviewActive || !voiceStream) return;

      const volume = currentMicVolume();
      const isSpeaking = volume >= VOICE_RMS_THRESHOLD;

      if (!isRecognitionPausedForSpeech) {
        if (isSpeaking && mediaRecorder?.state !== "recording") {
          startAudioTurn();
        } else if (mediaRecorder?.state === "recording") {
          if (isSpeaking) {
            silenceStartedAt = 0;
          } else {
            silenceStartedAt ||= Date.now();
            if (Date.now() - silenceStartedAt >= VOICE_SILENCE_MS) stopAudioTurn();
          }
        }
      }

      voiceMonitorId = window.requestAnimationFrame(monitorVoice);
    }

    async function startHighAccuracyVoice() {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        throw new Error("MediaRecorder microphone capture is unavailable.");
      }

      voiceStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(voiceStream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      aiText.textContent = "High-accuracy voice is ready. Speak your next thought, then pause briefly.";
      setStatus("Listening");
      monitorVoice();
    }

    function stopHighAccuracyVoice() {
      if (voiceMonitorId) window.cancelAnimationFrame(voiceMonitorId);
      voiceMonitorId = null;
      stopAudioTurn();
      voiceStream?.getTracks().forEach((track) => track.stop());
      voiceStream = null;
      audioContext?.close?.();
      audioContext = null;
      analyser = null;
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

        if (interimText.trim()) interimTranscript = interimText.trim();
        if (finalText.trim()) {
          pendingTranscript = `${pendingTranscript} ${finalText}`.trim();
          interimTranscript = "";
        }
        if (readableTranscript()) transcriptText.textContent = readableTranscript();
        if (finalText.trim() || interimText.trim()) scheduleSpeechSend();
      };
      recognition.onerror = () => {
        aiText.textContent = "I lost microphone access. Click Stop Interview, then start again.";
        setStatus("Ready");
      };
      recognition.onend = () => {
        if (isRecognitionPausedForSpeech) return;

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

    async function startVoiceInput() {
      try {
        await startHighAccuracyVoice();
      } catch {
        aiText.textContent = "High-accuracy voice could not start. Falling back to browser speech recognition.";
        startListening();
      }
    }

    async function startInterview() {
      const problemData = getProblemData();
      startButton.disabled = true;
      setStatus("Creating session");
      try {
        const session = await createInterviewSession(problemData);
        storeSessionId(session.session_id);
        isInterviewActive = true;
        isRecognitionPausedForSpeech = false;
        coveredItems = [];
        updateCoveredItems([]);
        resetSpeechBuffers();
        startButton.textContent = "Stop Interview";
        aiText.textContent = "I'm listening. Start by explaining your first approach before writing code.";
        await startVoiceInput();
      } catch {
        aiText.textContent = "Unable to contact Interview Engine. Start the FastAPI backend, then try again.";
        setStatus("Ready");
      } finally {
        startButton.disabled = false;
      }
    }

    async function stopInterview() {
      isInterviewActive = false;
      isRecognitionPausedForSpeech = false;
      startButton.disabled = true;
      setStatus("Ending interview");
      window.clearTimeout(speechSilenceTimer);
      stopHighAccuracyVoice();
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
    manualSendButton.addEventListener("click", () => {
      const message = manualInput.value.trim();
      if (!message) return;
      manualInput.value = "";
      resetSpeechBuffers();
      sendCandidateMessage(message);
    });
    manualInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        manualSendButton.click();
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
