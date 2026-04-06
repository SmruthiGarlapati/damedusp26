"use client";
import Link from "next/link";

const FEATURES = [
  {
    emoji: "🗓️",
    title: "Sync your schedule",
    desc: "Import from Google Calendar or myUT. We map your free blocks automatically.",
  },
  {
    emoji: "🦕",
    title: "Find your study match",
    desc: "We pair you with classmates based on course overlap, availability, and study style.",
  },
  {
    emoji: "🦴",
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
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-[#152b15] text-[#f5f0e8]">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 flex h-16 items-center px-8 bg-[#0f1f0f]/90 backdrop-blur-sm border-b border-white/10">
        <span style={{ fontFamily: "'Fraunces', serif" }} className="text-[22px] font-black tracking-tight text-white">
          RAPT
        </span>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-[#c8e898]/70 hover:text-[#c8e898] transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="rounded-xl bg-[#e85a0a] px-5 py-2 text-sm font-bold text-white hover:bg-[#ff7c38] transition-all hover:-translate-y-px shadow-[0_4px_20px_rgba(232,90,10,0.35)]">
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 pt-28 pb-36 text-center">

        {/* vine decorations */}
        <svg className="pointer-events-none absolute top-0 left-0 w-64 opacity-20" viewBox="0 0 160 320" fill="none">
          <path d="M20 0 Q10 40 25 70 Q40 100 15 140 Q-5 180 20 220 Q45 260 10 310" stroke="#72b84a" strokeWidth="2" strokeLinecap="round"/>
          <path d="M25 70 Q50 60 55 45" stroke="#72b84a" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M15 140 Q-10 125 -5 108" stroke="#72b84a" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M20 220 Q50 205 52 188" stroke="#72b84a" strokeWidth="1.5" strokeLinecap="round"/>
          <ellipse cx="57" cy="42" rx="8" ry="5" fill="#3d7a2a" transform="rotate(-20 57 42)"/>
          <ellipse cx="-3" cy="106" rx="7" ry="4" fill="#3d7a2a" transform="rotate(15 -3 106)"/>
          <ellipse cx="54" cy="186" rx="8" ry="5" fill="#3d7a2a" transform="rotate(-10 54 186)"/>
        </svg>
        <svg className="pointer-events-none absolute top-0 right-0 w-64 opacity-20" viewBox="0 0 160 320" fill="none" style={{transform:'scaleX(-1)'}}>
          <path d="M20 0 Q10 40 25 70 Q40 100 15 140 Q-5 180 20 220 Q45 260 10 310" stroke="#72b84a" strokeWidth="2" strokeLinecap="round"/>
          <path d="M25 70 Q50 60 55 45" stroke="#72b84a" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M15 140 Q-10 125 -5 108" stroke="#72b84a" strokeWidth="1.5" strokeLinecap="round"/>
          <ellipse cx="57" cy="42" rx="8" ry="5" fill="#3d7a2a" transform="rotate(-20 57 42)"/>
          <ellipse cx="-3" cy="106" rx="7" ry="4" fill="#3d7a2a" transform="rotate(15 -3 106)"/>
        </svg>

        <div className="relative max-w-3xl">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#3d7a2a] bg-[#1e3d1e] px-4 py-1.5 text-[12px] font-semibold text-[#c8e898]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#72b84a] animate-pulse" />
            Now at UT Austin · Spring 2026
          </span>

          <h1 style={{ fontFamily: "'Fraunces', serif" }} className="mb-6 text-[clamp(42px,7vw,76px)] font-black leading-[1.0] tracking-[-3px] text-white">
            Find your perfect
            <br />
            <span className="italic text-[#ff7c38]">study partner.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-[17px] leading-relaxed text-[#c8e898]/80">
            RAPT matches you with classmates based on your schedule, courses, and study habits. Stop studying alone.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-2xl bg-[#e85a0a] px-8 py-4 text-[15px] font-bold text-white shadow-[0_4px_24px_rgba(232,90,10,0.4)] transition-all hover:bg-[#ff7c38] hover:-translate-y-1">
              Get started free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="8" x2="13" y2="8"/><polyline points="9,4 13,8 9,12"/>
              </svg>
            </Link>
            <Link href="/login" className="rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-[15px] font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30">
              Log in
            </Link>
          </div>
        </div>

        {/* bottom grass wave */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 80" preserveAspectRatio="none" fill="none">
          <path d="M0 50 Q60 20 120 45 Q180 70 240 40 Q300 10 360 38 Q420 66 480 35 Q540 4 600 32 Q660 60 720 30 Q780 0 840 28 Q900 56 960 30 Q1020 4 1080 32 Q1140 60 1200 35 Q1260 10 1320 38 Q1380 66 1440 45 L1440 80 L0 80 Z" fill="#1e3d1e"/>
        </svg>
      </section>

      {/* ── Stats ── */}
      <section className="bg-[#1e3d1e] py-10 border-y border-white/10">
        <div className="mx-auto flex max-w-2xl items-center justify-around flex-wrap gap-6 px-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div style={{ fontFamily: "'Fraunces', serif" }} className="text-[34px] font-black tracking-tight text-[#ff7c38]">
                {s.value}
              </div>
              <div className="text-[12px] font-medium text-[#72b84a]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative bg-[#f5f0e8] px-8 py-24">
        {/* top raptor peek */}
        <svg className="absolute -top-8 right-24 w-16 opacity-60" viewBox="0 0 60 40" fill="none">
          <ellipse cx="30" cy="25" rx="18" ry="12" stroke="#2a5a2a" strokeWidth="2"/>
          <ellipse cx="44" cy="16" rx="10" ry="7" stroke="#2a5a2a" strokeWidth="2"/>
          <circle cx="48" cy="13" r="2.5" stroke="#2a5a2a" strokeWidth="1.5"/>
          <line x1="36" y1="20" x2="34" y2="23" stroke="#2a5a2a" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M50 22 Q55 24 54 20" fill="none" stroke="#2a5a2a" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>

        <div className="mx-auto max-w-5xl">
          <h2 style={{ fontFamily: "'Fraunces', serif" }} className="mb-3 text-center text-[36px] font-black tracking-tight text-[#152b15]">
            Everything you need to study smarter
          </h2>
          <p className="mb-14 text-center text-[15px] text-[#3d7a2a]">
            Built for university students who want more out of every study session.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-[#d4c8b0] bg-white p-7 hover:border-[#72b84a] transition-colors">
                <div className="mb-4 text-3xl">{f.emoji}</div>
                <h3 style={{ fontFamily: "'Fraunces', serif" }} className="mb-2 text-[17px] font-black text-[#152b15]">
                  {f.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-[#3d7a2a]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-[#1e3d1e] px-8 py-24 relative overflow-hidden">
        <svg className="pointer-events-none absolute bottom-0 left-0 w-48 opacity-15" viewBox="0 0 120 200" fill="none">
          <path d="M10 200 Q8 160 15 130 Q22 100 10 75 Q0 55 5 40 Q8 28 14 35 Q20 42 16 55 Q24 42 30 47 Q36 52 28 65 Q38 55 44 60 Q50 65 42 78 Q48 70 54 75 Q58 80 50 90 Q44 98 36 100 Q30 104 28 120 Q26 140 30 200 Z" fill="#4a7c3a"/>
        </svg>
        <svg className="pointer-events-none absolute top-0 right-0 w-32 opacity-15" viewBox="0 0 100 160" fill="none" style={{transform:'scaleX(-1)'}}>
          <path d="M10 0 Q8 30 15 55 Q22 80 10 100 Q0 118 5 132 Q8 144 14 138 Q20 132 16 120 Q24 132 30 128 Q36 124 28 112 Q38 122 44 118 Q50 114 42 102 Q48 110 54 106 Q58 102 50 92 Q44 84 36 82 Q30 78 28 60 Q26 40 30 0 Z" fill="#4a7c3a"/>
        </svg>

        <div className="mx-auto max-w-4xl relative">
          <h2 style={{ fontFamily: "'Fraunces', serif" }} className="mb-14 text-center text-[36px] font-black tracking-tight text-white">
            Up and running in 3 steps
          </h2>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {STEPS.map((item) => (
              <div key={item.n} className="flex flex-col">
                <span style={{ fontFamily: "'Fraunces', serif" }} className="mb-3 text-[52px] font-black leading-none text-[#ff7c38]/30">
                  {item.n}
                </span>
                <h3 style={{ fontFamily: "'Fraunces', serif" }} className="mb-2 text-[17px] font-black text-white">
                  {item.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-[#c8e898]/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative flex flex-col items-center overflow-hidden px-8 py-28 text-center bg-[#152b15]">
        <svg className="pointer-events-none absolute top-0 left-0 w-full opacity-30" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0 30 Q80 0 160 25 Q240 50 320 20 Q400 -10 480 18 Q560 46 640 20 Q720 -6 800 22 Q880 50 960 22 Q1040 -6 1120 20 Q1200 46 1280 20 Q1360 -6 1440 18 L1440 0 L0 0 Z" fill="#2a5a2a"/>
        </svg>

        <div className="relative max-w-xl">
          <div className="mb-4 text-4xl">🦕</div>
          <h2 style={{ fontFamily: "'Fraunces', serif" }} className="mb-4 text-[42px] font-black tracking-tight text-white leading-tight">
            Ready to find your<br/>
            <span className="italic text-[#ff7c38]">study match?</span>
          </h2>
          <p className="mb-10 text-[15px] text-[#c8e898]/70 leading-relaxed">
            Join thousands of students already using RAPT to make the most of their study time.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 rounded-2xl bg-[#e85a0a] px-10 py-4 text-[15px] font-bold text-white shadow-[0_4px_24px_rgba(232,90,10,0.4)] transition-all hover:bg-[#ff7c38] hover:-translate-y-1">
            Get started — it&apos;s free
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="8" x2="13" y2="8"/><polyline points="9,4 13,8 9,12"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 bg-[#0f1f0f] px-8 py-6">
        <div className="flex items-center justify-between text-[12px] text-[#72b84a]/60 flex-wrap gap-4">
          <span style={{ fontFamily: "'Fraunces', serif" }} className="font-black text-[16px] text-white">RAPT</span>
          <span>© 2026 RAPT. All rights reserved.</span>
          <div className="flex gap-4">
            {["Privacy", "Terms", "Contact"].map(l => (
              <span key={l} className="cursor-pointer hover:text-[#c8e898] transition-colors">{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}