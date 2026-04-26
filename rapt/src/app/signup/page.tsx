"use client";

import { useState } from "react";
import Link from "next/link";
import { RaptLogoAuthHero } from "@/components/RaptLogo";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    // In production, call Supabase signUp here.
    router.push("/schedule");
  }

  return (
    <div className="rapt-auth-shell flex min-h-screen items-center px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-12 lg:pt-4">
        <div className="hidden lg:block">
          <Link
            href="/"
            className="rapt-motion-enter inline-flex shrink-0 items-center opacity-95 transition-opacity hover:opacity-100 lg:fixed lg:left-[max(1.5rem,env(safe-area-inset-left))] lg:top-[max(2rem,env(safe-area-inset-top))] lg:z-30"
            aria-label="RAPT home"
          >
            <RaptLogoAuthHero priority />
          </Link>
          <div className="mt-8 max-w-xl lg:mt-0 lg:pt-[9.5rem]">
            <Link
              href="/"
              className="rapt-eyebrow rapt-interactive-lift rapt-motion-enter inline-flex border-[var(--color-border)] bg-white/72 text-[var(--color-primary)] transition-all hover:border-[var(--color-primary-muted)] hover:bg-white/88"
              style={{ animationDelay: "100ms" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <line x1="13" y1="8" x2="3" y2="8" />
                <polyline points="7,4 3,8 7,12" />
              </svg>
              New account setup
            </Link>
            <h1 className="rapt-display rapt-motion-enter mt-5 text-[clamp(44px,6vw,72px)] leading-[0.94] text-[var(--color-text-base)]" style={{ animationDelay: "180ms" }}>
              Build your
              <br />
              <span className="italic text-[var(--color-hero-orange)]">study crew.</span>
            </h1>
            <p className="rapt-motion-enter mt-5 text-[16px] leading-relaxed text-[var(--color-text-secondary)]" style={{ animationDelay: "260ms" }}>
              Set up your account, sync your classes, and bring the homepage vibe into the actual product flow from the first click.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["Course overlap", "Availability matching", "Session tools"].map((item, index) => (
                <span
                  key={item}
                  className="rapt-pill-motion rapt-motion-enter rounded-full border border-[var(--color-border)] bg-white/72 px-4 py-2 text-[12px] font-semibold text-[var(--color-text-secondary)] backdrop-blur-sm"
                  style={{ animationDelay: `${340 + index * 110}ms` }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full max-w-md lg:justify-self-end">
          <div className="mb-6 text-center lg:hidden">
            <Link href="/" className="rapt-motion-enter inline-flex justify-center" aria-label="RAPT home">
              <RaptLogoAuthHero className="max-h-[5.25rem] sm:max-h-none" />
            </Link>
            <p className="rapt-motion-enter mt-2 text-[14px] text-[var(--color-text-secondary)]" style={{ animationDelay: "100ms" }}>Create your account to get started</p>
          </div>

          <div className="rapt-auth-card rapt-motion-enter p-8" style={{ animationDelay: "160ms" }}>
            <span className="rapt-eyebrow">
              <span className="h-2 w-2 rounded-full bg-[var(--color-action-bg)]" />
              Sign up
            </span>
            <h2 className="rapt-display mt-5 text-[34px] leading-none text-[var(--color-text-base)]">
              Join RAPT
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
              Create your account and start shaping the matching experience around your classes, habits, and schedule.
            </p>

            {error && (
              <div className="mb-5 mt-6 rounded-lg border border-red-300 bg-[rgba(43,43,43,0.28)] px-4 py-3 text-[13px] font-medium text-[#FFFFFF]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[var(--color-text-secondary)]">
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm text-[var(--color-text-base)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[var(--color-text-secondary)]">
                  University email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@utexas.edu"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm text-[var(--color-text-base)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[var(--color-text-secondary)]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm text-[var(--color-text-base)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[var(--color-text-secondary)]">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm text-[var(--color-text-base)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                />
              </div>

              <button
                type="submit"
                className="rapt-glow-pulse rapt-interactive-lift mt-1 w-full rounded-xl bg-[var(--color-action-bg)] py-3 text-sm font-bold text-white shadow-[var(--shadow-primary)] transition-all hover:bg-[var(--color-action-hover)] hover:-translate-y-px"
              >
                Create account
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--color-border)]" />
              <span className="text-[11px] font-medium text-[var(--color-text-muted)]">or continue with</span>
              <div className="h-px flex-1 bg-[var(--color-border)]" />
            </div>

            {/* Social buttons */}
            <div className="flex flex-col gap-3">
              <button className="rapt-interactive-lift flex w-full items-center justify-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] py-3 text-sm font-semibold text-[var(--color-text-base)] shadow-[var(--shadow-sm)] transition-all hover:border-[var(--color-primary-muted)] hover:bg-[var(--color-surface)]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </div>

            <p className="mt-6 text-center text-[12px] text-[var(--color-text-muted)]">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
