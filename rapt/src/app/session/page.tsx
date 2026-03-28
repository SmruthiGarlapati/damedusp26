"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const PROGRESS_BARS = [true, false, false, false];

const THREADS = [
  {
    id: "1",
    tag: "help" as const,
    question: "How do we calculate the Gini coefficient for the homework?",
    timeAgo: "12m ago",
  },
  {
    id: "2",
    tag: "clarification" as const,
    question: "Clarifying the difference between Elastic and Inelastic demand.",
    timeAgo: "1h ago",
  },
];

const RESOURCES = [
  { id: "1", name: "week-4-lecture-notes.pdf", uploader: "Sarah J.", type: "pdf" as const },
  { id: "2", name: "supply-demand-graphs.png", uploader: "Mark T.", type: "image" as const },
];

const NAV_ITEMS = [
  { label: "Active Session", id: "session", icon: <BookIcon /> },
  { label: "Practice Quizzes", id: "quizzes", icon: <QuizIcon /> },
  { label: "Discussion Board", id: "discussion", icon: <ChatIcon /> },
];

export default function SessionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("session");
  const [revealed, setRevealed] = useState(false);
  const [cardIdx, setCardIdx] = useState(0);

  // Pull context from query params (set by sessions dashboard)
  const partnerName = searchParams.get("partner") ?? "Study Group";
  const course = searchParams.get("course") ?? "Your Course";
  const location = searchParams.get("location") ?? "PCL Library, Room 402";
  const duration = Number(searchParams.get("duration") ?? 90);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Session banner */}
      <div className="flex items-center gap-3 border-b border-green-200 bg-green-600 px-8 py-2.5 text-white">
        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
        <span className="text-[13px] font-bold">
          Live Session · {course} with {partnerName}
        </span>
        <span className="ml-auto text-[12px] font-medium text-white/70">
          {duration} min · {location}
        </span>
        <button
          onClick={() => router.push("/sessions")}
          className="ml-4 flex items-center gap-1.5 rounded-lg border border-white/30 px-3 py-1 text-[12px] font-semibold transition-colors hover:bg-white/20"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="13" y1="8" x2="3" y2="8" /><polyline points="7,4 3,8 7,12" />
          </svg>
          Back to Sessions
        </button>
        <button
          onClick={() => router.push("/sessions")}
          className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1 text-[12px] font-bold text-white shadow transition-colors hover:bg-red-600"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>
          </svg>
          End Session
        </button>
      </div>

      <div className="grid flex-1" style={{ gridTemplateColumns: "260px 1fr 260px" }}>
        {/* ── Left sidebar ── */}
        <aside className="flex flex-col border-r border-[var(--color-border)] p-6">
          <div className="mb-5">
            <h2 className="text-lg font-extrabold leading-tight tracking-tight">
              Study Session
            </h2>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
              {course}
            </p>
          </div>

          {/* Nav */}
          <nav className="mb-5 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  activeNav === item.id
                    ? "bg-[var(--color-primary)] font-semibold text-white shadow-[var(--shadow-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-base)]"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Shared Resources */}
          <div className="mt-1 border-t border-[var(--color-border)] pt-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              Shared Resources
            </p>
            <div className="flex flex-col gap-2">
              {RESOURCES.map((r) => (
                <div
                  key={r.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-[var(--color-border)] bg-white p-3 transition-colors hover:border-[var(--color-primary-muted)]"
                >
                  {r.type === "pdf" ? <PdfIcon /> : <ImageFileIcon />}
                  <div>
                    <p className="text-[12px] font-semibold">{r.name}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      Uploaded by {r.uploader}
                    </p>
                  </div>
                </div>
              ))}
              <button className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-dashed border-[var(--color-border)] py-2.5 text-[12px] font-medium text-[var(--color-text-muted)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
                <PlusIcon /> Upload Material
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex flex-col gap-6 p-8">
          {/* Flashcard */}
          <div className="relative flex min-h-[380px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-md)]">
            {/* Progress bars */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-1">
              {PROGRESS_BARS.map((active, i) => (
                <div
                  key={i}
                  className={`h-1 w-12 rounded-full ${active || i === cardIdx ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"}`}
                />
              ))}
            </div>

            <p className="mb-6 text-[12px] font-bold uppercase tracking-widest text-[var(--color-primary)]">
              Concept {cardIdx + 1} of 12
            </p>

            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="mb-8 flex cursor-pointer items-center gap-2.5 rounded-lg bg-[var(--color-primary)] px-8 py-4 text-base font-semibold text-white shadow-[var(--shadow-primary)] transition-all hover:-translate-y-px hover:bg-[var(--color-primary-hover)]"
              >
                <EyeIcon /> Reveal Answer
              </button>
            ) : (
              <div className="mb-8 max-w-md text-center">
                <p className="text-[15px] leading-relaxed text-[var(--color-text-base)]">
                  The Law of Demand states that, all other factors being equal,
                  as the price of a good or service increases, consumer demand
                  for the good or service will decrease, and vice versa.
                </p>
                <button
                  onClick={() => setRevealed(false)}
                  className="mt-4 cursor-pointer text-[12px] font-semibold text-[var(--color-primary)] hover:underline"
                >
                  Hide answer
                </button>
              </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-5 left-0 right-0 flex items-center justify-between px-6">
              <button
                onClick={() => { setCardIdx((i) => Math.max(0, i - 1)); setRevealed(false); }}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] shadow-[var(--shadow-sm)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                <ChevronLeftIcon />
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => { setCardIdx((i) => i + 1); setRevealed(false); }}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-red-100 text-red-500 transition-transform hover:scale-110"
                >
                  <XIcon />
                </button>
                <button
                  onClick={() => { setCardIdx((i) => i + 1); setRevealed(false); }}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[var(--color-teal-light)] text-[var(--color-primary)] transition-transform hover:scale-110"
                >
                  <CheckIcon />
                </button>
              </div>
              <button
                onClick={() => { setCardIdx((i) => Math.min(11, i + 1)); setRevealed(false); }}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] shadow-[var(--shadow-sm)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>

          {/* Discussion Threads */}
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-sm)]">
            <h3 className="mb-4 text-base font-bold">Discussion Threads</h3>
            <div className="grid grid-cols-2 gap-3">
              {THREADS.map((t) => (
                <div
                  key={t.id}
                  className="cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-primary-muted)]"
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        t.tag === "help"
                          ? "bg-[var(--color-tag-green)] text-[var(--color-primary)]"
                          : "bg-[var(--color-text-base)] text-white"
                      }`}
                    >
                      {t.tag === "help" ? "Help Needed" : "Clarification"}
                    </span>
                    <span className="text-[11px] text-[var(--color-text-muted)]">
                      {t.timeAgo}
                    </span>
                  </div>
                  <p className="text-[13px] font-semibold leading-snug">{t.question}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* ── Right sidebar — Session Logistics ── */}
        <aside className="border-l border-[var(--color-border)] p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              Session Logistics
            </p>
            <button className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]">
              <SettingsIcon />
            </button>
          </div>

          {/* Map */}
          <div className="mb-4 overflow-hidden rounded-lg border border-[var(--color-border)]">
            <svg viewBox="0 0 234 128" className="w-full">
              <rect width="234" height="128" fill="#e0e0db" />
              <line x1="0" y1="35" x2="234" y2="35" stroke="#c8c8c0" strokeWidth="1.5" />
              <line x1="0" y1="64" x2="234" y2="64" stroke="#c8c8c0" strokeWidth="2" />
              <line x1="0" y1="93" x2="234" y2="93" stroke="#c8c8c0" strokeWidth="1.5" />
              <line x1="58" y1="0" x2="58" y2="128" stroke="#c8c8c0" strokeWidth="1.5" />
              <line x1="117" y1="0" x2="117" y2="128" stroke="#c8c8c0" strokeWidth="1" />
              <line x1="176" y1="0" x2="176" y2="128" stroke="#c8c8c0" strokeWidth="1.5" />
              <circle cx="117" cy="64" r="10" fill="#1a4a42" opacity="0.9" />
              <circle cx="117" cy="64" r="4" fill="white" />
            </svg>
          </div>

          {/* Location */}
          <div className="mb-4">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Location
            </p>
            <p className="text-[13px] font-semibold">{location}</p>
          </div>

          {/* Amenities */}
          <div>
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Confirmed Amenities
            </p>
                <div className="flex flex-col gap-2">
              {[
                { label: "Projector", icon: <ProjectorIcon /> },
                { label: "Whiteboard", icon: <WhiteboardIcon /> },
                { label: "Fast Wi-Fi", icon: <WifiIcon /> },
                { label: "Cafe Nearby", icon: <CafeIcon /> },
              ].map((a) => (
                <div
                  key={a.label}
                  className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-[12px] font-medium"
                >
                  {a.icon} {a.label}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ── Icons ── */
function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
function QuizIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="2" y="2" width="20" height="20" rx="2" /><path d="M9 9h1a3 3 0 0 1 0 6H9v-6z" /><path d="M13 15h2" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function PdfIcon() {
  return (
    <svg width="16" height="20" viewBox="0 0 16 20" fill="none" stroke="#6b6b65" strokeWidth="1.8" strokeLinecap="round">
      <path d="M9 1H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7L9 1z" /><path d="M9 1v6h6" />
    </svg>
  );
}
function ImageFileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#6b6b65" strokeWidth="1.8" strokeLinecap="round">
      <rect x="1" y="1" width="16" height="16" rx="2" /><circle cx="6" cy="6" r="2" /><path d="M1 13l4-4 3 3 3-3 4 4" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="6" y1="1" x2="6" y2="11" /><line x1="1" y1="6" x2="11" y2="6" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="22" height="15" viewBox="0 0 22 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 7.5C1 7.5 4.5 2 11 2C17.5 2 21 7.5 21 7.5C21 7.5 17.5 13 11 13C4.5 13 1 7.5 1 7.5Z" /><circle cx="11" cy="7.5" r="2.5" />
    </svg>
  );
}
function ChevronLeftIcon() {
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="6,1 2,6 6,11" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="2,1 6,6 2,11" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="2" y1="2" x2="12" y2="12" /><line x1="12" y1="2" x2="2" y2="12" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="3,10 8,15 17,5" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="6" cy="6" r="5" /><path d="M6 3v3l2 2" />
    </svg>
  );
}
function ProjectorIcon() {
  return (
    <svg width="13" height="11" viewBox="0 0 13 11" fill="none" stroke="#6b6b65" strokeWidth="1.5" strokeLinecap="round">
      <rect x="0" y="0" width="13" height="9" rx="1" /><line x1="6" y1="9" x2="6" y2="11" /><line x1="3" y1="11" x2="10" y2="11" />
    </svg>
  );
}
function WhiteboardIcon() {
  return (
    <svg width="13" height="11" viewBox="0 0 13 11" fill="none" stroke="#6b6b65" strokeWidth="1.5" strokeLinecap="round">
      <rect x="0" y="0" width="13" height="9" rx="1" /><line x1="0" y1="4" x2="13" y2="4" />
    </svg>
  );
}
function WifiIcon() {
  return (
    <svg width="14" height="10" viewBox="0 0 16 11" fill="none" stroke="#6b6b65" strokeWidth="1.5" strokeLinecap="round">
      <path d="M1 4C4 1.5 7 1 8 4C9 1 12 1.5 15 4" /><path d="M3 6.5C5 5 6.5 5 8 6.5C9.5 5 11 5 13 6.5" /><circle cx="8" cy="9" r="1" fill="#6b6b65" />
    </svg>
  );
}
function CafeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#6b6b65" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 1h6l1 4H2L3 1z" /><path d="M2 5v5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V5" />
    </svg>
  );
}
