// Responsibility: render the reusable Shadow Interview microphone brand mark.

export default function BrandMark({ className = "" }) {
  return (
    <span className={`grid size-9 place-items-center rounded-xl bg-violet-500/15 text-violet-300 ring-1 ring-inset ring-violet-300/20 ${className}`}>
      <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
        <path d="M12 3a5 5 0 0 0-5 5v4a5 5 0 0 0 10 0V8a5 5 0 0 0-5-5Zm-7 8a1 1 0 0 0-2 0 9 9 0 0 0 8 8.94V22H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.06A9 9 0 0 0 21 11a1 1 0 1 0-2 0 7 7 0 0 1-14 0Z" />
      </svg>
    </span>
  );
}
