// Responsibility: present live speech transcript controls and transcript text.

export default function TranscriptPanel({
  error,
  isRecording,
  isSupported,
  liveTranscript,
  onRetry,
  onStart,
  onStop,
  segments,
}) {
  return (
    <section className="glass-card overflow-hidden" aria-labelledby="transcript-heading">
      <header className="flex items-center justify-between border-b border-white/7 px-5 py-4">
        <div>
          <p className="eyebrow">Communication signal</p>
          <h2 id="transcript-heading" className="mt-1 text-base font-semibold text-white">Transcript</h2>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isRecording ? "bg-rose-400/10 text-rose-200" : "bg-slate-800 text-slate-400"}`}>
          {isRecording ? "Recording" : "Idle"}
        </span>
      </header>

      <div className="space-y-3 border-b border-white/7 px-5 py-4">
        <div className="grid grid-cols-3 gap-2">
          <button type="button" className="rounded-lg bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/16 disabled:cursor-not-allowed disabled:opacity-40" onClick={onStart} disabled={!isSupported || isRecording}>Start</button>
          <button type="button" className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40" onClick={onStop} disabled={!isSupported || !isRecording}>Stop</button>
          <button type="button" className="rounded-lg bg-violet-300/10 px-3 py-2 text-xs font-semibold text-violet-100 transition hover:bg-violet-300/16 disabled:cursor-not-allowed disabled:opacity-40" onClick={onRetry} disabled={!isSupported}>Retry</button>
        </div>
        {!isSupported && <p className="text-xs leading-5 text-amber-200">Web Speech API is unavailable in this browser.</p>}
        {error && <p className="text-xs leading-5 text-rose-200">{error}</p>}
        <div className="rounded-lg border border-white/8 bg-slate-900/55 p-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Live Transcript</p>
          <p className="mt-2 min-h-16 text-sm leading-6 text-slate-200">{liveTranscript || "Start recording to capture spoken reasoning."}</p>
        </div>
      </div>

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
