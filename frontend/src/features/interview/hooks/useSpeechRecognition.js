// Responsibility: manage browser-native speech recognition for live transcript.

import { useMemo, useRef, useState } from "react";

function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

export default function useSpeechRecognition() {
  const recognitionRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
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
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();
      setTranscript(text);
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
    setTranscript("");
    setError("");
    startRecording();
  }

  return {
    error,
    isRecording,
    isSupported,
    transcript,
    retryRecording,
    startRecording,
    stopRecording,
  };
}
