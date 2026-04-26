"use client";

import { useEffect, useState } from "react";
import { GameState } from "../useGameState";
import { ArrowLeftIcon, ArrowRightIcon, FossilDigIcon, PlayerAvatar, SparkIcon, StoneIcon, TrophyIcon } from "../../components/gameChrome";

interface Props {
  state: GameState;
  partnerName: string;
  onStartReDig: () => void;
  onSkipReDig: () => void;
  onReset: () => void;
}

const BADGES = [
  { min: 90, label: "Perfect Specimen", Icon: TrophyIcon, color: "#FFFFFF" },
  { min: 70, label: "Clean Excavation", Icon: FossilDigIcon, color: "#FFFFFF" },
  { min: 50, label: "Partial Fossil", Icon: SparkIcon, color: "#D9D9D9" },
  { min: 0,  label: "Still Digging", Icon: StoneIcon, color: "#D9D9D9" },
];

function BoneTag({ concept, revealed, delay }: { concept: string; revealed: boolean; delay: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(revealed), revealed ? delay : 0);
    return () => clearTimeout(t);
  }, [revealed, delay]);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all duration-500 ${
        visible
          ? "scale-105 border-amber-300 bg-amber-50 text-amber-800 shadow-[0_4px_12px_rgba(251,191,36,0.25)]"
          : "scale-100 border-[var(--color-border)] bg-[var(--color-surface-strong)] text-[var(--color-text-muted)] opacity-60"
      }`}
      style={{ transform: visible ? "scale(1)" : "scale(0.92)" }}
    >
      <span>{visible ? "🦴" : "🪨"}</span>
      {concept}
    </span>
  );
}

export default function SkeletonReveal({ state, partnerName, onStartReDig, onSkipReDig, onReset }: Props) {
  const analysis = state.phase === "COMPLETE" && state.reDigAnalysis
    ? state.reDigAnalysis
    : state.analysis;

  const [boneCount, setBoneCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const score = analysis?.matchScore ?? 0;
  const badge = BADGES.find((b) => score >= b.min)!;

  const partnerFirst = partnerName.split(" ")[0];
  const presenterName = state.role === "presenter" ? "You" : partnerFirst;
  const scribeName    = state.role === "scribe"    ? "You" : partnerFirst;

  const foundConcepts  = analysis?.foundConcepts  ?? [];
  const missedConcepts = analysis?.missedConcepts ?? [];
  const totalConcepts  = foundConcepts.length + missedConcepts.length;

  useEffect(() => {
    setBoneCount(0);
    setShowDetails(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= foundConcepts.length) {
        clearInterval(interval);
        setTimeout(() => setShowDetails(true), 500);
        return;
      }
      i++;
      setBoneCount(i);
    }, 300);
    return () => clearInterval(interval);
  }, [foundConcepts.length]);

  const skeletonRevealPct = totalConcepts > 0 ? (boneCount / totalConcepts) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
          Results
        </span>
        <h1 className="rapt-display mb-1 text-3xl tracking-tight text-[var(--color-text-base)]">
          Team excavation complete
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm">
          Every concept {scribeName} recalled from {presenterName}&apos;s presentation unearths one bone in your shared skeleton.
        </p>
      </div>

      {/* Main score card */}
      <div className="flex flex-col items-center gap-5 rounded-3xl border-2 border-[var(--color-border)] bg-[var(--color-surface-strong)] p-8">

        {/* Team header */}
        <div className="flex w-full items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <PlayerAvatar name={state.role === "presenter" ? "You" : partnerName} you={state.role === "presenter"} size="md" />
            <span className="text-[10px] font-bold text-[var(--color-text-muted)]">{presenterName} taught</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1.5">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/8">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-[2000ms]"
                style={{ width: `${skeletonRevealPct}%`, background: "linear-gradient(90deg, var(--color-primary), #f59e0b)" }}
              />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">knowledge transfer</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <PlayerAvatar name={state.role === "scribe" ? "You" : partnerName} you={state.role === "scribe"} size="md" />
            <span className="text-[10px] font-bold text-[var(--color-text-muted)]">{scribeName} recalled</span>
          </div>
        </div>

        {/* Mechanic callout + skeleton side by side */}
        <div className="flex w-full flex-col items-center gap-5 sm:flex-row">

          {/* Skeleton image */}
          <div className="relative h-[180px] w-[260px] shrink-0">
            <img
              src="/dino-skeleton.png"
              alt="dinosaur skeleton"
              className="absolute inset-0 h-full w-full object-contain"
              style={{ opacity: 0.12, filter: "grayscale(1)" }}
            />
            <img
              src="/dino-skeleton.png"
              alt="dinosaur skeleton revealed"
              className="absolute inset-0 h-full w-full object-contain transition-all duration-[1500ms]"
              style={{
                opacity: skeletonRevealPct / 100,
                filter: "sepia(1) saturate(3) hue-rotate(-20deg) brightness(0.75)",
                clipPath: `inset(0 ${100 - skeletonRevealPct}% 0 0)`,
              }}
            />
            {/* Bone counter overlay */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full border border-amber-300 bg-amber-50/95 px-3 py-1 text-xs font-black text-amber-800 shadow-md">
              🦴 {boneCount} / {totalConcepts} bones
            </div>
          </div>

          {/* Right: score + mechanic explanation */}
          <div className="flex flex-1 flex-col items-center gap-3 text-center sm:items-start sm:text-left">
            <div className="rounded-xl border border-[var(--color-primary-muted)] bg-[var(--color-primary-light)] p-3">
              <p className="text-[12px] font-semibold leading-relaxed text-[var(--color-text-secondary)]">
                <span className="font-black text-[var(--color-primary)]">How it works:</span> Each concept {scribeName} correctly recalled reveals another bone in the skeleton.
                The more accurately they reconstructed {presenterName}&apos;s lesson, the more complete the fossil.
              </p>
            </div>

            <div className="text-5xl font-black tracking-tight" style={{ color: badge.color }}>
              {score}%
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8" style={{ color: badge.color }}>
                <badge.Icon className="h-4 w-4" />
              </span>
              <span className="text-base font-black text-[var(--color-text-base)]">{badge.label}</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              {score >= 70
                ? `Great teamwork — ${scribeName} retained the core of what ${presenterName} taught`
                : `The team can close this gap — try a re-dig to unearth the rest`}
            </p>
          </div>
        </div>
      </div>

      {/* Bone-by-bone excavation log — fades in after bones finish revealing */}
      {showDetails && analysis && (
        <div className="flex flex-col gap-4">

          {/* Excavation log */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-6">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                Bone excavation log
              </div>
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                🦴 {foundConcepts.length} unearthed · 🪨 {missedConcepts.length} buried
              </span>
            </div>

            <p className="mb-4 text-[11px] text-[var(--color-text-muted)]">
              Each concept {scribeName} recalled = one bone. Each miss = still buried.
            </p>

            <div className="flex flex-wrap gap-2">
              {foundConcepts.map((c, i) => (
                <BoneTag key={c} concept={c} revealed delay={i * 80} />
              ))}
              {missedConcepts.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-primary-muted)] bg-[var(--color-primary-light)] px-3 py-1.5 text-xs font-bold text-[var(--color-primary)]">
                  🪨 {c}
                </span>
              ))}
            </div>

            {analysis.gapExplanation && (
              <div className="mt-4 rounded-xl border border-[var(--color-primary-muted)] bg-[var(--color-primary-light)] p-4">
                <div className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
                  Why these bones are still buried
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
              <div className="mb-2 flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <PlayerAvatar name={state.role === "presenter" ? "You" : partnerName} you={state.role === "presenter"} size="sm" />
                  <span className="text-[10px]">→</span>
                  <PlayerAvatar name={state.role === "scribe" ? "You" : partnerName} you={state.role === "scribe"} size="sm" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">Re-dig available</span>
                <span className="ml-auto text-[10px] font-bold text-amber-600">🪨 {missedConcepts.length} bones still buried</span>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {analysis.reDigPrompt}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onStartReDig}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-action-bg)] py-3 text-sm font-black text-white transition-opacity hover:opacity-90"
                >
                  Dig for the buried bones
                  <ArrowRightIcon className="h-4 w-4" />
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
              <div className="mb-3 flex justify-center gap-3">
                <PlayerAvatar name={state.role === "presenter" ? "You" : partnerName} you={state.role === "presenter"} size="lg" />
                <PlayerAvatar name={state.role === "scribe" ? "You" : partnerName} you={state.role === "scribe"} size="lg" />
              </div>
              <p className="mb-1 text-lg font-black text-[var(--color-text-base)]">Dig complete!</p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Great teamwork. Both of you just learned more effectively than studying alone.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onReset}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[var(--color-border)] py-3 text-sm font-black text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              New dig
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
