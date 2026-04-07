"use client";

import { useEffect, useState } from "react";
import { GameState } from "../useGameState";

interface Props {
  state: GameState;
  setReDigRecall: (text: string) => void;
  onSubmit: () => void;
}

export default function ReDigPanel({ state, setReDigRecall, onSubmit }: Props) {
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

  useEffect(() => {
    if (!started) return;
    if (secondsLeft <= 0) { handleSubmit(); return; }
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(interval); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, secondsLeft]);

  function handleSubmit() {
    setReDigRecall(text);
    onSubmit();
  }

  return (
    <div className="flex flex-col gap-6 mt-6">
      <div className="rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-primary-light)] p-6">
        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
          Re-dig — missed concepts
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
          <span className="text-6xl">🦴</span>
          <div>
            <p className="mb-2 text-xl font-black text-[var(--color-text-base)]">
              Second chance to excavate
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-[var(--color-text-secondary)]">
              The presenter will re-explain the missed concepts. Then you get 90 seconds to recall them.
            </p>
          </div>
          <button
            onClick={() => setStarted(true)}
            className="rounded-2xl bg-[var(--color-primary)] px-10 py-4 text-base font-black text-white shadow-lg shadow-[#c4622d]/20 transition-opacity hover:opacity-90"
          >
            Start re-dig 🦕
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
                  background: isUrgent ? "var(--color-primary)" : "#d4956a",
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
            className={`w-full rounded-2xl py-4 text-base font-black tracking-tight transition-all ${
              wordCount >= 3
                ? "bg-[var(--color-primary)] text-white shadow-lg shadow-[#c4622d]/20 hover:-translate-y-0.5 hover:opacity-90"
                : "cursor-not-allowed bg-white/8 text-[var(--color-text-muted)]"
            }`}
          >
            Submit re-dig →
          </button>
        </div>
      )}
    </div>
  );
}
