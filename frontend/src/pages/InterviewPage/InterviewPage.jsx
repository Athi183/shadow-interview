// Responsibility: compose the complete desktop-first interview workspace page.

import Navbar from "../../components/Navbar/Navbar";
import ProblemPanel from "../../components/ProblemPanel/ProblemPanel";
import InterviewChat from "../../components/InterviewChat/InterviewChat";
import InterviewTimeline from "../../components/InterviewTimeline/InterviewTimeline";
import TranscriptPanel from "../../components/TranscriptPanel/TranscriptPanel";
import ProgressTracker from "../../components/ProgressTracker/ProgressTracker";
import {
  chatMessages,
  currentInterviewStage,
  interviewStages,
  timelineEvents,
  transcriptSegments,
} from "../../data/interviewData";
import useInterviewProblem from "../../features/interview/hooks/useInterviewProblem";

export default function InterviewPage() {
  const problem = useInterviewProblem();
  const pageTitle = problem.isSelected ? `${problem.title} reasoning session` : "Interview workspace";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-[1600px] px-5 py-7 lg:px-8 lg:py-9">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Mock interview workspace</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">{pageTitle}</h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-400">
            Take your time, narrate your decisions, and make your thinking observable.
          </p>
        </div>
        <div className="grid gap-5 xl:grid-cols-[minmax(230px,0.7fr)_minmax(480px,1.45fr)_minmax(280px,0.85fr)]">
          <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
            <ProblemPanel problem={problem} />
            <ProgressTracker stages={interviewStages} currentStage={currentInterviewStage} />
          </aside>
          <InterviewChat messages={chatMessages} />
          <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
            <TranscriptPanel segments={transcriptSegments} />
            <InterviewTimeline events={timelineEvents} />
          </aside>
        </div>
        <div className="mt-7 flex justify-end border-t border-white/7 pt-6">
          <button
            type="button"
            className="w-full rounded-xl border border-rose-300/20 bg-rose-400/10 px-5 py-3.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/18 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-300 sm:w-auto"
          >
            Finish Interview
          </button>
        </div>
      </main>
    </div>
  );
}
