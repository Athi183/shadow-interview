// Responsibility: display the current interview problem context passed from the
// extension, including its source URL when available.

function DifficultyBadge({ difficulty }) {
  const isUnknown = difficulty === "Unknown";
  const badgeClassName = isUnknown
    ? "border-slate-500/25 bg-slate-700/40 text-slate-300"
    : "border-emerald-300/15 bg-emerald-300/10 text-emerald-300";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClassName}`}>
      {difficulty}
    </span>
  );
}

export default function ProblemPanel({ problem }) {
  return (
    <section className="glass-card p-5" aria-labelledby="problem-heading">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Interview problem</p>
          <h2 id="problem-heading" className="mt-2 text-xl font-semibold text-white">{problem.title}</h2>
        </div>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>
      <p className="text-sm leading-6 text-slate-300">{problem.description}</p>
      <div className="mt-5 rounded-lg border border-white/8 bg-slate-900/55 p-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Problem URL</p>
        {problem.sourceUrl ? (
          <a
            className="mt-1 block truncate text-sm font-medium text-cyan-200 transition hover:text-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
            href={problem.sourceUrl}
            target="_blank"
            rel="noreferrer"
            title={problem.sourceUrl}
          >
            {problem.sourceUrl}
          </a>
        ) : (
          <p className="mt-1 text-sm font-medium text-slate-400">No problem selected.</p>
        )}
      </div>
      <div className="mt-5 flex flex-wrap gap-2" aria-label="Problem tags">
        {problem.tags.map((tag) => <span key={tag} className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">{tag}</span>)}
      </div>
    </section>
  );
}
