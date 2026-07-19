// Responsibility: render a chronological view of notable interview moments.

export default function InterviewTimeline({ events }) {
  return (
    <section className="glass-card p-5" aria-labelledby="timeline-heading">
      <p className="eyebrow">Interview timeline</p>
      <h2 id="timeline-heading" className="mt-1 text-base font-semibold text-white">Session moments</h2>
      <ol className="mt-6 space-y-4">
        {events.map((event) => (
          <li key={event.id} className="grid grid-cols-[3.25rem_1fr] gap-3">
            <time className="pt-0.5 text-xs font-semibold text-cyan-200" dateTime={event.timestamp}>
              {event.timestamp}
            </time>
            <div className="rounded-lg border border-white/8 bg-slate-900/55 p-3">
              <p className="text-sm font-semibold text-white">{event.title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{event.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
