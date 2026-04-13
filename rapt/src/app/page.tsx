"use client";
import Link from "next/link";

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    title: "Sync your schedule",
    desc: "Import from Google Calendar or myUT. We map your free blocks automatically.",
  },
  {
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
  { n: "01", title: "Create your profile", desc: "Sign up, import your course schedule, and set your study preferences." },
  { n: "02", title: "Block your availability", desc: "Mark when you're free using our When2Meet-style weekly grid." },
  { n: "03", title: "Match & study", desc: "Get paired with compatible classmates and jump straight into an active session." },
];

const STATS = [
  { value: "4,200+", label: "Students matched" },
  { value: "92%",    label: "Satisfaction rate" },
  { value: "18",     label: "Universities" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-base)]">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-[var(--color-border)] bg-[#0f1f0f]/95 px-6 backdrop-blur-sm">
        <span className="rapt-display shrink-0 text-[22px] text-white">RAPT</span>
        <div className="h-5 w-px shrink-0 bg-white/15" />
        <div className="flex flex-1 items-center gap-1">
          {["Features", "How it works"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/ /g, "-")}`}
              className="rounded-lg px-3 py-1.5 text-[13px] font-semibold text-white/50 transition-all hover:bg-white/5 hover:text-white/80"
            >
              {label}
            </a>
          ))}
                    {/* Added the direct link to the game right here! */}
          <Link 
            href="/session/error-correction"
            className="rounded-lg px-3 py-1.5 text-[13px] font-semibold text-white/50 transition-all hover:bg-white/5 hover:text-white/80"
          >
            Proofreader Game
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/login" className="rounded-lg px-3 py-1.5 text-[13px] font-semibold text-white/50 transition-all hover:bg-white/5 hover:text-white/80">
            Log in
          </Link>
          <Link href="/signup" className="rounded-xl bg-[var(--color-primary)] px-5 py-2 text-[13px] font-bold text-white shadow-[var(--shadow-primary)] transition-all hover:bg-[var(--color-primary-hover)] hover:-translate-y-px">
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="rapt-app-shell relative flex flex-col items-center justify-center overflow-hidden px-6 pb-32 pt-24 text-center">

        {/* Center vine only — left/right come from rapt-app-shell CSS */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]" viewBox="0 0 1440 700" fill="none" preserveAspectRatio="xMidYMid slice">
          <path d="M0 350 C120 338 260 360 400 344 C540 328 660 352 720 348 C780 344 900 328 1040 344 C1180 360 1320 338 1440 350" stroke="#72b84a" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M400 344 C408 324 412 308 404 298" stroke="#72b84a" strokeWidth="1.2" strokeLinecap="round"/>
          <ellipse cx="402" cy="294" rx="9" ry="5" fill="#3d7a2a" transform="rotate(-8 402 294)"/>
          <path d="M720 348 C728 366 732 382 724 392" stroke="#72b84a" strokeWidth="1.2" strokeLinecap="round"/>
          <ellipse cx="722" cy="396" rx="9" ry="5" fill="#3d7a2a" transform="rotate(6 722 396)"/>
          <path d="M1040 344 C1048 324 1052 308 1044 298" stroke="#72b84a" strokeWidth="1.2" strokeLinecap="round"/>
          <ellipse cx="1042" cy="294" rx="9" ry="5" fill="#3d7a2a" transform="rotate(-8 1042 294)"/>
          <path d="M240 354 C248 342 252 330 244 322" stroke="#72b84a" strokeWidth="0.9" strokeLinecap="round"/>
          <path d="M860 342 C868 354 872 366 864 374" stroke="#72b84a" strokeWidth="0.9" strokeLinecap="round"/>
        </svg>

        <div className="relative max-w-3xl">

          <h1 className="rapt-display mb-6 text-[clamp(42px,7vw,76px)] leading-[0.96] text-white">
            Find your perfect
            <br />
            <span className="italic text-[var(--color-primary)]">study partner.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-[17px] leading-relaxed text-[var(--color-text-secondary)]">
            RAPT matches you with classmates based on your schedule, courses, and study habits. Stop studying alone.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-primary)] px-8 py-4 text-[15px] font-bold text-white shadow-[var(--shadow-primary)] transition-all hover:bg-[var(--color-primary-hover)] hover:-translate-y-1">
              Get started free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="8" x2="13" y2="8"/><polyline points="9,4 13,8 9,12"/>
              </svg>
            </Link>
            <Link href="/login" className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-4 text-[15px] font-semibold text-white backdrop-blur-sm transition-all hover:bg-[var(--color-surface-strong)]">
              Log in
            </Link>
          </div>
        </div>

        {/* Stats row inside hero */}
        <div className="mt-16 flex items-center justify-center gap-10 flex-wrap">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="rapt-display text-[32px] text-[var(--color-primary)]">{s.value}</div>
              <div className="text-[12px] font-semibold text-[var(--color-text-muted)]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-8 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
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
            {FEATURES.map((f) => (
              <div key={f.title} className="rapt-glass-card p-7 transition-all hover:border-[var(--color-primary-muted)]">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                  {f.icon}
                </div>
                <h3 className="rapt-display mb-2 text-[17px] text-[var(--color-text-base)]">
                  {f.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="px-8 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="rapt-hero-card px-8 py-10">
            <span className="rapt-eyebrow mb-4 inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-leaf)]" />
              Simple setup
            </span>
            <h2 className="rapt-display mt-4 mb-12 text-[clamp(28px,4vw,40px)] text-[var(--color-text-base)]">
              Up and running in 3 steps
            </h2>
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
              {STEPS.map((item) => (
                <div key={item.n} className="flex flex-col">
                  <span className="rapt-display mb-3 text-[52px] leading-none text-[var(--color-primary)]/30">
                    {item.n}
                  </span>
                  <h3 className="rapt-display mb-2 text-[17px] text-[var(--color-text-base)]">
                    {item.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-8 pb-24">
        <div className="mx-auto max-w-2xl">
          <div className="rapt-glass-card flex flex-col items-center px-10 py-14 text-center">
            <span className="rapt-eyebrow mb-4 inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
              Join your classmates
            </span>
            <h2 className="rapt-display mt-4 text-[clamp(28px,4vw,42px)] leading-tight text-[var(--color-text-base)]">
              Ready to find your<br/>
              <span className="italic text-[var(--color-primary)]">study match?</span>
            </h2>
            <p className="mt-4 mb-10 max-w-sm text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
              Join thousands of students already using RAPT to make the most of their study time.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-primary)] px-10 py-4 text-[15px] font-bold text-white shadow-[var(--shadow-primary)] transition-all hover:bg-[var(--color-primary-hover)] hover:-translate-y-1">
              Get started — it&apos;s free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="8" x2="13" y2="8"/><polyline points="9,4 13,8 9,12"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--color-border)] bg-[#0f1f0f] px-8 py-6">
        <div className="flex items-center justify-between text-[12px] text-[var(--color-text-muted)] flex-wrap gap-4">
          <span className="rapt-display text-[16px] text-white">RAPT</span>
          <span>© 2026 RAPT. All rights reserved.</span>
          <div className="flex gap-4">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <span key={l} className="cursor-pointer transition-colors hover:text-[var(--color-text-secondary)]">{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
