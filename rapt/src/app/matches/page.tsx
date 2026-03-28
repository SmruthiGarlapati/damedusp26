"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { addSession } from "@/lib/sessionsStore";

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
type MatchType = "1-on-1" | "group" | "co-study";

interface Partner {
  id: string;
  name: string;
  initials: string;
  role: string;        // "Teaches" | "Needs guidance" | "Co-study"
  course: string;
  location: string;
  matchPct: number;
  type: MatchType;
  methods: string[];
  availability: string;
}

const PARTNERS: Partner[] = [
  {
    id: "1",
    name: "Rhea Patel",
    initials: "RP",
    role: "Prefers to teach",
    course: "CS 312: Algorithms",
    location: "PCL Level 3",
    matchPct: 97,
    type: "1-on-1",
    methods: ["Whiteboard", "Practice Problems"],
    availability: "MWF 10–12 PM",
  },
  {
    id: "2",
    name: "Jason Yao",
    initials: "JY",
    role: "Needs guidance",
    course: "PHYS 201: Mechanics",
    location: "Union Building",
    matchPct: 89,
    type: "1-on-1",
    methods: ["Cliff Notes", "Discussion"],
    availability: "Tue/Thu afternoons",
  },
  {
    id: "3",
    name: "Elena Chen",
    initials: "EC",
    role: "Collaborative",
    course: "CS 3450: Software Eng",
    location: "FAC 214",
    matchPct: 94,
    type: "1-on-1",
    methods: ["Pomodoro", "Flashcards"],
    availability: "Weekdays 2–5 PM",
  },
  {
    id: "4",
    name: "Jasmine Ball, Ayan Jannu, Neel Asija",
    initials: "JB",
    role: "Silent co-working",
    course: "MATH 445: Statistics",
    location: "Botanical Cafe",
    matchPct: 81,
    type: "group",
    methods: ["Co-study", "Practice Problems"],
    availability: "Sat mornings",
  },
  {
    id: "5",
    name: "Marcus Thorne",
    initials: "MT",
    role: "Collaborative",
    course: "MATH 2210: Multivariable",
    location: "PCL Level 5",
    matchPct: 91,
    type: "1-on-1",
    methods: ["Discussion", "Whiteboard"],
    availability: "MWF 3–5 PM",
  },
  {
    id: "6",
    name: "Study Pod · CS 314",
    initials: "SP",
    role: "Group study",
    course: "CS 314: Data Structures",
    location: "GDC 2.210",
    matchPct: 78,
    type: "group",
    methods: ["Discussion", "Practice Problems"],
    availability: "Thu evenings",
  },
];

const TYPE_LABEL: Record<MatchType, string> = {
  "1-on-1": "1-on-1",
  group: "Group",
  "co-study": "Co-study",
};

const TYPE_STYLE: Record<MatchType, string> = {
  "1-on-1": "bg-[var(--color-teal-light)] text-[var(--color-primary)]",
  group: "bg-indigo-50 text-indigo-700",
  "co-study": "bg-[var(--color-surface)] text-[var(--color-text-secondary)]",
};

const REQUEST_LABEL: Record<MatchType, string> = {
  "1-on-1": "Request Session",
  group: "Request to Join Group",
  "co-study": "Request to Co-study",
};

const MODAL_TITLE: Record<MatchType, string> = {
  "1-on-1": "Request a 1-on-1 Session",
  group: "Request to Join Group",
  "co-study": "Request a Co-study Session",
};

/* ─────────────────────────────────────────────
   Request modal
───────────────────────────────────────────── */
interface RequestTarget {
  partner: Partner;
}

function RequestModal({
  target,
  onClose,
  onSend,
}: {
  target: RequestTarget;
  onClose: () => void;
  onSend: (date: string, time: string, duration: number, notes: string) => void;
}) {
  const { partner } = target;
  const todayStr = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--color-primary)] px-6 py-5 text-white">
          <h2 className="text-lg font-extrabold">{MODAL_TITLE[partner.type]}</h2>
          <p className="mt-0.5 text-[13px] text-white/70">
            {partner.type === "group"
              ? `Joining ${partner.name} · ${partner.course}`
              : `with ${partner.name} · ${partner.course}`}
          </p>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Date + time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Date</label>
              <input
                type="date"
                value={date}
                min={todayStr}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Duration</label>
            <div className="flex gap-2">
              {[30, 60, 90, 120].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 rounded-xl border-[1.5px] py-2 text-[13px] font-semibold transition-all ${
                    duration === d
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                      : "border-[var(--color-border)] hover:border-[var(--color-primary-muted)]"
                  }`}
                >
                  {d < 60 ? `${d}m` : `${d / 60}h`}
                </button>
              ))}
            </div>
          </div>

          {/* What to work on */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              {partner.type === "group" ? "Why do you want to join?" : "What do you want to work on?"}
              {" "}(optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={
                partner.type === "group"
                  ? "e.g. Need help with Stats hw, want to co-study for exam..."
                  : "e.g. Assignment 4, exam prep, chapter 7..."
              }
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none resize-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 rounded-xl bg-[var(--color-surface)] px-3 py-2.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b6b65" strokeWidth="2" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="text-[12px] text-[var(--color-text-secondary)]">{partner.location}</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-[var(--color-border)] py-3 text-[14px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSend(date, time, duration, notes)}
              className="flex-1 rounded-xl bg-[var(--color-primary)] py-3 text-[14px] font-bold text-white shadow-[var(--shadow-primary)] hover:bg-[var(--color-primary-hover)] transition-all"
            >
              {partner.type === "group" ? "Send Join Request" : "Send Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Match card
───────────────────────────────────────────── */
function MatchCard({
  partner,
  sent,
  onRequest,
  onProfile,
}: {
  partner: Partner;
  sent: boolean;
  onRequest: () => void;
  onProfile: () => void;
}) {
  const pctColor =
    partner.matchPct >= 90
      ? "text-green-600"
      : partner.matchPct >= 75
      ? "text-amber-600"
      : "text-[var(--color-text-muted)]";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
      {/* Card header */}
      <div className="p-5 pb-3">
        <div className="mb-3 flex items-start gap-3">
          {/* Avatar */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[13px] font-bold text-white">
            {partner.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[15px] font-bold leading-tight">{partner.name}</h3>
            </div>
            <p className="text-[12px] text-[var(--color-text-secondary)]">{partner.role}</p>
          </div>
          {/* Match % */}
          <div className="shrink-0 text-right">
            <div className={`text-[22px] font-extrabold leading-none ${pctColor}`}>
              {partner.matchPct}%
            </div>
            <div className="text-[10px] font-medium text-[var(--color-text-muted)]">match</div>
          </div>
        </div>

        {/* Details */}
        <div className="mb-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-secondary)]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            {partner.course}
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-secondary)]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {partner.location}
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-secondary)]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {partner.availability}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TYPE_STYLE[partner.type]}`}>
            {TYPE_LABEL[partner.type]}
          </span>
          {partner.methods.map((m) => (
            <span key={m} className="rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--color-text-secondary)]">
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Action row */}
      <div className="mt-auto flex items-center justify-between border-t border-[var(--color-border-light)] px-5 py-3.5">
        <button onClick={onProfile} className="text-[12px] font-semibold text-[var(--color-primary)] hover:underline">
          View Profile
        </button>
        {sent ? (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            Request sent
          </span>
        ) : (
          <button
            onClick={onRequest}
            className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-[12px] font-bold text-white shadow-[var(--shadow-primary)] transition-all hover:bg-[var(--color-primary-hover)] hover:-translate-y-px"
          >
            {REQUEST_LABEL[partner.type]}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Partner profile modal
───────────────────────────────────────────── */
const PARTNER_EXTRA: Record<string, {
  major: string; year: string; rating: number; sessions: number;
  bio: string; badges: string[];
}> = {
  "1": { major: "Computer Science", year: "Junior", rating: 4.9, sessions: 18, bio: "I love breaking down complex algorithms into simple steps. Happy to walk through anything from sorting to dynamic programming!", badges: ["Top Teacher", "Reliable", "5+ Sessions"] },
  "2": { major: "Physics", year: "Sophomore", rating: 4.5, sessions: 7, bio: "Working through mechanics labs and looking for someone patient to help me solidify the concepts. I come prepared!", badges: ["Motivated", "Prepared"] },
  "3": { major: "Computer Science", year: "Senior", rating: 4.8, sessions: 24, bio: "Fourth year CS student who loves collaborative problem-solving. I bring snacks 😄", badges: ["Top Collaborator", "Reliable", "10+ Sessions"] },
  "4": { major: "Mathematics", year: "Mixed", rating: 4.6, sessions: 31, bio: "A small group of us meet weekly for stats. We keep it quiet and focused — great for grinding problem sets.", badges: ["Group Lead", "Consistent", "Weekly"] },
  "5": { major: "Mathematics", year: "Junior", rating: 4.7, sessions: 15, bio: "Math major who enjoys talking through proofs and concepts on the whiteboard. Let's figure it out together.", badges: ["Reliable", "Whiteboard Pro"] },
  "6": { major: "Computer Science", year: "Mixed", rating: 4.4, sessions: 9, bio: "A study pod for CS 314. We do practice problems and discuss concepts before exams. Open to new members!", badges: ["Group", "Open to All"] },
};

function ProfileModal({ partner, onClose, onRequest }: {
  partner: Partner;
  onClose: () => void;
  onRequest: () => void;
}) {
  const extra = PARTNER_EXTRA[partner.id] ?? {
    major: "Undeclared", year: "Unknown", rating: 4.5, sessions: 0,
    bio: "No bio yet.", badges: [],
  };
  const pctColor = partner.matchPct >= 90 ? "text-green-600" : partner.matchPct >= 75 ? "text-amber-600" : "text-[var(--color-text-muted)]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-[var(--color-primary)] px-6 pt-6 pb-14 text-white">
          <button onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/>
            </svg>
          </button>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-extrabold">
              {partner.initials}
            </div>
            <div>
              <h2 className="text-xl font-extrabold">{partner.name}</h2>
              <p className="text-[13px] text-white/70">{extra.major} · {extra.year}</p>
              <p className="text-[12px] text-white/60">{partner.course}</p>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="-mt-8 mx-5 grid grid-cols-3 gap-3">
          {[
            { label: "Match", value: `${partner.matchPct}%`, color: pctColor },
            { label: "Rating", value: `${extra.rating}`, color: "text-[var(--color-text-base)]" },
            { label: "Sessions", value: `${extra.sessions}`, color: "text-[var(--color-text-base)]" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-3 text-center shadow-[var(--shadow-sm)]">
              <div className={`text-[20px] font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] font-medium text-[var(--color-text-muted)]">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Bio */}
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">About</p>
            <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{extra.bio}</p>
          </div>

          {/* Badges */}
          {extra.badges.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Badges</p>
              <div className="flex flex-wrap gap-1.5">
                {extra.badges.map((b) => (
                  <span key={b} className="rounded-full bg-[var(--color-tag-green)] px-3 py-1 text-[11px] font-semibold text-[var(--color-primary)]">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: "📍", label: partner.location },
              { icon: "🕐", label: partner.availability },
              { icon: "🎯", label: partner.role },
              { icon: "📚", label: partner.methods.join(", ") },
            ].map((d) => (
              <div key={d.label} className="flex items-center gap-2 rounded-xl bg-[var(--color-surface)] px-3 py-2.5">
                <span className="text-sm">{d.icon}</span>
                <span className="text-[12px] text-[var(--color-text-secondary)] truncate">{d.label}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 rounded-xl border border-[var(--color-border)] py-3 text-[14px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] transition-colors">
              Close
            </button>
            <button onClick={() => { onClose(); onRequest(); }} className="flex-1 rounded-xl bg-[var(--color-primary)] py-3 text-[14px] font-bold text-white shadow-[var(--shadow-primary)] hover:bg-[var(--color-primary-hover)] transition-all">
              {REQUEST_LABEL[partner.type]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
const COURSE_FILTERS = ["All", "CS 312", "PHYS 201", "CS 3450", "MATH 445", "MATH 2210", "CS 314"];
const TYPE_FILTERS: Array<"all" | MatchType> = ["all", "1-on-1", "group", "co-study"];

export default function MatchesPage() {
  const router = useRouter();
  const [courseFilter, setCourseFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState<"all" | MatchType>("all");
  const [requestTarget, setRequestTarget] = useState<Partner | null>(null);
  const [profileTarget, setProfileTarget] = useState<Partner | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const filtered = PARTNERS.filter((p) => {
    const courseOk = courseFilter === "All" || p.course.startsWith(courseFilter);
    const typeOk = typeFilter === "all" || p.type === typeFilter;
    return courseOk && typeOk;
  }).sort((a, b) => b.matchPct - a.matchPct);

  function handleSendRequest(date: string, time: string, duration: number, notes: string) {
    if (!requestTarget) return;
    addSession({
      id: Date.now().toString(),
      partnerName: requestTarget.name,
      partnerInitials: requestTarget.initials,
      course: requestTarget.course,
      location: requestTarget.location,
      scheduledAt: new Date(`${date}T${time}`),
      duration,
      status: "pending",
      requestedByMe: true,
      studyMethods: requestTarget.methods,
      notes: notes || undefined,
    });
    setSentIds((prev) => new Set([...prev, requestTarget.id]));
    setRequestTarget(null);
    router.push("/sessions");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      {requestTarget && (
        <RequestModal
          target={{ partner: requestTarget }}
          onClose={() => setRequestTarget(null)}
          onSend={handleSendRequest}
        />
      )}
      {profileTarget && (
        <ProfileModal
          partner={profileTarget}
          onClose={() => setProfileTarget(null)}
          onRequest={() => setRequestTarget(profileTarget)}
        />
      )}
      <Navbar showSearch />

      <main className="flex-1 px-12 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[38px] font-extrabold tracking-[-1.5px] leading-tight">
            Your Matches
          </h1>
          <p className="mt-1.5 text-[15px] text-[var(--color-text-secondary)]">
            Sorted by compatibility — request a session with anyone below.
          </p>
        </div>

        {/* Filter bar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {/* Course filter */}
          <div className="flex flex-wrap gap-1.5">
            {COURSE_FILTERS.map((c) => (
              <button
                key={c}
                onClick={() => setCourseFilter(c)}
                className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                  courseFilter === c
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                    : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-primary-muted)]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="ml-auto flex gap-1.5">
            {TYPE_FILTERS.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[12px] font-semibold capitalize transition-all ${
                  typeFilter === t
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                    : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-primary-muted)]"
                }`}
              >
                {t === "all" ? "All types" : TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="mb-5 text-[13px] text-[var(--color-text-muted)]">
          {filtered.length} match{filtered.length !== 1 ? "es" : ""} found
        </p>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-white py-20 text-center">
            <p className="text-[15px] font-semibold text-[var(--color-text-secondary)]">No matches for these filters</p>
            <button
              onClick={() => { setCourseFilter("All"); setTypeFilter("all"); }}
              className="mt-4 text-[13px] font-semibold text-[var(--color-primary)] hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {filtered.map((p) => (
              <MatchCard
                key={p.id}
                partner={p}
                sent={sentIds.has(p.id)}
                onRequest={() => setRequestTarget(p)}
                onProfile={() => setProfileTarget(p)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
