"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { addSession } from "@/lib/sessionsStore";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/lib/useCurrentUser";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Partner {
  id: string;
  name: string;
  initials: string;
  sharedCourses: string[];
  allCourses: string[];
  location: string;
  matchPct: number;
  matchBreakdown: MatchBreakdown;
  methods: string[];
  rating: number;
  bio: string;
  major: string;
  year: string;
  sessionsCompleted: number;
}

interface MatchBreakdown {
  courseScore: number;    // 0–50
  methodScore: number;   // 0–30
  groupScore: number;    // 0–12
  envScore: number;      // 0–8
}

/* ─────────────────────────────────────────────
   Matching algorithm
───────────────────────────────────────────── */

/**
 * Student-to-student matching.
 * Weights: course overlap 50%, study methods 30%, group size 12%, environment 8%.
 */
function computeMatch(
  me: { preferences: Record<string, unknown>; courses: string[] },
  them: { preferences: Record<string, unknown>; courses: string[] }
): { pct: number; breakdown: MatchBreakdown } {
  // ── 1. Course overlap (weight 0.50) ──────────────────────────────
  const shared = me.courses.filter((c) => them.courses.includes(c));
  const courseRaw = shared.length === 0 ? 0 : shared.length === 1 ? 0.7 : 1.0;

  // ── 2. Study methods – Jaccard similarity (weight 0.30) ──────────
  const myM = (me.preferences.techniques as string[]) ?? [];
  const thM = (them.preferences.techniques as string[]) ?? [];
  let methodRaw = 0.5;
  if (myM.length > 0 && thM.length > 0) {
    const intersection = myM.filter((m) => thM.includes(m)).length;
    const union = new Set([...myM, ...thM]).size;
    methodRaw = union > 0 ? intersection / union : 0;
  }

  // ── 3. Group size preference (weight 0.12) ───────────────────────
  const myGrp = (me.preferences.group_size as string) ?? "";
  const thGrp = (them.preferences.group_size as string) ?? "";
  const groupRaw = !myGrp || !thGrp ? 0.5 : myGrp === thGrp ? 1.0 : 0.25;

  // ── 4. Environment type (weight 0.08) ─────────────────────────────
  const myEnv = (me.preferences.environment_type as string) ?? "";
  const thEnv = (them.preferences.environment_type as string) ?? "";
  const envRaw = !myEnv || !thEnv ? 0.5 : myEnv === thEnv ? 1.0 : 0.25;

  const pct = Math.round(
    courseRaw * 50 + methodRaw * 30 + groupRaw * 12 + envRaw * 8
  );

  return {
    pct: Math.min(100, pct),
    breakdown: {
      courseScore: Math.round(courseRaw * 50),
      methodScore: Math.round(methodRaw * 30),
      groupScore:  Math.round(groupRaw  * 12),
      envScore:    Math.round(envRaw    *  8),
    },
  };
}

function toInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}


/* ─────────────────────────────────────────────
   Request modal
───────────────────────────────────────────── */
function RequestModal({
  target,
  onClose,
  onSend,
}: {
  target: Partner;
  onClose: () => void;
  onSend: (date: string, time: string, duration: number, notes: string) => void;
}) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [date,     setDate]     = useState(todayStr);
  const [time,     setTime]     = useState("10:00");
  const [duration, setDuration] = useState(60);
  const [notes,    setNotes]    = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="bg-[var(--color-primary)] px-6 py-5 text-white">
          <h2 className="text-lg font-extrabold">Request a Study Session</h2>
          <p className="mt-0.5 text-[13px] text-white/70">
            with {target.name} · {target.sharedCourses[0] ?? target.allCourses[0] ?? ""}
          </p>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Date</label>
              <input type="date" value={date} min={todayStr} onChange={(e) => setDate(e.target.value)}
                className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Duration</label>
            <div className="flex gap-2">
              {[30, 60, 90, 120].map((d) => (
                <button key={d} onClick={() => setDuration(d)}
                  className={`flex-1 rounded-xl border-[1.5px] py-2 text-[13px] font-semibold transition-all ${
                    duration === d
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                      : "border-[var(--color-border)] hover:border-[var(--color-primary-muted)]"
                  }`}>
                  {d < 60 ? `${d}m` : `${d / 60}h`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              What do you want to work on? (optional)
            </label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="e.g. Assignment 4, exam prep, chapter 7..."
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none resize-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]" />
          </div>

          {target.location && (
            <div className="flex items-center gap-2 rounded-xl bg-[var(--color-surface)] px-3 py-2.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b6b65" strokeWidth="2" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span className="text-[12px] text-[var(--color-text-secondary)]">{target.location}</span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 rounded-xl border border-[var(--color-border)] py-3 text-[14px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] transition-colors">
              Cancel
            </button>
            <button onClick={() => onSend(date, time, duration, notes)}
              className="flex-1 rounded-xl bg-[var(--color-primary)] py-3 text-[14px] font-bold text-white shadow-[var(--shadow-primary)] hover:bg-[var(--color-primary-hover)] transition-all">
              Send Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Match score breakdown tooltip
───────────────────────────────────────────── */
function ScoreBreakdown({ bd }: { bd: MatchBreakdown }) {
  const bars: Array<{ label: string; score: number; max: number; color: string }> = [
    { label: "Courses",    score: bd.courseScore, max: 50, color: "bg-[var(--color-primary)]" },
    { label: "Methods",    score: bd.methodScore, max: 30, color: "bg-indigo-500" },
    { label: "Group size", score: bd.groupScore,  max: 12, color: "bg-amber-500" },
    { label: "Environment",score: bd.envScore,    max:  8, color: "bg-pink-400" },
  ];
  return (
    <div className="flex flex-col gap-1.5 py-1">
      {bars.map((b) => (
        <div key={b.label}>
          <div className="mb-0.5 flex justify-between text-[10px] font-medium text-[var(--color-text-muted)]">
            <span>{b.label}</span>
            <span>{b.score}/{b.max}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[var(--color-border)]">
            <div
              className={`h-full rounded-full ${b.color}`}
              style={{ width: `${(b.score / b.max) * 100}%` }}
            />
          </div>
        </div>
      ))}
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
  const [showBreakdown, setShowBreakdown] = useState(false);

  const pctColor =
    partner.matchPct >= 90 ? "text-green-600"
    : partner.matchPct >= 75 ? "text-amber-600"
    : "text-[var(--color-text-muted)]";

  const displayCourse = partner.sharedCourses[0] ?? partner.allCourses[0] ?? "—";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
      <div className="p-5 pb-3">
        <div className="mb-3 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[13px] font-bold text-white">
            {partner.initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="truncate text-[15px] font-bold leading-tight">{partner.name}</h3>
            <p className="text-[12px] text-[var(--color-text-secondary)]">Student</p>
          </div>
          {/* Match % with breakdown toggle */}
          <div className="relative shrink-0 text-right">
            <button
              onClick={() => setShowBreakdown((v) => !v)}
              className="group"
              title="View score breakdown"
            >
              <div className={`text-[22px] font-extrabold leading-none ${pctColor}`}>
                {partner.matchPct}%
              </div>
              <div className="text-[10px] font-medium text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors">
                match ▾
              </div>
            </button>
            {showBreakdown && (
              <div className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-lg)]">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Score Breakdown</p>
                <ScoreBreakdown bd={partner.matchBreakdown} />
              </div>
            )}
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-secondary)]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            {displayCourse}
            {partner.sharedCourses.length > 1 && (
              <span className="rounded-full bg-[var(--color-teal-light)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--color-primary)]">
                +{partner.sharedCourses.length - 1} more
              </span>
            )}
          </div>
          {partner.location && (
            <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-secondary)]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {partner.location}
            </div>
          )}
          <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-secondary)]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            {partner.rating.toFixed(1)} · {partner.sessionsCompleted} sessions
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-[var(--color-teal-light)] text-[var(--color-primary)]">
            Student
          </span>
          {partner.methods.slice(0, 3).map((m) => (
            <span key={m} className="rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--color-text-secondary)]">
              {m}
            </span>
          ))}
        </div>
      </div>

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
          <button onClick={onRequest}
            className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-[12px] font-bold text-white shadow-[var(--shadow-primary)] transition-all hover:bg-[var(--color-primary-hover)] hover:-translate-y-px">
            Request Session
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Profile modal
───────────────────────────────────────────── */
function ProfileModal({ partner, onClose, onRequest }: {
  partner: Partner;
  onClose: () => void;
  onRequest: () => void;
}) {
  const pctColor = partner.matchPct >= 90 ? "text-green-600" : partner.matchPct >= 75 ? "text-amber-600" : "text-[var(--color-text-muted)]";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
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
              <p className="text-[13px] text-white/70">{partner.major || "—"} · {partner.year || "—"}</p>
              <p className="text-[12px] text-white/60">{partner.sharedCourses[0] ?? partner.allCourses[0] ?? ""}</p>
            </div>
          </div>
        </div>

        <div className="-mt-8 mx-5 grid grid-cols-3 gap-3">
          {[
            { label: "Match",    value: `${partner.matchPct}%`, color: pctColor },
            { label: "Rating",   value: partner.rating.toFixed(1), color: "text-[var(--color-text-base)]" },
            { label: "Sessions", value: `${partner.sessionsCompleted}`, color: "text-[var(--color-text-base)]" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-3 text-center shadow-[var(--shadow-sm)]">
              <div className={`text-[20px] font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] font-medium text-[var(--color-text-muted)]">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {partner.bio && (
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">About</p>
              <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{partner.bio}</p>
            </div>
          )}

          {/* Score breakdown */}
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Match Breakdown</p>
            <ScoreBreakdown bd={partner.matchBreakdown} />
          </div>

          {partner.sharedCourses.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Shared Courses</p>
              <div className="flex flex-wrap gap-1.5">
                {partner.sharedCourses.map((c) => (
                  <span key={c} className="rounded-full bg-[var(--color-teal-light)] px-3 py-1 text-[11px] font-semibold text-[var(--color-primary)]">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: "📍", label: partner.location || "No location set" },
              { icon: "📚", label: partner.methods.join(", ") || "No methods set" },
            ].map((d) => (
              <div key={d.label} className="flex items-center gap-2 rounded-xl bg-[var(--color-surface)] px-3 py-2.5">
                <span className="text-sm">{d.icon}</span>
                <span className="text-[12px] text-[var(--color-text-secondary)] truncate">{d.label}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 rounded-xl border border-[var(--color-border)] py-3 text-[14px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] transition-colors">
              Close
            </button>
            <button onClick={() => { onClose(); onRequest(); }} className="flex-1 rounded-xl bg-[var(--color-primary)] py-3 text-[14px] font-bold text-white shadow-[var(--shadow-primary)] hover:bg-[var(--color-primary-hover)] transition-all">
              Request Session
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
export default function MatchesPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();

  const [partners,       setPartners]       = useState<Partner[]>([]);
  const [fetchLoading,   setFetchLoading]   = useState(true);
  const [courseFilter,   setCourseFilter]   = useState("All");
  const [requestTarget,  setRequestTarget]  = useState<Partner | null>(null);
  const [profileTarget,  setProfileTarget]  = useState<Partner | null>(null);
  const [sentIds,        setSentIds]        = useState<Set<string>>(new Set());

  /* ── Fetch & compute matches ───────────────────────────────────── */
  useEffect(() => {
    if (userLoading || !user) return;

    async function fetchMatches() {
      setFetchLoading(true);
      const supabase = createClient();

      // Fetch current user's courses
      const { data: myCourses } = await supabase
        .from("course_records")
        .select("course_number")
        .eq("user_id", user!.id);

      const myCourseList = (myCourses ?? []).map((r) => r.course_number);

      // Fetch all other users
      const { data: otherUsers } = await supabase
        .from("users")
        .select("id, full_name, overall_rating, preferences")
        .neq("id", user!.id);

      if (!otherUsers || otherUsers.length === 0) {
        setPartners([]);
        setFetchLoading(false);
        return;
      }

      const otherIds = otherUsers.map((u) => u.id);

      // Fetch all their courses + their completed session counts in parallel
      const [{ data: theirCourses }, { data: theirCounts }] = await Promise.all([
        supabase
          .from("course_records")
          .select("user_id, course_number")
          .in("user_id", otherIds),
        supabase
          .from("matches")
          .select("requester_id, partner_id")
          .eq("status", "completed")
          .or(otherIds.map((id) => `requester_id.eq.${id},partner_id.eq.${id}`).join(",")),
      ]);

      // Build course map: userId → course list
      const courseMap: Record<string, string[]> = {};
      for (const row of theirCourses ?? []) {
        if (!courseMap[row.user_id]) courseMap[row.user_id] = [];
        courseMap[row.user_id].push(row.course_number);
      }

      // Build sessions count map: userId → count
      const sessionCountMap: Record<string, number> = {};
      for (const row of theirCounts ?? []) {
        sessionCountMap[row.requester_id] = (sessionCountMap[row.requester_id] ?? 0) + 1;
        sessionCountMap[row.partner_id]   = (sessionCountMap[row.partner_id]   ?? 0) + 1;
      }

      const computed: Partner[] = otherUsers.map((them) => {
        const prefs = (them.preferences as Record<string, unknown>) ?? {};
        const theirCourseList = courseMap[them.id] ?? [];
        const shared = myCourseList.filter((c) => theirCourseList.includes(c));

        const { pct, breakdown } = computeMatch(
          { preferences: user!.preferences, courses: myCourseList },
          { preferences: prefs,             courses: theirCourseList }
        );

        return {
          id:               them.id,
          name:             them.full_name || "Unknown",
          initials:         toInitials(them.full_name || "?"),
          sharedCourses:    shared,
          allCourses:       theirCourseList,
          location:         (prefs.preferred_study_spot as string) ?? "",
          matchPct:         pct,
          matchBreakdown:   breakdown,
          methods:          (prefs.techniques as string[]) ?? [],
          rating:           Number(them.overall_rating ?? 0),
          bio:              (prefs.bio as string) ?? "",
          major:            (prefs.major as string) ?? "",
          year:             (prefs.year as string) ?? "",
          sessionsCompleted: sessionCountMap[them.id] ?? 0,
        };
      });

      // Sort by match % descending
      computed.sort((a, b) => b.matchPct - a.matchPct);
      setPartners(computed);
      setFetchLoading(false);
    }

    fetchMatches();
  }, [user, userLoading]);

  /* ── Derived course filter list ────────────────────────────────── */
  const allSharedCourses = Array.from(
    new Set(partners.flatMap((p) => p.sharedCourses))
  ).sort();
  const courseFilters = ["All", ...allSharedCourses];

  /* ── Filter + sort ─────────────────────────────────────────────── */
  const filtered = partners.filter((p) =>
    courseFilter === "All" || p.sharedCourses.includes(courseFilter)
  );

  /* ── Send request ──────────────────────────────────────────────── */
  async function handleSendRequest(date: string, time: string, duration: number, notes: string) {
    if (!requestTarget || !user) return;

    const supabase = createClient();
    const scheduledAt = new Date(`${date}T${time}`).toISOString();

    await supabase.from("matches").insert({
      requester_id:    user.id,
      partner_id:      requestTarget.id,
      course_number:   requestTarget.sharedCourses[0] ?? requestTarget.allCourses[0] ?? "",
      status:          "pending",
      match_type:      "1-on-1",
      scheduled_at:    scheduledAt,
      duration_minutes: duration,
      study_methods:   requestTarget.methods,
      notes:           notes || null,
      final_study_spot: requestTarget.location || null,
    });

    // Also add to local session store for immediate UI feedback
    addSession({
      id: Date.now().toString(),
      partnerName:    requestTarget.name,
      partnerInitials: requestTarget.initials,
      course:         requestTarget.sharedCourses[0] ?? requestTarget.allCourses[0] ?? "",
      location:       requestTarget.location,
      scheduledAt:    new Date(`${date}T${time}`),
      duration,
      status:         "pending",
      requestedByMe:  true,
      studyMethods:   requestTarget.methods,
      notes:          notes || undefined,
    });

    setSentIds((prev) => new Set([...prev, requestTarget.id]));
    setRequestTarget(null);
    router.push("/sessions");
  }

  const isLoading = userLoading || fetchLoading;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      {requestTarget && (
        <RequestModal
          target={requestTarget}
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
        <div className="mb-8">
          <h1 className="text-[38px] font-extrabold tracking-[-1.5px] leading-tight">
            Your Matches
          </h1>
          <p className="mt-1.5 text-[15px] text-[var(--color-text-secondary)]">
            Sorted by compatibility — request a session with anyone below.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
              <p className="text-[13px] text-[var(--color-text-muted)]">Finding your matches…</p>
            </div>
          </div>
        ) : partners.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-white py-28 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-[var(--color-text-secondary)]">No matches yet</p>
            <p className="mt-1.5 max-w-xs text-[13px] text-[var(--color-text-muted)]">
              You&apos;ll see matches here once other students join and add their courses.
            </p>
          </div>
        ) : (
          <>
            {/* Filter bar */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap gap-1.5">
                {courseFilters.map((c) => (
                  <button key={c} onClick={() => setCourseFilter(c)}
                    className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                      courseFilter === c
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-primary-muted)]"
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <p className="mb-5 text-[13px] text-[var(--color-text-muted)]">
              {filtered.length} match{filtered.length !== 1 ? "es" : ""} found
            </p>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-white py-20 text-center">
                <p className="text-[15px] font-semibold text-[var(--color-text-secondary)]">No matches for these filters</p>
                <button onClick={() => setCourseFilter("All")}
                  className="mt-4 text-[13px] font-semibold text-[var(--color-primary)] hover:underline">
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
          </>
        )}
      </main>
    </div>
  );
}
