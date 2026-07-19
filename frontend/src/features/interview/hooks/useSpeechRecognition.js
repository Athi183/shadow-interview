// Responsibility: manage browser-native speech recognition for live transcript.

import { useMemo, useRef, useState } from "react";

function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

export default function useSpeechRecognition() {
  const recognitionRef = useRef(null);
  const committedTranscriptRef = useRef("");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [finalResultId, setFinalResultId] = useState(0);
  const [error, setError] = useState("");
  const SpeechRecognition = useMemo(() => (typeof window === "undefined" ? null : getSpeechRecognition()), []);
  const isSupported = Boolean(SpeechRecognition);

  function startRecording() {
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interimText = "";
      let finalText = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result[0]?.transcript || "";
        if (result.isFinal) {
          finalText += text;
        } else {
          interimText += text;
        }
      }

      if (finalText.trim()) {
        const cleanFinalText = finalText.trim();
        committedTranscriptRef.current = `${committedTranscriptRef.current} ${cleanFinalText}`.trim();
        setFinalTranscript(cleanFinalText);
        setFinalResultId((value) => value + 1);
      }

      setTranscript(`${committedTranscriptRef.current} ${interimText}`.trim());
    };

    recognition.onerror = (event) => {
      setError(event.error || "Speech recognition failed.");
      setIsRecording(false);
    };

    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    setError("");
    setIsRecording(true);
    try {
      recognition.start();
    } catch (startError) {
      setError(startError.message || "Speech recognition could not start.");
      setIsRecording(false);
    }
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }

  function retryRecording() {
    stopRecording();
    committedTranscriptRef.current = "";
    setTranscript("");
    setFinalTranscript("");
    setError("");
    startRecording();
  }

  return {
    error,
    finalResultId,
    finalTranscript,
    isRecording,
    isSupported,
    transcript,
    retryRecording,
    startRecording,
    stopRecording,
  };
}
