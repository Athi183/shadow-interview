// Responsibility: connect finalized speech to the backend interviewer loop and
// manage voice, timeline, stage, and speech-synthesis state.

import { useEffect, useMemo, useRef, useState } from "react";
import { sendCandidateMessage } from "../../../services/interviewApi";

export const VOICE_STATES = {
  idle: "Idle",
  listening: "Listening",
  processing: "Processing",
  speaking: "AI Speaking",
  ready: "Ready",
};

function normalizeTimelineEvent(event, fallbackIndex) {
  return {
    id: `${event.timestamp || "00:00"}-${event.label || fallbackIndex}`,
    timestamp: event.timestamp || "00:00",
    type: "TIMELINE_EVENT",
    title: event.label || "Interview Event",
    detail: event.detail || "",
  };
}

function friendlyError(error) {
  if (!navigator.onLine || error instanceof TypeError) {
    return "Unable to contact Interview Engine.";
  }
  if (error.status === 502 || error.status === 503) {
    return "The AI interviewer could not respond yet. Please check your OpenAI key and try again.";
  }
  return "Something went wrong while contacting the interviewer. Please retry.";
}

export default function useInterviewController({ initialInterview, initialStage, sessionId, speech }) {
  const processedFinalIdRef = useRef(0);
  const [aiQuestion, setAiQuestion] = useState(initialInterview.aiQuestion);
  const [candidateResponse, setCandidateResponse] = useState(initialInterview.candidateResponse);
  const [currentStage, setCurrentStage] = useState(initialStage);
  const [events, setEvents] = useState(initialInterview.recentEvents);
  const [voiceState, setVoiceState] = useState(VOICE_STATES.idle);
  const [error, setError] = useState("");

  useEffect(() => {
    if (speech.isRecording) {
      setVoiceState(VOICE_STATES.listening);
    } else if (voiceState === VOICE_STATES.listening) {
      setVoiceState(VOICE_STATES.ready);
    }
  }, [speech.isRecording, voiceState]);

  useEffect(() => {
    if (!sessionId || !speech.finalTranscript || speech.finalResultId === processedFinalIdRef.current) return;

    processedFinalIdRef.current = speech.finalResultId;
    submitCandidateMessage(speech.finalTranscript);
  }, [sessionId, speech.finalResultId, speech.finalTranscript]);

  async function submitCandidateMessage(candidateMessage) {
    setError("");
    setVoiceState(VOICE_STATES.processing);
    setCandidateResponse(candidateMessage);

    try {
      const response = await sendCandidateMessage({
        sessionId,
        candidateMessage,
        currentStage,
      });
      setAiQuestion(response.ai_response);
      setCurrentStage(response.current_stage);
      setEvents(response.timeline.map(normalizeTimelineEvent));
      speakAiResponse(response.ai_response);
    } catch (requestError) {
      setError(friendlyError(requestError));
      setVoiceState(VOICE_STATES.ready);
    }
  }

  function speakAiResponse(text) {
    if (!window.speechSynthesis || !text) {
      setVoiceState(VOICE_STATES.ready);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setVoiceState(VOICE_STATES.speaking);
    utterance.onend = () => setVoiceState(speech.isRecording ? VOICE_STATES.listening : VOICE_STATES.ready);
    utterance.onerror = () => setVoiceState(VOICE_STATES.ready);
    window.speechSynthesis.speak(utterance);
  }

  const interview = useMemo(() => ({
    aiQuestion,
    candidateResponse,
    currentStage,
    recentEvents: events,
    voiceState,
  }), [aiQuestion, candidateResponse, currentStage, events, voiceState]);

  return {
    currentStage,
    error,
    interview,
    voiceState,
  };
}
