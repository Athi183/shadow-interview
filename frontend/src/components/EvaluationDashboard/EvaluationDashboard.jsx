// Responsibility: render the final interview evaluation dashboard.

function downloadText(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function ScoreCard({ label, value }) {
  return (
    <article className="rounded-lg border border-white/8 bg-slate-900/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold text-white">{value}</p>
        <span className="text-sm text-slate-500">/100</span>
      </div>
      <div className="mt-4 h-2 rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-cyan-300" style={{ width: `${value}%` }} />
      </div>
    </article>
  );
}

function BarChart({ scores }) {
  return (
    <section className="glass-card p-5">
      <p className="eyebrow">Performance chart</p>
      <h2 className="mt-1 text-base font-semibold text-white">Skill distribution</h2>
      <div className="mt-5 space-y-3">
        {Object.entries(scores).map(([key, value]) => (
          <div key={key}>
            <div className="mb-1 flex justify-between text-xs text-slate-400">
              <span>{key.replaceAll("_", " ")}</span>
              <span>{value}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-violet-300" style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ListSection({ title, items }) {
  return (
    <section className="glass-card p-5">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => <li key={item} className="text-sm leading-6 text-slate-300">{item}</li>)}
      </ul>
    </section>
  );
}

export default function EvaluationDashboard({ report, onDownloadJson, onDownloadMarkdown, onRestart }) {
  const scores = report.scores;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto max-w-[1500px] px-5 py-8 lg:px-8">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Final evaluation</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Shadow Interview Report</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950" onClick={onDownloadMarkdown}>Download Markdown</button>
            <button type="button" className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100" onClick={onDownloadJson}>Download JSON</button>
            <button type="button" className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-100" onClick={onRestart}>Restart Interview</button>
          </div>
        </div>

        <section className="glass-card mb-5 p-6">
          <div className="grid gap-5 md:grid-cols-[1fr_220px] md:items-center">
            <div>
              <p className="text-sm leading-6 text-slate-300">{report.gpt_feedback}</p>
              <p className="mt-4 text-sm text-slate-500">Interview readiness: {report.interview_readiness}%</p>
            </div>
            <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">Overall Score</p>
              <p className="mt-2 text-5xl font-semibold text-white">{report.overall_score}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(scores).slice(0, 4).map(([key, value]) => <ScoreCard key={key} label={key.replaceAll("_", " ")} value={value} />)}
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
          <BarChart scores={scores} />
          <section className="glass-card p-5">
            <h2 className="text-base font-semibold text-white">Recommendations</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {report.recommendations.leetcode_patterns.map((pattern) => <span key={pattern} className="rounded-md bg-slate-800 px-2.5 py-1 text-xs text-slate-300">{pattern}</span>)}
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">{report.recommendations.difficulty_progression}</p>
          </section>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <ListSection title="Strengths" items={report.strengths} />
          <ListSection title="Weaknesses" items={report.weaknesses} />
          <ListSection title="Key Observations" items={report.key_observations} />
        </div>

        <section className="glass-card mt-5 p-5">
          <h2 className="text-base font-semibold text-white">Learning Roadmap</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {report.recommendations.four_week_roadmap.map((week) => (
              <article key={week.week} className="rounded-lg border border-white/8 bg-slate-900/60 p-4">
                <p className="text-xs font-semibold text-cyan-200">{week.week}</p>
                <h3 className="mt-2 text-sm font-semibold text-white">{week.focus}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-400">{week.goal}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export { downloadText };
