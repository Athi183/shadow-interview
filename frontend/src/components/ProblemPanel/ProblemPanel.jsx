// Responsibility: display the current interview problem's fixed UI context.

function DifficultyBadge({ difficulty }) {
  return <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">{difficulty}</span>;
}

export default function ProblemPanel({ problem }) {
  return (
    <section className="glass-card p-5" aria-labelledby="problem-heading">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Interview problem</p>
          <h2 id="problem-heading" className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">{problem.title}</h2>
        </div>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>
      <p className="text-sm leading-6 text-slate-300">{problem.description}</p>
      <div className="mt-5 flex flex-wrap gap-2" aria-label="Problem tags">
        {problem.tags.map((tag) => <span key={tag} className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">{tag}</span>)}
      </div>
    </section>
  );
}
