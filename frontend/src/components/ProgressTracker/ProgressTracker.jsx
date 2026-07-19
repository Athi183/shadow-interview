// Responsibility: render a reusable vertical interview lifecycle stepper.

export default function ProgressTracker({ stages, currentStage }) {
  const currentIndex = Math.max(stages.findIndex((stage) => stage.id === currentStage), 0);

  return (
    <section className="glass-card p-5" aria-labelledby="progress-heading">
      <p className="eyebrow">Interview progress</p>
      <h2 id="progress-heading" className="mt-1 text-base font-semibold text-white">Your interview flow</h2>
      <ol className="mt-6">
        {stages.map((stage, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li key={stage.id} className="relative flex gap-3 pb-6 last:pb-0">
              {index < stages.length - 1 && <span className={`absolute left-[9px] top-5 h-[calc(100%-12px)] w-px ${isComplete ? "bg-violet-400" : "bg-slate-700"}`} aria-hidden="true" />}
              <span className={`relative z-10 mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border text-[9px] font-bold ${isCurrent ? "border-violet-300 bg-violet-400 text-white shadow-[0_0_0_4px_rgba(139,92,246,0.16)]" : isComplete ? "border-violet-400 bg-violet-400 text-white" : "border-slate-600 bg-slate-900 text-slate-500"}`}>
                {isComplete ? "OK" : index + 1}
              </span>
              <div className="-mt-0.5">
                <p className={`text-sm font-medium ${isCurrent ? "text-violet-100" : isComplete ? "text-slate-200" : "text-slate-500"}`}>{stage.label}</p>
                {isCurrent && <p className="mt-1 text-xs text-violet-300/75">Current focus</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
