"use client";
import Link from "next/link";
import HomeNavbar from "@/components/HomeNavbar";
import { RaptLogoSm } from "@/components/RaptLogo";
import ScrollReveal from "@/components/ScrollReveal";

const FEATURES = [
  {
    tone: "rapt-feature-card--sync",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    title: "Sync your schedule",
    desc: "Import from Google Calendar or myUT. We map your free blocks automatically.",
  },
  {
    tone: "rapt-feature-card--match",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Find your study match",
    desc: "We pair you with classmates based on course overlap, availability, and study style.",
  },
  {
    tone: "rapt-feature-card--session",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
    title: "Study together",
    desc: "Flashcards, discussion threads, shared resources — all in one active session hub.",
  },
];

const STEPS = [
  { n: "01", tone: "rapt-step-card--profile", title: "Create your profile", desc: "Sign up, import your course schedule, and set your study preferences." },
  { n: "02", tone: "rapt-step-card--availability", title: "Block your availability", desc: "Mark when you're free using our When2Meet-style weekly grid." },
  { n: "03", tone: "rapt-step-card--launch", title: "Match & study", desc: "Get paired with compatible classmates and jump straight into an active session." },
];

const STATS = [
  { value: "4,200+", label: "Students matched" },
  { value: "92%",    label: "Satisfaction rate" },
  { value: "18",     label: "Universities" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] font-sans text-[var(--color-text-base)]">

      <HomeNavbar />

      {/* ── Hero ── */}
      <section className="rapt-app-shell relative flex flex-col items-center justify-center overflow-hidden px-5 pb-28 pt-20 text-center sm:px-8 sm:pb-32 sm:pt-28">

        <div className="relative mx-auto max-w-4xl px-2">
          <h1 className="rapt-hero-headline rapt-motion-enter mx-auto mb-8 max-w-[min(100%,28rem)] text-balance sm:mb-10 sm:max-w-5xl">
            <span className="block text-[clamp(2.75rem,8vw,4.5rem)] font-extrabold leading-[0.92] tracking-[-0.04em] text-white">
              Find your
            </span>
            <span className="rapt-hero-line-accent -mt-1 block text-[clamp(3.25rem,11vw,6.75rem)] uppercase leading-[0.85] text-[var(--color-hero-orange)] sm:-mt-2 md:-mt-3">
              study pack
            </span>
          </h1>

          <p className="rapt-motion-enter mx-auto mb-11 max-w-[34rem] text-pretty text-[15px] font-normal leading-[1.7] text-white/90 sm:mb-12 sm:text-[17px] sm:leading-[1.75]" style={{ animationDelay: "120ms" }}>
            RAPT matches you with classmates based on your schedule, courses, and study habits. Stop studying alone.
          </p>

          <div className="rapt-motion-enter flex items-center justify-center gap-4 flex-wrap sm:gap-5" style={{ animationDelay: "240ms" }}>
            <Link
              href="/signup"
              className="rapt-glow-pulse rapt-interactive-lift inline-flex items-center gap-2.5 rounded-full bg-[var(--color-primary)] px-10 py-4 text-[17px] font-semibold text-white shadow-[var(--shadow-primary)] transition-all hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5 sm:px-11 sm:py-[1.125rem] sm:text-[18px]"
            >
              Get started free
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="shrink-0">
                <line x1="3" y1="8" x2="13" y2="8" />
                <polyline points="9,4 13,8 9,12" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="rapt-interactive-lift rounded-full border border-white/15 bg-white/[0.06] px-10 py-4 text-[17px] font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/[0.1] sm:px-11 sm:py-[1.125rem] sm:text-[18px]"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Stats row inside hero */}
        <div className="rapt-motion-enter mt-14 flex items-center justify-center gap-12 flex-wrap sm:mt-16 sm:gap-16" style={{ animationDelay: "360ms" }}>
          {STATS.map((s, index) => (
            <div key={s.label} className="rapt-pill-motion rapt-float-soft text-center" style={{ animationDelay: `${480 + index * 140}ms` }}>
              <div className="rapt-display text-[clamp(2.25rem,5vw,3rem)] leading-none text-[var(--color-primary)]">
                {s.value}
              </div>
              <div className="mt-2 text-[14px] font-semibold text-[var(--color-text-muted)] sm:mt-2.5 sm:text-[15px]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="rapt-motion-enter mb-12 text-center" style={{ animationDelay: "120ms" }}>
            <span className="rapt-eyebrow mb-4 inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
              Built for students
            </span>
            <h2 className="rapt-display mt-4 text-[clamp(28px,4vw,40px)] text-[var(--color-text-base)]">
              Everything you need to study smarter
            </h2>
            <p className="mt-3 text-[15px] text-[var(--color-text-secondary)]">
              Built for university students who want more out of every study session.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {FEATURES.map((f, index) => (
              <ScrollReveal key={f.title} className="h-full" delay={index * 110}>
                <div className={`rapt-feature-card ${f.tone} h-full p-7 sm:p-8`}>
                  <span aria-hidden className="rapt-feature-card__glow" />
                  <div className="rapt-feature-card__icon mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-[var(--feature-accent)]">
                    {f.icon}
                  </div>
                  <h3 className="rapt-display mb-2 text-[19px] text-[var(--color-text-base)]">
                    {f.title}
                  </h3>
                  <p className="max-w-[17rem] text-[14px] leading-relaxed text-[var(--color-text-secondary)]">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="rapt-hero-card rapt-motion-enter px-8 py-10" style={{ animationDelay: "140ms" }}>
            <span className="rapt-eyebrow mb-4 inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-leaf)]" />
              Simple setup
            </span>
            <h2 className="rapt-display mt-4 mb-12 text-[clamp(28px,4vw,40px)] text-[var(--color-text-base)]">
              Up and running in 3 steps
            </h2>
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
              {STEPS.map((item, index) => (
                <ScrollReveal key={item.n} className="h-full" delay={index * 110}>
                  <div className={`rapt-step-card ${item.tone} h-full`}>
                    <span className="rapt-step-card__number rapt-display">
                      {item.n}
                    </span>
                    <h3 className="rapt-display mb-2 text-[18px] text-[var(--color-text-base)]">
                      {item.title}
                    </h3>
                    <p className="text-[14px] leading-relaxed text-[var(--color-text-secondary)]">{item.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-5 pb-20 sm:px-8 sm:pb-24">
        <div className="mx-auto max-w-2xl">
          <ScrollReveal>
            <div className="rapt-cta-card flex flex-col items-center px-10 py-14 text-center">
              <span className="rapt-eyebrow mb-4 inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
                Join your classmates
              </span>
              <h2 className="rapt-display mt-4 text-[clamp(28px,4vw,42px)] leading-tight text-[var(--color-text-base)]">
                Ready to find your<br />
                <span className="text-[var(--color-primary)]">study match?</span>
              </h2>
              <p className="mt-4 mb-10 max-w-sm text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
                Join thousands of students already using RAPT to make the most of their study time.
              </p>
              <Link href="/signup" className="rapt-glow-pulse rapt-interactive-lift inline-flex items-center gap-2 rounded-2xl bg-[var(--color-primary)] px-10 py-4 text-[15px] font-bold text-white shadow-[var(--shadow-primary)] transition-all hover:bg-[var(--color-primary-hover)] hover:-translate-y-1">
                Get started — it&apos;s free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="3" y1="8" x2="13" y2="8"/><polyline points="9,4 13,8 9,12"/>
                </svg>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--color-border)] bg-[#0a160a] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center text-[12px] text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <Link href="/" className="inline-flex justify-center" aria-label="RAPT home">
            <RaptLogoSm />
          </Link>
          <span>© 2026 RAPT. All rights reserved.</span>
          <div className="flex flex-wrap justify-center gap-6 sm:justify-end">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <span key={l} className="cursor-pointer transition-colors hover:text-[var(--color-text-secondary)]">{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
