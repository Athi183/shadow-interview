// Responsibility: show product identity and the current local interview status.

import { Link } from "react-router-dom";
import BrandMark from "../Brand/BrandMark";

export default function Navbar({ status = "Interview in progress" }) {
  return (
    <header className="border-b border-white/7 bg-slate-950/55 backdrop-blur-xl">
      <nav className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between px-5 lg:px-8" aria-label="Primary navigation">
        <Link to="/" className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300">
          <BrandMark />
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-white">Shadow Interview</span>
        </Link>
        <div className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/8 px-3 py-1.5 text-xs font-medium text-emerald-300">
          <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" aria-hidden="true" />
          {status}
        </div>
      </nav>
    </header>
  );
}
