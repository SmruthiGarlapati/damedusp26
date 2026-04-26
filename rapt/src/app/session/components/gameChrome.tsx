"use client";

import type { ComponentType, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CuteDino, DinoFootprint } from "@/components/DinoDecoration";

type IconProps = { className?: string };
type IconComponent = ComponentType<IconProps>;

export interface GameLaunchItem {
  label: string;
  href?: string;
  available: boolean;
  Icon: IconComponent;
}

export function withSessionQuery(
  href: string,
  searchParams?: { toString(): string } | null,
  overrides?: Record<string, string>,
) {
  const params = new URLSearchParams(searchParams?.toString() ?? "");

  if (overrides) {
    Object.entries(overrides).forEach(([key, value]) => {
      params.set(key, value);
    });
  }

  const query = params.toString();
  return query ? `${href}?${query}` : href;
}

export function ArrowLeftIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function RefreshIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

export function ProofreaderIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M10 13h4" />
      <path d="M10 17h4" />
      <path d="m8.5 12.5 1 1 2-2" />
    </svg>
  );
}

export function FossilDigIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4.5 19.5 10" />
      <path d="m13 5.5 5.5 5.5" />
      <path d="M11.5 7 17 12.5" />
      <path d="M4 20 12 12" />
      <path d="m10.5 13.5-1.5-1.5" />
      <path d="M15.5 3.5c1.7-1.1 4-.9 5.4.6 1.5 1.5 1.7 3.9.5 5.6l-2.1 2.8-6.8-6.8Z" />
      <path d="M3.5 20.5 7 17l2.5 2.5-3.4 1.1z" />
    </svg>
  );
}

export function BrainBlastIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4a3 3 0 0 0-3 3v1.2A3.8 3.8 0 0 0 4 11.5c0 1.4.75 2.62 1.87 3.28A3.5 3.5 0 0 0 9 20h4a4 4 0 0 0 4-4v-.25A3.25 3.25 0 0 0 19.5 12 3.4 3.4 0 0 0 18 9.16V9a4 4 0 0 0-4-4Z" />
      <path d="M9 10h.01" />
      <path d="M12 8v4" />
      <path d="M15 10h.01" />
    </svg>
  );
}

export function FlipMatchIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="6" width="9" height="12" rx="2" />
      <rect x="11" y="4" width="9" height="12" rx="2" />
      <path d="M8 10h1" />
      <path d="M15 8h1" />
    </svg>
  );
}

export function WordSniperIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
    </svg>
  );
}

export function LightningRodIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 5 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

export function UploadIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M4 20h16" />
    </svg>
  );
}

export function CheckCircleIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.2 2.2L15.8 9.6" />
    </svg>
  );
}

export function PresenterIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h10l4-3v16l-4-3H4z" />
      <path d="M8 11h3" />
    </svg>
  );
}

export function ListenerIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4a6 6 0 0 0-6 6v3.5a3.5 3.5 0 0 0 7 0V11a2 2 0 0 1 4 0v3" />
      <path d="M17 14a3 3 0 0 1-6 0" />
    </svg>
  );
}

export function ClockIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function TrophyIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4h8v4a4 4 0 0 1-8 0Z" />
      <path d="M6 5H4a2 2 0 0 0 0 4h2" />
      <path d="M18 5h2a2 2 0 0 1 0 4h-2" />
      <path d="M12 12v4" />
      <path d="M9 20h6" />
    </svg>
  );
}

export function SparkIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" />
      <path d="m19 3 .7 2 .3.3 2 .7-2 .7-.3.3-.7 2-.7-2-.3-.3-2-.7 2-.7.3-.3Z" />
    </svg>
  );
}

export function StoneIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 4-5h6l4 5-1 7-5 4H9l-4-4z" />
    </svg>
  );
}

export function PlayerAvatar({ name, size = "md", you = false }: { name: string; size?: "sm" | "md" | "lg"; you?: boolean }) {
  const initials = name === "You" ? "You" : name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const sizeClasses = size === "sm" ? "h-7 w-7 text-[10px]" : size === "lg" ? "h-12 w-12 text-[14px]" : "h-9 w-9 text-[12px]";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${sizeClasses} ${
        you
          ? "border-2 border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
          : "bg-[var(--color-action-bg)] text-white"
      }`}
    >
      {initials === "You" ? <span className="text-[9px]">YOU</span> : initials}
    </div>
  );
}

export const GAME_LAUNCH_ITEMS: readonly GameLaunchItem[] = [
  { label: "Fossil Dig", href: "/session/fossil-dig", available: true, Icon: FossilDigIcon },
  { label: "Proofreader", href: "/session/error-correction", available: true, Icon: ProofreaderIcon },
  { label: "Brain Blast", href: "/session/brain-blast", available: true, Icon: BrainBlastIcon },
  { label: "Flip Match", href: "/session/flip-match", available: true, Icon: FlipMatchIcon },
  { label: "Word Sniper", href: "/session/word-sniper", available: true, Icon: WordSniperIcon },
  { label: "Lightning Rod", href: "/session/lightning-rod", available: true, Icon: LightningRodIcon },
] as const;

interface StudyGameShellProps {
  title: string;
  description: string;
  topic?: string;
  Icon: IconComponent;
  children: ReactNode;
  fallbackHref?: string;
  backLabel?: string;
  eyebrow?: string;
  contentClassName?: string;
}

export function StudyGameShell({
  title,
  description,
  topic,
  Icon,
  children,
  fallbackHref = "/session?tab=games",
  backLabel = "Back to games",
  eyebrow = "Study game",
  contentClassName = "mx-auto max-w-5xl",
}: StudyGameShellProps) {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }

  return (
    <div className="rapt-app-shell min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto rounded-[32px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,239,229,0.88))] shadow-[0_24px_56px_rgba(52,44,35,0.12)] backdrop-blur-sm">
        <div className="relative overflow-hidden rounded-t-[32px] border-b border-[var(--color-border-light)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,239,229,0.92))] px-5 py-4 md:px-8 md:py-5">
          {/* Decorative dino in top-right corner */}
          <div className="pointer-events-none absolute right-4 bottom-0 hidden opacity-20 sm:block" aria-hidden>
            <DinoFootprint className="absolute -left-12 top-2 h-6 w-6 -rotate-12 text-[#5c84ad]" />
            <DinoFootprint className="absolute -left-6 top-10 h-5 w-5 rotate-6 text-[#436485]" />
            <CuteDino className="w-24 h-24" color="#436485" />
          </div>
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--color-border)] bg-white/78 px-3 py-2 text-[12px] font-semibold text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-primary-muted)] hover:bg-white hover:text-[var(--color-primary)]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              {backLabel}
            </button>

            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-white/82 text-[var(--color-primary)] shadow-[0_12px_28px_rgba(52,44,35,0.1)]">
                <Icon className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
                  {eyebrow}
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="rapt-display text-[clamp(28px,4vw,42px)] tracking-tight text-[var(--color-text-base)]">
                    {title}
                  </h1>
                  {topic ? (
                    <span className="rounded-full border border-[var(--color-primary-muted)] bg-[var(--color-primary-light)] px-3 py-1 text-[12px] font-semibold text-[var(--color-primary)]">
                      {topic}
                    </span>
                  ) : null}
                </div>
                <p className="max-w-2xl text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`px-5 py-6 md:px-8 md:py-8 ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
