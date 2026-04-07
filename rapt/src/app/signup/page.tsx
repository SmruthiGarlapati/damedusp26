"use client";

import { useState } from "react";
import Link from "next/link";
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
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="hidden lg:block">
          <Link
            href="/"
            className="rapt-display text-[30px] font-black tracking-tight text-white transition-colors hover:text-[#c8e898]"
          >
            RAPT
          </Link>
          <div className="mt-8 max-w-xl">
            <span className="rapt-eyebrow border-white/10 bg-white/8 text-[#c8e898]">
              <span className="h-2 w-2 rounded-full bg-[#ff7c38]" />
              New account setup
            </span>
            <h1 className="rapt-display mt-5 text-[clamp(44px,6vw,72px)] leading-[0.94] text-white">
              Build your
              <br />
              <span className="italic text-[#ff7c38]">study crew.</span>
            </h1>
            <p className="mt-5 text-[16px] leading-relaxed text-[#c8e898]/78">
              Set up your account, sync your classes, and bring the homepage vibe into the actual product flow from the first click.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["Course overlap", "Availability matching", "Session tools"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/12 bg-white/7 px-4 py-2 text-[12px] font-semibold text-white/78 backdrop-blur-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full max-w-md lg:justify-self-end">
          <div className="mb-6 text-center lg:hidden">
            <Link href="/" className="rapt-display text-[32px] font-black tracking-tight text-white">
              RAPT
            </Link>
            <p className="mt-2 text-[14px] text-[#c8e898]/80">Create your account to get started</p>
          </div>

          <div className="rapt-auth-card p-8">
            <span className="rapt-eyebrow">
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
              Sign up
            </span>
            <h2 className="rapt-display mt-5 text-[34px] leading-none text-[var(--color-text-base)]">
              Join RAPT
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
              Create your account and start shaping the matching experience around your classes, habits, and schedule.
            </p>

            {error && (
              <div className="mb-5 mt-6 rounded-lg border border-red-300 bg-[rgba(143,45,38,0.28)] px-4 py-3 text-[13px] font-medium text-[#ffd1c7]">
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
                className="mt-1 w-full rounded-xl bg-[var(--color-primary)] py-3 text-sm font-bold text-white shadow-[var(--shadow-primary)] transition-all hover:bg-[var(--color-primary-hover)] hover:-translate-y-px"
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
              <button className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] py-3 text-sm font-semibold text-[var(--color-text-base)] shadow-[var(--shadow-sm)] transition-all hover:border-[var(--color-primary-muted)] hover:bg-[var(--color-surface)]">
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
