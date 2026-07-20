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
  const safeItems = items?.length ? items : ["No data captured for this section yet."];
  return (
    <section className="glass-card p-5">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <ul className="mt-4 space-y-3">
        {safeItems.map((item) => <li key={item} className="text-sm leading-6 text-slate-300">{item}</li>)}
      </ul>
    </section>
  );
}

function TimelineReplay({ events }) {
  const safeEvents = events?.length ? events : [];

  return (
    <section className="glass-card mt-5 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Timeline replay</p>
          <h2 className="mt-1 text-base font-semibold text-white">What happened during this interview</h2>
        </div>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
          {safeEvents.length} events
        </span>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {safeEvents.map((event) => (
          <article key={`${event.timestamp}-${event.label}-${event.detail}`} className="rounded-lg border border-white/8 bg-slate-900/60 p-4">
            <p className="text-xs font-semibold text-cyan-200">{event.timestamp} · {event.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{event.detail}</p>
          </article>
        ))}
        {!safeEvents.length && <p className="text-sm text-slate-400">No timeline events were captured for this report.</p>}
      </div>
    </section>
  );
}

export default function EvaluationDashboard({ report, onDownloadJson, onDownloadMarkdown, onRestart }) {
  const scores = report.scores;
  const problem = report.problem || {};
  const recommendations = report.recommendations || {};
  const suggestedProblems = recommendations.suggested_next_problems || [];

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
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1 text-xs font-semibold text-slate-300">
                  {problem.title || "Unknown problem"}
                </span>
                <span className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1 text-xs font-semibold text-slate-300">
                  {problem.difficulty || "Unknown difficulty"}
                </span>
                <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1 text-xs font-semibold text-violet-100">
                  Focus: {recommendations.problem_focus || "general interview"}
                </span>
              </div>
              <p className="whitespace-pre-line text-sm leading-6 text-slate-300">{report.gpt_feedback}</p>
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
              {(recommendations.leetcode_patterns || []).map((pattern) => <span key={pattern} className="rounded-md bg-slate-800 px-2.5 py-1 text-xs text-slate-300">{pattern}</span>)}
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">{recommendations.difficulty_progression}</p>
            {!!suggestedProblems.length && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Suggested next problems</p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {suggestedProblems.map((problemName) => (
                    <li key={problemName} className="rounded-md border border-white/8 bg-slate-900/60 px-3 py-2 text-xs text-slate-300">{problemName}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <ListSection title="Strengths" items={report.strengths} />
          <ListSection title="Weaknesses" items={report.weaknesses} />
          <ListSection title="Key Observations" items={report.key_observations} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <ListSection title="Interviewer Questions Covered" items={report.interviewer_questions} />
          <ListSection title="Topics to Practice" items={recommendations.topics} />
        </div>

        <TimelineReplay events={report.timeline} />

        <section className="glass-card mt-5 p-5">
          <h2 className="text-base font-semibold text-white">Learning Roadmap</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {(recommendations.four_week_roadmap || []).map((week) => (
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
