"use client";

import Link from "next/link";

type AppStatusScreenProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  homeLabel?: string;
  homeHref?: string;
};

export default function AppStatusScreen({
  title,
  message,
  actionLabel,
  onAction,
  homeLabel = "Back home",
  homeHref = "/",
}: AppStatusScreenProps) {
  return (
    <div className="rapt-app-shell flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 py-8">
      <div className="w-full max-w-xl rounded-[32px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,236,226,0.88))] p-8 text-[var(--color-text-base)] shadow-[0_28px_60px_rgba(52,44,35,0.14)] sm:p-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-action-bg)] text-white shadow-[var(--shadow-primary)]">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18A2 2 0 0 0 3.53 21h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
        </div>

        <div className="mt-6">
          <span className="rapt-eyebrow">
            <span className="h-2 w-2 rounded-full bg-[var(--color-action-bg)]" />
            RAPT
          </span>
          <h1 className="rapt-display mt-5 text-[clamp(2rem,5vw,2.75rem)] leading-[0.95] text-[var(--color-text-base)]">
            {title}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
            {message}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="rapt-interactive-lift inline-flex items-center justify-center rounded-full bg-[var(--color-action-bg)] px-6 py-3 text-[14px] font-semibold text-white shadow-[var(--shadow-primary)] transition-all hover:bg-[var(--color-action-hover)]"
            >
              {actionLabel ?? "Try again"}
            </button>
          ) : null}

          <Link
            href={homeHref}
            className="rapt-interactive-lift inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white/80 px-6 py-3 text-[14px] font-semibold text-[var(--color-text-base)] transition-all hover:bg-white"
          >
            {homeLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
