// Responsibility: present a structured visual transcript for the interview workspace.

export default function TranscriptPanel({ segments }) {
  return (
    <section className="glass-card overflow-hidden" aria-labelledby="transcript-heading">
      <header className="flex items-center justify-between border-b border-white/7 px-5 py-4">
        <div>
          <p className="eyebrow">Communication signal</p>
          <h2 id="transcript-heading" className="mt-1 text-base font-semibold text-white">Transcript</h2>
        </div>
        <span className="text-xs font-medium text-slate-500">Live session</span>
      </header>
      <ol className="divide-y divide-white/6 px-5">
        {segments.map((segment) => (
          <li key={segment.timestamp} className="grid grid-cols-[42px_1fr] gap-3 py-4">
            <time className="pt-0.5 font-mono text-[11px] text-slate-500">{segment.timestamp}</time>
            <div>
              <p className="mb-1 text-xs font-semibold text-violet-200">{segment.speaker}</p>
              <p className="text-sm leading-5 text-slate-300">{segment.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
