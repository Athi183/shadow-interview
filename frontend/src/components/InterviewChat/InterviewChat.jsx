// Responsibility: render the scrollable Interview Room conversation and keep
// its latest content in view when the conversation changes.

import { useEffect, useRef } from "react";
import BrandMark from "../Brand/BrandMark";
import TypingIndicator from "./TypingIndicator";

function ChatBubble({ message }) {
  const isInterviewer = message.role === "interviewer";
  return (
    <article className={`flex gap-3 ${isInterviewer ? "justify-start" : "justify-end"}`}>
      {isInterviewer && <BrandMark className="mt-1 shrink-0" />}
      <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${isInterviewer ? "border border-white/8 bg-slate-800/80 text-slate-200 shadow-sm" : "bg-violet-500 text-white shadow-[0_10px_30px_rgba(124,58,237,0.2)]"}`}>
        {message.content}
      </div>
    </article>
  );
}

export default function InterviewChat({ messages }) {
  const scrollEndRef = useRef(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <section className="glass-card flex min-h-[470px] flex-col overflow-hidden" aria-labelledby="interview-room-heading">
      <header className="flex items-center justify-between border-b border-white/7 px-5 py-4">
        <div>
          <p className="eyebrow">Live conversation</p>
          <h2 id="interview-room-heading" className="mt-1 text-base font-semibold text-white">🎤 Interview Room</h2>
        </div>
        <span className="rounded-full bg-violet-400/10 px-2.5 py-1 text-xs font-medium text-violet-200">Reasoning first</span>
      </header>
      <div className="thin-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto p-5" aria-live="polite">
        {messages.map((message) => <ChatBubble key={message.id} message={message} />)}
        <TypingIndicator />
        <div ref={scrollEndRef} />
      </div>
      <div className="border-t border-white/7 bg-slate-950/25 px-5 py-3 text-xs text-slate-500">Focus on how you reason, not just the answer.</div>
    </section>
  );
}
