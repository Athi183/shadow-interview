// Responsibility: render the live interview timeline surface that replaces a
// plain chatbot-style conversation.

import { useEffect, useRef } from "react";
import BrandMark from "../Brand/BrandMark";

function EventCard({ event }) {
  return (
    <article className="grid grid-cols-[4rem_1fr] gap-3">
      <time className="pt-3 text-xs font-semibold text-cyan-200" dateTime={event.timestamp}>
        {event.timestamp}
      </time>
      <div className="rounded-lg border border-white/8 bg-slate-900/60 p-4 transition hover:border-cyan-300/20">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-white">{event.title}</p>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {event.type}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-400">{event.detail}</p>
      </div>
    </article>
  );
}

function ResponsePanel({ label, children, tone = "neutral" }) {
  const toneClassName = tone === "ai"
    ? "border-cyan-300/16 bg-cyan-300/8"
    : "border-violet-300/16 bg-violet-300/8";

  return (
    <section className={`rounded-lg border p-4 ${toneClassName}`}>
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-100">{children}</p>
    </section>
  );
}

export default function LiveInterviewTimeline({ interview }) {
  const scrollEndRef = useRef(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [interview]);

  return (
    <section className="glass-card flex min-h-[540px] flex-col overflow-hidden" aria-labelledby="live-timeline-heading">
      <header className="flex items-center justify-between border-b border-white/7 px-5 py-4">
        <div className="flex items-center gap-3">
          <BrandMark className="shrink-0" />
          <div>
            <p className="eyebrow">Live orchestration</p>
            <h2 id="live-timeline-heading" className="mt-1 text-base font-semibold text-white">Interview Timeline</h2>
          </div>
        </div>
        <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-200">
          {interview.currentStage}
        </span>
      </header>

      <div className="grid gap-4 border-b border-white/7 p-5 lg:grid-cols-2">
        <ResponsePanel label="AI Question" tone="ai">{interview.aiQuestion}</ResponsePanel>
        <ResponsePanel label="Candidate Response" tone="candidate">{interview.candidateResponse}</ResponsePanel>
      </div>

      <div className="thin-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto p-5" aria-live="polite">
        {interview.recentEvents.map((event) => <EventCard key={event.id} event={event} />)}
        <div ref={scrollEndRef} />
      </div>
      <div className="border-t border-white/7 bg-slate-950/25 px-5 py-3 text-xs text-slate-500">Awaiting next interview signal.</div>
    </section>
  );
}
