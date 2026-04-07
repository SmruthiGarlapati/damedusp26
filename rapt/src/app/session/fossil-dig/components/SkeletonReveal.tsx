"use client";

import { useEffect, useState } from "react";
import { GameState } from "../useGameState";

interface Props {
  state: GameState;
  onStartReDig: () => void;
  onSkipReDig: () => void;
  onReset: () => void;
}

const BADGES = [
  { min: 90, label: "Perfect Specimen", emoji: "🏆", color: "#c4622d" },
  { min: 70, label: "Clean Excavation", emoji: "🦴", color: "#6b9b6b" },
  { min: 50, label: "Partial Fossil", emoji: "⛏️", color: "#9b8b6b" },
  { min: 0,  label: "Still Digging",   emoji: "🪨", color: "#9b9b95" },
];

export default function SkeletonReveal({ state, onStartReDig, onSkipReDig, onReset }: Props) {
  const analysis = state.phase === "COMPLETE" && state.reDigAnalysis
    ? state.reDigAnalysis
    : state.analysis;

  const [revealedBones, setRevealedBones] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const score = analysis?.matchScore ?? 0;
  const badge = BADGES.find((b) => score >= b.min)!;
  const totalBones = 12;
  const bonesToReveal = Math.round((score / 100) * totalBones);

  useEffect(() => {
    setRevealedBones([]);
    setShowDetails(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= bonesToReveal) {
        clearInterval(interval);
        setTimeout(() => setShowDetails(true), 400);
        return;
      }
      setRevealedBones((prev) => [...prev, i]);
      i++;
    }, 180);
    return () => clearInterval(interval);
  }, [bonesToReveal]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="rapt-display mb-1 text-3xl tracking-tight text-[var(--color-text-base)]">
          Excavation complete 🦕
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm">
          Here&apos;s how much knowledge was successfully transferred.
        </p>
      </div>

      {/* Score card */}
      <div className="flex flex-col items-center gap-6 rounded-3xl border-2 border-[var(--color-border)] bg-[var(--color-surface-strong)] p-8">

        {/* Skeleton SVG */}
        <div className="relative w-[320px] h-[200px]">
  {/* Faded base skeleton always visible */}
  <img
    src="/dino-skeleton.png"
    alt="dinosaur skeleton"
    className="absolute inset-0 w-full h-full object-contain"
    style={{ opacity: 0.15, filter: "grayscale(1)" }}
  />
  {/* Revealed skeleton fills in as concepts are found */}
  <img
    src="/dino-skeleton.png"
    alt="dinosaur skeleton revealed"
    className="absolute inset-0 w-full h-full object-contain transition-all duration-1000"
    style={{
      opacity: revealedBones.length / 12,
      filter: "sepia(1) saturate(3) hue-rotate(-20deg) brightness(0.75)",
    }}
  />
</div>

        {/* Score */}
        <div className="text-center">
          <div className="text-6xl font-black tracking-tight"
            style={{ color: badge.color }}>
            {score}%
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-xl">{badge.emoji}</span>
            <span className="text-lg font-black text-[var(--color-text-base)]">{badge.label}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${score}%`, background: badge.color }}
          />
        </div>
      </div>

      {/* Details — fade in after bones reveal */}
      {showDetails && analysis && (
        <div className="flex flex-col gap-4">

          {/* Concepts */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-6">
            <div className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              Concepts excavated
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {analysis.foundConcepts.map((c) => (
                <span key={c} className="rounded-full bg-[#eef6ee] border border-[#c4ddc4] px-3 py-1 text-xs font-bold text-[#3a6b3a]">
                  ✓ {c}
                </span>
              ))}
              {analysis.missedConcepts.map((c) => (
                <span key={c} className="rounded-full border border-[var(--color-primary-muted)] bg-[var(--color-primary-light)] px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
                  ✗ {c}
                </span>
              ))}
            </div>

            {/* Gap explanation */}
            {analysis.gapExplanation && (
              <div className="rounded-xl border border-[var(--color-primary-muted)] bg-[var(--color-primary-light)] p-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
                  What was missed
                </div>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {analysis.gapExplanation}
                </p>
              </div>
            )}
          </div>

          {/* Re-dig CTA */}
          {state.phase === "REVEALING" && analysis.missedConcepts.length > 0 && (
            <div className="rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-primary-light)] p-6">
              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
                Re-dig available
              </div>
              <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {analysis.reDigPrompt}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onStartReDig}
                  className="flex-1 rounded-xl bg-[var(--color-primary)] py-3 text-sm font-black text-white transition-opacity hover:opacity-90"
                >
                  Do the re-dig 🦴
                </button>
                <button
                  onClick={onSkipReDig}
                  className="rounded-xl border border-[var(--color-border)] px-5 py-3 text-sm font-bold text-[var(--color-text-muted)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Complete state */}
          {state.phase === "COMPLETE" && (
            <div className="rounded-2xl border border-[var(--color-primary-muted)] bg-[var(--color-primary-light)] p-6 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <p className="mb-1 text-lg font-black text-[var(--color-text-base)]">
                Dig complete!
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Great session. Both of you just learned more effectively than studying alone.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onReset}
              className="flex-1 rounded-xl border-2 border-[var(--color-border)] py-3 text-sm font-black text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              ← New dig
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
