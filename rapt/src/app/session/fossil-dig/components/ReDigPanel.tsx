"use client";

import { useCallback, useEffect, useState } from "react";
import { GameState } from "../useGameState";
import { ArrowRightIcon, FossilDigIcon, PlayerAvatar } from "../../components/gameChrome";

interface Props {
  state: GameState;
  partnerName: string;
  setReDigRecall: (text: string) => void;
  onSubmit: () => void;
}

export default function ReDigPanel({ state, partnerName, setReDigRecall, onSubmit }: Props) {
  const [text, setText] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [started, setStarted] = useState(false);

  const missedConcepts = state.analysis?.missedConcepts ?? [];
  const reDigPrompt = state.analysis?.reDigPrompt ?? "";
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isUrgent = secondsLeft <= 30;
  const progress = ((90 - secondsLeft) / 90) * 100;
  const partnerFirst = partnerName.split(" ")[0];

  const presenterLabel = state.role === "presenter" ? "You" : partnerFirst;
  const scribeLabel = state.role === "scribe" ? "You" : partnerFirst;

  const handleSubmit = useCallback(() => {
    setReDigRecall(text);
    onSubmit();
  }, [onSubmit, setReDigRecall, text]);

  useEffect(() => {
    if (!started) return;
    if (secondsLeft <= 0) { handleSubmit(); return; }
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(interval); handleSubmit(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [handleSubmit, secondsLeft, started]);

  return (
    <div className="flex flex-col gap-6 mt-6">
      <div className="rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-primary-light)] p-6">
        <div className="mb-3 flex items-center gap-3">
          <PlayerAvatar name={state.role === "presenter" ? "You" : partnerName} you={state.role === "presenter"} size="sm" />
          <span className="text-[11px] text-[var(--color-text-muted)]">→ re-explains →</span>
          <PlayerAvatar name={state.role === "scribe" ? "You" : partnerName} you={state.role === "scribe"} size="sm" />
          <div className="ml-1 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
            Re-dig — missed concepts
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {missedConcepts.map((c) => (
            <span key={c} className="rounded-full border border-[var(--color-primary-muted)] bg-[rgba(255,255,255,0.08)] px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
              {c}
            </span>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {reDigPrompt}
        </p>
      </div>

      {!started ? (
        <div className="flex flex-col items-center gap-6 rounded-3xl border-2 border-[var(--color-border)] bg-[var(--color-surface-strong)] p-10 text-center">
          <div className="flex items-center gap-3">
            <PlayerAvatar name={state.role === "presenter" ? "You" : partnerName} you={state.role === "presenter"} size="lg" />
            <FossilDigIcon className="h-6 w-6 text-[var(--color-primary)]" />
            <PlayerAvatar name={state.role === "scribe" ? "You" : partnerName} you={state.role === "scribe"} size="lg" />
          </div>
          <div>
            <p className="mb-2 text-xl font-black text-[var(--color-text-base)]">
              Second chance to excavate
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {presenterLabel === "You" ? "Re-explain" : `${presenterLabel} will re-explain`} the missed concepts. Then {scribeLabel === "You" ? "you get" : `${scribeLabel} gets`} 90 seconds to recall them.
            </p>
          </div>
          <button
            onClick={() => setStarted(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-action-bg)] px-10 py-4 text-base font-black text-white shadow-lg shadow-black/20 transition-opacity hover:opacity-90"
          >
            Start re-dig
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Timer */}
          <div className="flex items-center gap-4 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface-strong)] px-6 py-4">
            <div className={`text-3xl font-black tabular-nums tracking-tight transition-colors ${isUrgent ? "text-[var(--color-primary)]" : "text-[var(--color-text-base)]"}`}>
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </div>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${progress}%`,
                  background: isUrgent ? "var(--color-primary)" : "var(--color-action-bg)",
                }}
              />
            </div>
            <div className="text-sm font-medium tabular-nums text-[var(--color-text-muted)]">
              {wordCount} words
            </div>
          </div>

          {/* Text area */}
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Now recall the missed concepts — in your own words..."
            className="min-h-[200px] w-full resize-none rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface-strong)] px-6 py-5 text-sm leading-relaxed text-[var(--color-text-base)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
          />

          <button
            onClick={handleSubmit}
            disabled={wordCount < 3}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black tracking-tight transition-all ${
              wordCount >= 3
                ? "bg-[var(--color-action-bg)] text-white shadow-lg shadow-black/20 hover:-translate-y-0.5 hover:opacity-90"
                : "cursor-not-allowed bg-white/8 text-[var(--color-text-muted)]"
            }`}
          >
            Submit re-dig
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
