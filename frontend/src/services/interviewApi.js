// Responsibility: centralize local FastAPI calls for interview session events.

const API_BASE_URL = import.meta.env.VITE_INTERVIEW_API_URL || "http://localhost:8000";
const SESSION_STORAGE_KEY = "shadowInterviewSessionId";
const EXTENSION_SESSION_STORAGE_KEY = "shadowInterview:sessionId";

async function request(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Interview API request failed with status ${response.status}`);
  }

  return response.json();
}

export function getStoredSessionId() {
  return window.localStorage.getItem(SESSION_STORAGE_KEY);
}

export function storeSessionId(sessionId) {
  window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  window.localStorage.setItem(EXTENSION_SESSION_STORAGE_KEY, sessionId);
}

export async function startInterviewSession(problem) {
  const session = await request("/session/start", {
    problem_title: problem.title,
    difficulty: problem.difficulty,
    problem_url: problem.sourceUrl,
    language: "JavaScript",
  });
  storeSessionId(session.session_id);
  return session;
}

export async function updateTranscript(sessionId, transcript) {
  return request("/session/update", {
    session_id: sessionId,
    transcript,
  });
}

export async function fetchInterviewReport(sessionId) {
  const response = await fetch(`${API_BASE_URL}/session/report/${sessionId}`);
  if (!response.ok) {
    throw new Error(`Interview report request failed with status ${response.status}`);
  }
  return response.json();
}

export async function exportInterviewReport(sessionId, format) {
  return request("/session/report/export", {
    session_id: sessionId,
    format,
  });
}

export async function endInterviewSession(sessionId) {
  return request("/session/end", {
    session_id: sessionId,
  });
}
