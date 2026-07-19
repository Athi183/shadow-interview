// Responsibility: compose the complete desktop-first interview workspace page.

import Navbar from "../../components/Navbar/Navbar";
import ProblemPanel from "../../components/ProblemPanel/ProblemPanel";
import InterviewChat from "../../components/InterviewChat/InterviewChat";
import TranscriptPanel from "../../components/TranscriptPanel/TranscriptPanel";
import ProgressTracker from "../../components/ProgressTracker/ProgressTracker";
import { chatMessages, interviewSteps, problem, transcriptSegments } from "../../data/interviewData";

export default function InterviewPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-[1600px] px-5 py-7 lg:px-8 lg:py-9">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="eyebrow">Mock interview workspace</p><h1 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">Two Sum · Reasoning session</h1></div>
          <p className="max-w-md text-sm leading-6 text-slate-400">Take your time, narrate your decisions, and make your thinking observable.</p>
        </div>
        <div className="grid gap-5 xl:grid-cols-[minmax(230px,0.7fr)_minmax(480px,1.45fr)_minmax(280px,0.85fr)]">
          <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start"><ProblemPanel problem={problem} /><ProgressTracker steps={interviewSteps} currentStep={1} /></aside>
          <InterviewChat messages={chatMessages} />
          <aside className="xl:sticky xl:top-6 xl:self-start"><TranscriptPanel segments={transcriptSegments} /></aside>
        </div>
        <div className="mt-7 flex justify-end border-t border-white/7 pt-6">
          <button type="button" className="w-full rounded-xl border border-rose-300/20 bg-rose-400/10 px-5 py-3.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/18 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-300 sm:w-auto">Finish Interview</button>
        </div>
      </main>
    </div>
  );
}
