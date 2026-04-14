"use client";

import { useCallback, useEffect, useState } from "react";
import { GameState } from "../useGameState";
import { ArrowRightIcon } from "../../components/gameChrome";

interface Props {
  state: GameState;
  onDone: () => void;
}

export default function PresenterView({ state, onDone }: Props) {
  const totalSeconds = state.presentationMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const finishPresentation = useCallback(() => {
    onDone();
  }, [onDone]);

  useEffect(() => {
    if (!running) return;
    if (secondsLeft <= 0) { finishPresentation(); return; }
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(interval); finishPresentation(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [finishPresentation, running, secondsLeft]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const isUrgent = secondsLeft <= 60;

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
          Presenter mode
        </span>
        <h1 className="rapt-display mb-1 text-3xl tracking-tight text-[var(--color-text-base)]">
          You&apos;re leading the dig
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm">
          Teach the topic. Your partner is listening — no interruptions.
        </p>
      </div>

      {/* Timer */}
      <div className="flex flex-col items-center gap-6 rounded-3xl border-2 border-[var(--color-border)] bg-[var(--color-surface-strong)] p-10">
        <div className={`text-8xl font-black tabular-nums tracking-tight transition-colors ${isUrgent ? "text-[var(--color-primary)]" : "text-[var(--color-text-base)]"}`}>
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${progress}%`,
              background: isUrgent ? "var(--color-primary)" : "#d4956a",
            }}
          />
        </div>

        <div className="text-sm font-medium text-[var(--color-text-muted)]">
          {!running ? "Press start when you're ready" : isUrgent ? "Wrapping up soon..." : "Keep going, you're doing great"}
        </div>

        {!running ? (
          <button
            onClick={() => setRunning(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-primary)] px-10 py-4 text-base font-black text-white shadow-lg shadow-[#c4622d]/20 transition-opacity hover:opacity-90"
          >
            Start presenting
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={finishPresentation}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-[var(--color-border)] bg-white/6 px-10 py-4 text-base font-black text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            I&apos;m done early
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Notes reference */}
      {state.presenterNotes && (
        <div>
          <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
            Your notes (reference)
          </label>
          <div className="max-h-64 overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {state.presenterNotes}
            </p>
          </div>
        </div>
      )}

      {/* Topic reminder */}
      <div className="rounded-2xl border border-[var(--color-primary-muted)] bg-[var(--color-primary-light)] p-5">
        <div className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
          Topic
        </div>
        <div className="font-black text-[var(--color-text-base)]">{state.topic}</div>
      </div>
    </div>
  );
}
