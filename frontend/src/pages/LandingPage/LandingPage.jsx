// Responsibility: introduce Shadow Interview and route users into the workspace.

import { Link } from "react-router-dom";
import BrandMark from "../../components/Brand/BrandMark";

const highlights = ["Reason in public", "Receive structured challenge", "Reflect with clarity"];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 px-5 text-slate-100">
      <div className="hero-glow pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col">
        <header className="flex h-20 items-center">
          <div className="flex items-center gap-3"><BrandMark /><span className="font-semibold tracking-[-0.02em] text-white">Shadow Interview</span></div>
        </header>
        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="inline-flex rounded-full border border-violet-300/15 bg-violet-400/8 px-3 py-1.5 text-xs font-semibold text-violet-200">A reasoning-first interview workspace</p>
            <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[1.03] tracking-[-0.055em] text-white sm:text-6xl">Practice the conversation behind great code.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">Shadow Interview helps you articulate trade-offs, test assumptions, and practice the signals that matter in real technical interviews.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/interview" className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(124,58,237,0.3)] transition hover:-translate-y-0.5 hover:bg-violet-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300">Enter interview workspace</Link>
              <span className="px-2 py-3 text-sm text-slate-500">No account required for this UI preview</span>
            </div>
          </div>
          <div className="glass-card relative p-6 shadow-2xl shadow-violet-950/25">
            <div className="mb-8 flex items-center justify-between"><span className="text-sm font-medium text-white">Session signal</span><span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.9)]" /></div>
            <div className="space-y-6">
              {highlights.map((highlight, index) => <div key={highlight} className="flex items-center gap-4"><span className="grid size-8 place-items-center rounded-lg border border-white/10 bg-slate-800 text-xs font-bold text-violet-200">0{index + 1}</span><span className="text-sm text-slate-300">{highlight}</span></div>)}
            </div>
            <div className="mt-9 rounded-xl border border-white/8 bg-slate-950/55 p-4"><p className="text-xs leading-5 text-slate-400">“Explain your first approach before writing any code.”</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}
