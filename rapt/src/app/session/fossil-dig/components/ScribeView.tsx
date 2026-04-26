"use client";

import { useCallback, useEffect, useState } from "react";
import { GameState } from "../useGameState";
import { ArrowRightIcon, ListenerIcon, PlayerAvatar } from "../../components/gameChrome";

interface Props {
  state: GameState;
  partnerName: string;
  setScribeRecall: (text: string) => void;
  onSubmit: () => void;
}

export default function ScribeView({ state, partnerName, setScribeRecall, onSubmit }: Props) {
  const recallMinutes = state.presentationMinutes <= 5 ? 3 : state.presentationMinutes <= 10 ? 4 : 5;
  const totalSeconds = recallMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [text, setText] = useState("");
  const [started, setStarted] = useState(false);
  const partnerFirst = partnerName.split(" ")[0];

  const handleSubmit = useCallback(() => {
    setScribeRecall(text);
    onSubmit();
  }, [onSubmit, setScribeRecall, text]);

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

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const isUrgent = secondsLeft <= 60;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
          Recall mode
        </span>
        <h1 className="rapt-display mb-1 text-3xl tracking-tight text-[var(--color-text-base)]">
          Capture everything you remember
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm">
          Write down everything from {partnerFirst}&apos;s presentation. No notes, no hints — pure recall.
        </p>
      </div>

      {/* Partner "just presented" indicator */}
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-5 py-4">
        <PlayerAvatar name={partnerName} size="md" />
        <div className="flex-1">
          <div className="text-sm font-bold text-[var(--color-text-base)]">{partnerFirst} just finished presenting</div>
          <div className="text-xs text-[var(--color-text-muted)]">Now it&apos;s your turn — recall everything they taught</div>
        </div>
        <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold text-amber-500">Your turn</span>
      </div>

      {/* Topic reminder */}
      <div className="rounded-2xl border border-[var(--color-primary-muted)] bg-[var(--color-primary-light)] p-5">
        <div className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
          Topic
        </div>
        <div className="font-black text-[var(--color-text-base)]">{state.topic}</div>
      </div>

      {!started ? (
        /* Pre-recall screen */
        <div className="flex flex-col items-center gap-6 rounded-3xl border-2 border-[var(--color-border)] bg-[var(--color-surface-strong)] p-10 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/10 bg-white/5 text-[var(--color-text-base)]">
            <ListenerIcon className="h-8 w-8" />
          </span>
          <div>
            <p className="mb-2 text-xl font-black text-[var(--color-text-base)]">
              Ready to recall?
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-[var(--color-text-secondary)]">
              You have {recallMinutes} minutes to write down everything you remember from {partnerFirst}&apos;s presentation. No peeking at notes.
            </p>
          </div>
          <button
            onClick={() => setStarted(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-action-bg)] px-10 py-4 text-base font-black text-white shadow-lg shadow-black/20 transition-opacity hover:opacity-90"
          >
            Start recall
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      ) : (
        /* Active recall screen */
        <div className="flex flex-col gap-4">
          {/* Timer bar */}
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
            placeholder={`Write everything you remember from ${partnerFirst}'s presentation — concepts, definitions, examples, anything.`}
            className="min-h-[280px] w-full resize-none rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface-strong)] px-6 py-5 text-sm leading-relaxed text-[var(--color-text-base)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
          />

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={wordCount < 5}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black tracking-tight transition-all ${
              wordCount >= 5
                ? "bg-[var(--color-action-bg)] text-white shadow-lg shadow-black/20 hover:-translate-y-0.5 hover:opacity-90"
                : "cursor-not-allowed bg-white/8 text-[var(--color-text-muted)]"
            }`}
          >
            Submit recall
            <ArrowRightIcon className="h-5 w-5" />
          </button>
          <p className="text-center text-xs text-[var(--color-text-muted)]">
            {wordCount < 5 ? `Write at least 5 words to submit` : "Submit when you're done or wait for the timer"}
          </p>
        </div>
      )}
    </div>
  );
}
