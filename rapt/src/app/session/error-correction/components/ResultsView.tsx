"use client";

import { ErrorGameState } from "../useErrorGameState";
import { CheckCircleIcon, PlayerAvatar, RefreshIcon, SparkIcon, StoneIcon, TrophyIcon } from "../../components/gameChrome";

interface Props {
  state: ErrorGameState;
  partnerName: string;
  onRetry: () => void;
}

const resultHighlightClasses = {
  error:
    "box-decoration-clone rounded-md border border-red-200 bg-red-50 px-1.5 py-px font-medium text-red-900 shadow-[inset_0_0_0_1px_rgba(248,113,113,0.08)]",
  falsePositive:
    "box-decoration-clone rounded-md border border-amber-200 bg-amber-50 px-1.5 py-px font-medium text-amber-900 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.08)]",
  correction:
    "box-decoration-clone rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-px font-medium text-emerald-900 shadow-[inset_0_0_0_1px_rgba(74,222,128,0.08)]",
};

export default function ResultsView({ state, partnerName, onRetry }: Props) {
  if (!state.results) return null;

  const { results, sentences, userComments, totalErrors } = state;
  const partnerFirst = partnerName.split(" ")[0];
  const yourScore = results.score;

  // Simulated partner performance — realistic demo data showing complementary catches
  const partnerScore = Math.max(1, Math.min(totalErrors, Math.round(totalErrors * 0.65)));
  const sharedCatches = Math.min(yourScore, partnerScore, Math.max(0, Math.round(totalErrors * 0.35)));
  const teamScore = Math.min(totalErrors, yourScore + partnerScore - sharedCatches);
  const teamPct = Math.round((teamScore / totalErrors) * 100);
  const yourPct = Math.round((yourScore / totalErrors) * 100);

  const ScoreIcon = yourPct === 100 ? TrophyIcon : yourPct >= 70 ? SparkIcon : ProofreaderResultIcon;

  return (
    <div className="flex flex-col gap-8">

      {/* Team Investigation Result — top banner */}
      <div className="rounded-3xl border-2 border-[var(--color-primary)] bg-[var(--color-primary-light)] p-7">
        <p className="mb-5 text-[11px] font-bold uppercase tracking-widest text-[var(--color-primary)]">Team Investigation Result</p>

        <div className="grid grid-cols-3 gap-4 mb-5">
          {/* You */}
          <div className="flex flex-col items-center gap-2 text-center">
            <PlayerAvatar name="You" you size="lg" />
            <div>
              <p className="text-3xl font-black text-[var(--color-text-base)]">{yourScore}<span className="text-base font-bold text-[var(--color-text-muted)]">/{totalErrors}</span></p>
              <p className="text-[11px] font-semibold text-[var(--color-text-muted)]">You caught</p>
            </div>
          </div>

          {/* Team combined */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex -space-x-2">
              <PlayerAvatar name="You" you size="md" />
              <PlayerAvatar name={partnerName} size="md" />
            </div>
            <div>
              <p className="text-3xl font-black text-[var(--color-primary)]">{teamScore}<span className="text-base font-bold text-[var(--color-primary)]/60">/{totalErrors}</span></p>
              <p className="text-[11px] font-bold text-[var(--color-primary)]">Together</p>
            </div>
          </div>

          {/* Partner */}
          <div className="flex flex-col items-center gap-2 text-center">
            <PlayerAvatar name={partnerName} size="lg" />
            <div>
              <p className="text-3xl font-black text-[var(--color-text-base)]">{partnerScore}<span className="text-base font-bold text-[var(--color-text-muted)]">/{totalErrors}</span></p>
              <p className="text-[11px] font-semibold text-[var(--color-text-muted)]">{partnerFirst} caught</p>
            </div>
          </div>
        </div>

        {/* Team progress bar */}
        <div className="mb-3 space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold text-[var(--color-text-muted)]">
            <span>You alone: {yourPct}%</span>
            <span>Together: {teamPct}%</span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/20">
            <div className="absolute inset-y-0 left-0 rounded-full bg-white/30 transition-all duration-700" style={{ width: `${yourPct}%` }} />
            <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-primary)] transition-all duration-1000 delay-300" style={{ width: `${teamPct}%`, opacity: 0.7 }} />
          </div>
        </div>

        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {teamScore > Math.max(yourScore, partnerScore)
            ? `Together you caught ${teamScore - Math.max(yourScore, partnerScore)} more error${teamScore - Math.max(yourScore, partnerScore) > 1 ? "s" : ""} than either of you found alone — that's the point of partner review.`
            : `Strong combined effort — your catches complemented ${partnerFirst}'s.`}
        </p>
      </div>

      {/* Your individual score */}
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-[var(--color-border)] bg-[var(--color-surface-strong)] p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[24px] border border-[var(--color-primary-muted)] bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-[var(--shadow-primary)]">
          <ScoreIcon className="h-8 w-8" />
        </div>
        <h2 className="rapt-display mb-1 text-3xl text-[var(--color-text-base)]">
          Your score: {results.score} / {totalErrors}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {yourPct === 100 ? "Flawless investigation!" : "Review the corrections below to see what you missed."}
        </p>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-6 shadow-sm">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-red-400">Original (With Errors)</h3>
          <p className="text-[15px] leading-loose text-[var(--color-text-base)]">
            {sentences.map((s) => {
              const userFlagged = !!userComments[s.id];
              return (
                <span
                  key={s.id}
                  className={`inline transition-colors ${
                    s.isError
                      ? resultHighlightClasses.error
                      : userFlagged
                      ? resultHighlightClasses.falsePositive
                      : ""
                  }`}
                >
                  {s.text}{" "}
                </span>
              );
            })}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-6 shadow-sm">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-green-400">Corrected Version</h3>
          <p className="text-[15px] leading-loose text-[var(--color-text-base)]">
            {sentences.map((s) => (
              <span
                key={s.id}
                className={`inline transition-colors ${s.isError ? resultHighlightClasses.correction : ""}`}
              >
                {s.correctText || s.text}{" "}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* Detailed Explanations */}
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

      <div className="flex justify-center pt-4">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-action-bg)] px-10 py-4 text-base font-black text-white shadow-lg transition-transform hover:-translate-y-0.5"
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
