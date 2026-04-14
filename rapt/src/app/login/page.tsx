"use client";

import { useState } from "react";
import Link from "next/link";
import { RaptLogoAuthHero } from "@/components/RaptLogo";
import { useRouter } from "next/navigation";
import {
  activateDemoAdminSession,
  clearDemoAdminSession,
  isDemoAdminCredentials,
  isSupabaseAuthConfigured,
} from "@/lib/demoAdmin";
import { createClient } from "@/lib/supabase/client";

const DEMO_MATCH_ID = "cccccccc-cccc-cccc-cccc-cccccccccccc";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function resetDemoSession(supabase: ReturnType<typeof createClient>) {
    // Reset Marcus demo session to start 1 minute from now
    const oneMinuteFromNow = new Date(Date.now() + 60 * 1000).toISOString();
    await supabase
      .from("matches")
      .update({ scheduled_at: oneMinuteFromNow, status: "accepted", started: false })
      .eq("id", DEMO_MATCH_ID);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    const isAdminDemoLogin = isDemoAdminCredentials(normalizedEmail, password);
    const supabaseConfigured = isSupabaseAuthConfigured();

    if (isAdminDemoLogin) {
      activateDemoAdminSession();
      window.location.assign("/auth/admin");
      return;
    }

    if (!supabaseConfigured) {
      setLoading(false);
      setError("Invalid email or password. Please try again.");
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (authError) {
      setLoading(false);
      setError("Invalid email or password. Please try again.");
      return;
    }

    clearDemoAdminSession();

    // Reset demo session timing after successful login
    await resetDemoSession(supabase);
    setLoading(false);
    router.push("/matches");
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);

    if (!isSupabaseAuthConfigured()) {
      setLoading(false);
      setError("Google sign-in is not configured in this environment yet.");
      return;
    }

    clearDemoAdminSession();

    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          hd: "utexas.edu", // restrict to UT Austin Google accounts
          prompt: "select_account",
        },
      },
    });
    if (oauthError) {
      setLoading(false);
      setError("Google sign-in failed. Please try email/password.");
    }
    // On success the page redirects — no need to setLoading(false)
  }

  function handleBackNavigation() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <div className="rapt-auth-shell flex min-h-screen items-center px-4 py-10">
      <svg className="pointer-events-none absolute left-0 top-0 w-24 opacity-[0.09]" viewBox="0 0 96 640" fill="none" preserveAspectRatio="xMinYMin meet">
        <path d="M24 0 C16 70 34 140 20 230 C6 315 28 390 16 480 C8 545 22 595 14 640" stroke="#72b84a" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M20 230 C38 218 56 212 68 202" stroke="#72b84a" strokeWidth="1.1" strokeLinecap="round"/>
        <ellipse cx="72" cy="199" rx="10" ry="6" fill="#3d7a2a" transform="rotate(-14 72 199)"/>
        <path d="M16 390 C34 378 50 372 62 362" stroke="#72b84a" strokeWidth="1.1" strokeLinecap="round"/>
        <ellipse cx="65" cy="359" rx="9" ry="5" fill="#3d7a2a" transform="rotate(-10 65 359)"/>
        <path d="M22 140 C10 128 6 114 14 106" stroke="#72b84a" strokeWidth="0.9" strokeLinecap="round"/>
      </svg>
      <svg className="pointer-events-none absolute right-0 top-0 w-24 opacity-[0.09]" viewBox="0 0 96 640" fill="none" preserveAspectRatio="xMinYMin meet" style={{transform:"scaleX(-1)"}}>
        <path d="M24 0 C16 70 34 140 20 230 C6 315 28 390 16 480 C8 545 22 595 14 640" stroke="#72b84a" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M20 230 C38 218 56 212 68 202" stroke="#72b84a" strokeWidth="1.1" strokeLinecap="round"/>
        <ellipse cx="72" cy="199" rx="10" ry="6" fill="#3d7a2a" transform="rotate(-14 72 199)"/>
        <path d="M16 390 C34 378 50 372 62 362" stroke="#72b84a" strokeWidth="1.1" strokeLinecap="round"/>
        <ellipse cx="65" cy="359" rx="9" ry="5" fill="#3d7a2a" transform="rotate(-10 65 359)"/>
        <path d="M22 140 C10 128 6 114 14 106" stroke="#72b84a" strokeWidth="0.9" strokeLinecap="round"/>
      </svg>
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-12 lg:pt-4">
        <div className="hidden lg:block">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center opacity-95 transition-opacity hover:opacity-100 lg:fixed lg:left-[max(1.5rem,env(safe-area-inset-left))] lg:top-[max(2rem,env(safe-area-inset-top))] lg:z-30"
            aria-label="RAPT home"
          >
            <RaptLogoAuthHero priority />
          </Link>
          <div className="mt-8 max-w-xl lg:mt-0 lg:pt-[9.5rem]">
            <button
              type="button"
              onClick={handleBackNavigation}
              className="rapt-eyebrow border-white/10 bg-white/8 text-[#c8e898] transition-all hover:border-white/20 hover:bg-white/12"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <line x1="13" y1="8" x2="3" y2="8" />
                <polyline points="7,4 3,8 7,12" />
              </svg>
              Back to matching
            </button>
            <h1 className="rapt-display mt-5 text-[clamp(44px,6vw,72px)] leading-[0.94] text-white">
              Welcome back to your
              <br />
              <span className="italic text-[#ff7c38]">study orbit.</span>
            </h1>
            <p className="mt-5 text-[16px] leading-relaxed text-[#c8e898]/78">
              Pick up where you left off. Matches, sessions, and shared study tools all carry the same RAPT jungle energy from the homepage.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["UT Austin ready", "Course-based matching", "Shared live sessions"].map((item) => (
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
            <Link href="/" className="inline-flex justify-center" aria-label="RAPT home">
              <RaptLogoAuthHero className="max-h-[5.25rem] sm:max-h-none" />
            </Link>
            <p className="mt-2 text-[14px] text-[#c8e898]/80">Welcome back</p>
          </div>

          <div className="rapt-auth-card p-8">
            <span className="rapt-eyebrow">
              <span className="h-2 w-2 rounded-full bg-[var(--color-leaf)]" />
              Log in
            </span>
            <h2 className="rapt-display mt-5 text-[34px] leading-none text-[var(--color-text-base)]">
              Jump back in
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
              Sign in to browse matches, manage sessions, and keep your study momentum going.
            </p>
            {/* Admin Demo Login */}
            <button
              type="button"
              onClick={() => {
                activateDemoAdminSession();
                window.location.assign("/auth/admin");
              }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-3 text-[14px] font-bold text-white shadow-[var(--shadow-primary)] transition-all hover:bg-[var(--color-primary-hover)] hover:-translate-y-px"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Continue as Admin Demo
            </button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--color-border)]" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">or sign in</span>
              <div className="h-px flex-1 bg-[var(--color-border)]" />
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-300 bg-[rgba(143,45,38,0.28)] px-4 py-3 text-[13px] font-medium text-[#ffd1c7]">
                {error}
              </div>
            )}

            {/* Google Sign-in */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mb-5 mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] py-3 text-[14px] font-semibold text-[var(--color-text-base)] shadow-[var(--shadow-sm)] transition-all hover:bg-[var(--color-surface)] hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:translate-y-0"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google (UT Austin)
            </button>

            <div className="mb-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--color-border)]" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">or</span>
              <div className="h-px flex-1 bg-[var(--color-border)]" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[var(--color-text-secondary)]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@utexas.edu"
                  autoComplete="email"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm text-[var(--color-text-base)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[var(--color-text-secondary)]">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 pr-11 text-sm text-[var(--color-text-base)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-base)]"
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full rounded-xl bg-[var(--color-primary)] py-3 text-sm font-bold text-white shadow-[var(--shadow-primary)] transition-all hover:bg-[var(--color-primary-hover)] hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:translate-y-0"
              >
                {loading ? "Logging in…" : "Log in"}
              </button>
            </form>

            <p className="mt-6 text-center text-[12px] text-[var(--color-text-muted)]">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-[var(--color-primary)] hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
