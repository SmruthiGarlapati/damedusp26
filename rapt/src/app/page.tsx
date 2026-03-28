"use client";

import Link from "next/link";

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: "Sync your schedule",
    desc: "Import from Google Calendar or myUT. We map your free blocks automatically.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Find your study match",
    desc: "We pair you with classmates based on course overlap, availability, and study style.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    title: "Study together",
    desc: "Flashcards, discussion threads, shared resources — all in one active session hub.",
  },
];

const STATS = [
  { value: "4,200+", label: "Students matched" },
  { value: "18", label: "Universities" },
  { value: "92%", label: "Satisfaction rate" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 flex h-16 items-center border-b border-[var(--color-border)] bg-white/90 backdrop-blur-sm px-8">
        <span className="text-[22px] font-extrabold tracking-tight text-[var(--color-primary)]">
          RAPT
        </span>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text-base)]"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-primary)] transition-all hover:bg-[var(--color-primary-hover)] hover:-translate-y-px"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-8 py-28 text-center">
        {/* Background blobs */}
        <div
          className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-[0.07]"
          style={{ background: "var(--color-primary)", filter: "blur(80px)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-24 h-[400px] w-[400px] rounded-full opacity-[0.06]"
          style={{ background: "var(--color-accent)", filter: "blur(60px)" }}
        />

        <div className="relative max-w-3xl">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-[12px] font-semibold text-[var(--color-primary)] shadow-[var(--shadow-sm)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
            Now at UT Austin · Spring 2026
          </span>

          <h1 className="mb-6 text-[56px] font-extrabold leading-[1.05] tracking-[-2px] text-[var(--color-text-base)]">
            Find your perfect
            <br />
            <span className="text-[var(--color-primary)]">study partner.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-[17px] leading-relaxed text-[var(--color-text-secondary)]">
            RAPT matches you with classmates based on your schedule, courses, and study habits. Stop studying alone.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-7 py-3.5 text-[15px] font-bold text-white shadow-[var(--shadow-primary)] transition-all hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5 hover:shadow-lg"
            >
              Get started free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="8" x2="13" y2="8" /><polyline points="9,4 13,8 9,12" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-7 py-3.5 text-[15px] font-semibold text-[var(--color-text-base)] shadow-[var(--shadow-sm)] transition-all hover:border-[var(--color-primary-muted)] hover:bg-[var(--color-primary-light)]"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-[var(--color-border)] bg-white py-8">
        <div className="mx-auto flex max-w-2xl items-center justify-around">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-[28px] font-extrabold tracking-tight text-[var(--color-primary)]">
                {s.value}
              </div>
              <div className="text-[12px] font-medium text-[var(--color-text-muted)]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto w-full max-w-5xl px-8 py-24">
        <h2 className="mb-3 text-center text-[32px] font-extrabold tracking-tight">
          Everything you need to study smarter
        </h2>
        <p className="mb-14 text-center text-[15px] text-[var(--color-text-secondary)]">
          Built for university students who want more out of every study session.
        </p>

        <div className="grid grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-[var(--color-border)] bg-white p-7 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                {f.icon}
              </div>
              <h3 className="mb-2 text-base font-bold">{f.title}</h3>
              <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-[var(--color-primary)] px-8 py-20 text-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-[32px] font-extrabold tracking-tight">
            Up and running in 3 steps
          </h2>
          <div className="grid grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create your profile", desc: "Sign up, import your course schedule, and set your study preferences." },
              { step: "02", title: "Block your availability", desc: "Mark when you're free using our When2Meet-style weekly grid." },
              { step: "03", title: "Match & study", desc: "Get paired with compatible classmates and jump straight into an active session." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col">
                <span className="mb-3 text-[40px] font-extrabold leading-none text-white/20">
                  {item.step}
                </span>
                <h3 className="mb-2 text-base font-bold">{item.title}</h3>
                <p className="text-[13px] leading-relaxed text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="flex flex-col items-center px-8 py-24 text-center">
        <h2 className="mb-4 text-[36px] font-extrabold tracking-tight">
          Ready to find your study match?
        </h2>
        <p className="mb-8 max-w-md text-[15px] text-[var(--color-text-secondary)]">
          Join thousands of students already using RAPT to make the most of their study time.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-8 py-4 text-[15px] font-bold text-white shadow-[var(--shadow-primary)] transition-all hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5"
        >
          Get started — it&apos;s free
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="8" x2="13" y2="8" /><polyline points="9,4 13,8 9,12" />
          </svg>
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--color-border)] px-8 py-6">
        <div className="flex items-center justify-between text-[12px] text-[var(--color-text-muted)]">
          <span className="font-bold text-[var(--color-primary)]">RAPT</span>
          <span>© 2026 RAPT. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-[var(--color-text-base)]">Privacy</span>
            <span className="cursor-pointer hover:text-[var(--color-text-base)]">Terms</span>
            <span className="cursor-pointer hover:text-[var(--color-text-base)]">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
