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
        <h1 className="text-3xl font-black tracking-tight text-[#1a1a18] mb-1">
          Excavation complete 🦕
        </h1>
        <p className="text-[#6b6b65] text-sm">
          Here&apos;s how much knowledge was successfully transferred.
        </p>
      </div>

      {/* Score card */}
      <div className="rounded-3xl border-2 border-[#e8e0d4] bg-white p-8 flex flex-col items-center gap-6">

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
            <span className="font-black text-lg text-[#1a1a18]">{badge.label}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-[#f0ebe4] rounded-full overflow-hidden">
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
          <div className="rounded-2xl border border-[#e8e0d4] bg-white p-6">
            <div className="text-xs font-bold uppercase tracking-widest text-[#9b9b95] mb-4">
              Concepts excavated
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {analysis.foundConcepts.map((c) => (
                <span key={c} className="rounded-full bg-[#eef6ee] border border-[#c4ddc4] px-3 py-1 text-xs font-bold text-[#3a6b3a]">
                  ✓ {c}
                </span>
              ))}
              {analysis.missedConcepts.map((c) => (
                <span key={c} className="rounded-full bg-[#fdf0eb] border border-[#f0d5c4] px-3 py-1 text-xs font-bold text-[#c4622d]">
                  ✗ {c}
                </span>
              ))}
            </div>

            {/* Gap explanation */}
            {analysis.gapExplanation && (
              <div className="rounded-xl bg-[#fdf6f2] border border-[#f0d5c4] p-4">
                <div className="text-xs font-bold uppercase tracking-widest text-[#c4622d] mb-2">
                  What was missed
                </div>
                <p className="text-sm text-[#6b6b65] leading-relaxed">
                  {analysis.gapExplanation}
                </p>
              </div>
            )}
          </div>

          {/* Re-dig CTA */}
          {state.phase === "REVEALING" && analysis.missedConcepts.length > 0 && (
            <div className="rounded-2xl border-2 border-[#c4622d] bg-[#fdf6f2] p-6">
              <div className="text-xs font-bold uppercase tracking-widest text-[#c4622d] mb-2">
                Re-dig available
              </div>
              <p className="text-sm text-[#6b6b65] leading-relaxed mb-4">
                {analysis.reDigPrompt}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onStartReDig}
                  className="flex-1 rounded-xl bg-[#c4622d] py-3 text-sm font-black text-white hover:opacity-90 transition-opacity"
                >
                  Do the re-dig 🦴
                </button>
                <button
                  onClick={onSkipReDig}
                  className="rounded-xl border border-[#e8e0d4] px-5 py-3 text-sm font-bold text-[#9b9b95] hover:border-[#c4622d] hover:text-[#c4622d] transition-all"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Complete state */}
          {state.phase === "COMPLETE" && (
            <div className="rounded-2xl bg-[#fdf6f2] border border-[#f0d5c4] p-6 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-black text-lg text-[#1a1a18] mb-1">
                Dig complete!
              </p>
              <p className="text-sm text-[#6b6b65]">
                Great session. Both of you just learned more effectively than studying alone.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onReset}
              className="flex-1 rounded-xl border-2 border-[#e8e0d4] py-3 text-sm font-black text-[#6b6b65] hover:border-[#c4622d] hover:text-[#c4622d] transition-all"
            >
              ← New dig
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
