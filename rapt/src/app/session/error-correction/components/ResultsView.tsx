"use client";

import { ErrorGameState } from "../useErrorGameState";
import { CheckCircleIcon, RefreshIcon, SparkIcon, StoneIcon, TrophyIcon } from "../../components/gameChrome";

interface Props {
  state: ErrorGameState;
  onRetry: () => void;
}

export default function ResultsView({ state, onRetry }: Props) {
  // If results aren't loaded yet, don't render
  if (!state.results) return null;

  const { results, sentences, userComments, totalErrors } = state;
  const pct = Math.round((results.score / totalErrors) * 100);
  const ScoreIcon = pct === 100 ? TrophyIcon : pct >= 70 ? SparkIcon : ProofreaderResultIcon;

  return (
    <div className="flex flex-col gap-8">
      
      {/* 1. Score Banner */}
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-[var(--color-border)] bg-[var(--color-surface-strong)] p-10 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[28px] border border-[var(--color-primary-muted)] bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-[var(--shadow-primary)]">
          <ScoreIcon className="h-10 w-10" />
        </div>
        <h2 className="rapt-display mb-2 text-4xl text-[var(--color-text-base)]">
          Score: {results.score} / {totalErrors}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {pct === 100 ? "Flawless investigation!" : "Great effort! Review the corrections below."}
        </p>
      </div>

      {/* 2. Side-by-Side Comparison */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left: Incorrect Version */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-6 shadow-sm">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-red-400">
            Original (With Errors)
          </h3>
          <p className="text-[15px] leading-loose text-[var(--color-text-base)]">
            {sentences.map((s) => {
              const userFlagged = !!userComments[s.id];
              return (
                <span 
                  key={s.id} 
                  className={`inline transition-colors ${
                    s.isError 
                      ? "bg-red-500/20 text-red-200 border-b border-red-500/50 px-1 rounded" 
                      : userFlagged 
                      ? "bg-amber-500/20 text-amber-200 border-b border-amber-500/50 px-1 rounded" // Highlight false positives
                      : ""
                  }`}
                >
                  {s.text}{" "}
                </span>
              );
            })}
          </p>
        </div>

        {/* Right: Corrected Version */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-6 shadow-sm">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-green-400">
            Corrected Version
          </h3>
          <p className="text-[15px] leading-loose text-[var(--color-text-base)]">
            {sentences.map((s) => (
              <span 
                key={s.id} 
                className={`inline transition-colors ${
                  s.isError ? "bg-green-500/20 text-green-200 border-b border-green-500/50 px-1 rounded" : ""
                }`}
              >
                {s.correctText || s.text}{" "}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* 3. Detailed Explanations */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold text-[var(--color-text-base)]">Error Explanations</h3>
        
        {results.feedback.map((fb) => {
          const sentence = sentences.find((s) => s.id === fb.sentenceId);
          const comment = userComments[fb.sentenceId];
          const FeedbackIcon = fb.isCorrect ? CheckCircleIcon : StoneIcon;
          if (!sentence) return null;

          return (
            <div 
              key={fb.sentenceId} 
              className={`rounded-2xl border-l-4 p-5 ${
                fb.isCorrect 
                  ? "border-l-green-500 bg-green-500/10" 
                  : "border-l-red-500 bg-red-500/10"
              }`}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${fb.isCorrect ? "bg-green-500/15 text-green-300" : "bg-red-500/15 text-red-300"}`}>
                  <FeedbackIcon className="h-4.5 w-4.5" />
                </span>
                <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-base)]">
                  {fb.isCorrect ? "Good catch" : "Missed or Incorrect"}
                </span>
              </div>
              
              <div className="mb-4 grid gap-3 text-sm md:grid-cols-2">
                <div className="rounded-xl bg-black/20 p-3">
                  <span className="mb-1 block text-xs font-bold text-[var(--color-text-muted)]">Original</span>
                  <p className="text-[var(--color-text-secondary)]"><q>{sentence.text}</q></p>
                </div>
                {sentence.isError && (
                  <div className="rounded-xl bg-black/20 p-3">
                    <span className="mb-1 block text-xs font-bold text-[var(--color-text-muted)]">Correction</span>
                    <p className="text-[var(--color-text-secondary)]"><q>{sentence.correctText}</q></p>
                  </div>
                )}
              </div>

              {comment && (
                <div className="mb-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                  <span className="font-bold text-[var(--color-text-base)]">Your Reason: </span>
                  <span className="text-[var(--color-text-secondary)]">{comment.comment}</span>
                </div>
              )}

              <div className="rounded-xl bg-[var(--color-primary-light)] p-4 text-sm text-[var(--color-primary)]">
                <strong>AI Feedback: </strong> {fb.aiFeedback}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Actions */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-primary)] px-10 py-4 text-base font-black text-white shadow-lg transition-transform hover:-translate-y-0.5"
        >
          <RefreshIcon className="h-5 w-5" />
          Play again
        </button>
      </div>

    </div>
  );
}

function ProofreaderResultIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </svg>
  );
}
