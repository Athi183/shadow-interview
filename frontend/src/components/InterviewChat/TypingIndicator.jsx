// Responsibility: show the interviewer's quiet, animated reviewing state.

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-400" aria-label="Interviewer is reviewing your answer">
      <span className="flex gap-1" aria-hidden="true">
        <span className="typing-dot" />
        <span className="typing-dot [animation-delay:150ms]" />
        <span className="typing-dot [animation-delay:300ms]" />
      </span>
      Interviewer is reviewing your answer
    </div>
  );
}
