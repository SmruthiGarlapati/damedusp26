"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { createClient } from "@/lib/supabase/client";
import {
  getSessions,
  subscribe,
  StudySession as DemoStudySession,
} from "@/lib/sessionsStore";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type SessionStatus = "pending" | "accepted" | "declined" | "live" | "completed";

interface StudySession {
  id: string;
  partnerName: string;
  partnerInitials: string;
  course: string;
  location: string;
  scheduledAt: Date;
  duration: number;
  status: SessionStatus;
  requestedByMe: boolean;
  studyMethods: string[];
  notes?: string;
  started?: boolean;
}

/* ─────────────────────────────────────────────
   Effective status with live-window detection
───────────────────────────────────────────── */
function effectiveStatus(row: {
  status: string;
  scheduled_at: string | null;
  duration_minutes: number;
}): SessionStatus {
  if (row.status !== "accepted") return row.status as SessionStatus;
  if (!row.scheduled_at) return "accepted";
  const now = Date.now();
  const start = new Date(row.scheduled_at).getTime();
  const end = start + row.duration_minutes * 60 * 1000;
  if (now >= start && now < end) return "live";
  if (now >= end) return "completed";
  return "accepted";
}

/* ─────────────────────────────────────────────
   Helpers (CST timezone)
───────────────────────────────────────────── */
const CST = "America/Chicago";

function formatTime(d: Date) {
  return d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    timeZone: CST,
  });
}

function formatDate(d: Date) {
  const opts: Intl.DateTimeFormatOptions = { timeZone: CST };
  const todayStr = new Date().toLocaleDateString("en-US", opts);
  const tomorrowStr = new Date(Date.now() + 86400000).toLocaleDateString("en-US", opts);
  const dStr = d.toLocaleDateString("en-US", opts);
  if (dStr === todayStr) return "Today";
  if (dStr === tomorrowStr) return "Tomorrow";
  return d.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: CST,
  });
}

function useCountdown(target: Date) {
  const [remaining, setRemaining] = useState(() => target.getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setRemaining(target.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  return remaining;
}

function CountdownBadge({ scheduledAt }: { scheduledAt: Date }) {
  const ms = useCountdown(scheduledAt);
  if (ms <= 0) return <span className="text-[11px] font-bold text-green-600">Live now</span>;
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  const str =
    h > 0
      ? `${h}h ${m}m`
      : m > 0
      ? `${m}m ${String(s).padStart(2, "0")}s`
      : `${s}s`;
  return (
    <span className="text-[11px] font-bold tabular-nums text-[var(--color-text-muted)]">
      Starts in {str}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Status styles
───────────────────────────────────────────── */
const STATUS_STYLE: Record<SessionStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-[var(--color-tag-green)] text-[var(--color-primary)] border-green-200",
  declined: "bg-red-50 text-red-600 border-red-200",
  live: "bg-green-100 text-green-700 border-green-300",
  completed:
    "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)]",
};
const STATUS_LABEL: Record<SessionStatus, string> = {
  pending: "Pending",
  accepted: "Scheduled",
  declined: "Declined",
  live: "Live",
  completed: "Completed",
};

/* ─────────────────────────────────────────────
   Session card
───────────────────────────────────────────── */
function SessionCard({
  session,
  onAccept,
  onDecline,
  onStart,
  onCancel,
}: {
  session: StudySession;
  onAccept: () => void;
  onDecline: () => void;
  onStart: () => void;
  onCancel: () => void;
}) {
  const msUntil = session.scheduledAt.getTime() - Date.now();
  const isReady = msUntil <= 15 * 60 * 1000 || session.status === "live"; // within 15 min or live
  const isPast = msUntil <= 0;
  const awaitingMyAccept = session.status === "pending" && !session.requestedByMe;

  return (
    <div
      className={`rounded-2xl border bg-white shadow-[var(--shadow-sm)] overflow-hidden transition-all hover:shadow-[var(--shadow-md)] ${
        isReady && session.status === "accepted"
          ? "border-green-300 ring-1 ring-green-200"
          : "border-[var(--color-border)]"
      }`}
    >
      {/* Top strip for live/ready sessions */}
      {isReady && session.status === "accepted" && (
        <div className="flex items-center gap-2 bg-green-600 px-5 py-2 text-white">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          <span className="text-[12px] font-bold">
            {isPast ? "Session is live — join now!" : "Starting soon — get ready!"}
          </span>
        </div>
      )}

      <div className="p-5">
        <div className="mb-4 flex items-start gap-4">
          {/* Avatar */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-white">
            {session.partnerInitials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold truncate">{session.partnerName}</h3>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLE[session.status]}`}
              >
                {STATUS_LABEL[session.status]}
              </span>
            </div>
            <p className="text-[12px] text-[var(--color-text-secondary)]">{session.course}</p>
          </div>
        </div>

        {/* Details grid */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <Detail
            icon={<ClockIcon />}
            label={
              <>
                {formatDate(session.scheduledAt)} · {formatTime(session.scheduledAt)}
                <span className="ml-1 text-[9px] text-[var(--color-text-muted)] opacity-70">CST</span>
              </>
            }
          />
          <Detail icon={<TimerIcon />} label={`${session.duration} min session`} />
          <Detail icon={<LocationIcon />} label={session.location} />
          <Detail icon={<MethodIcon />} label={session.studyMethods.join(", ")} />
        </div>

        {session.notes && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-[var(--color-surface)] px-3 py-2.5">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6b6b65"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 shrink-0"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-[12px] text-[var(--color-text-secondary)]">{session.notes}</p>
          </div>
        )}

        {/* Countdown */}
        {session.status === "accepted" && (
          <div className="mb-4">
            <CountdownBadge scheduledAt={session.scheduledAt} />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {/* Awaiting my accept */}
          {awaitingMyAccept && (
            <>
              <button
                onClick={onAccept}
                className="flex-1 rounded-xl bg-[var(--color-primary)] py-2.5 text-[13px] font-bold text-white shadow-[var(--shadow-primary)] transition-all hover:bg-[var(--color-primary-hover)]"
              >
                Accept
              </button>
              <button
                onClick={onDecline}
                className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2.5 text-[13px] font-semibold text-red-600 transition-all hover:bg-red-100"
              >
                Decline
              </button>
            </>
          )}

          {/* Waiting for partner */}
          {session.status === "pending" && session.requestedByMe && (
            <>
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                <span className="text-[12px] font-semibold text-amber-700">
                  Waiting for {session.partnerName.split(" ")[0]} to accept
                </span>
              </div>
              <button
                onClick={onCancel}
                className="rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-[12px] font-semibold text-[var(--color-text-muted)] hover:border-red-300 hover:text-red-500 transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          {/* Accepted — show Start when ready */}
          {session.status === "accepted" && (
            <>
              <button
                onClick={onStart}
                disabled={!isReady}
                className={`flex-1 rounded-xl py-2.5 text-[13px] font-bold transition-all ${
                  isReady
                    ? "bg-green-600 text-white shadow-[0_4px_12px_rgba(22,163,74,0.3)] hover:bg-green-700"
                    : "cursor-not-allowed bg-[var(--color-surface)] text-[var(--color-text-muted)]"
                }`}
              >
                {session.started ? "Resume Session" : isPast ? "Join Session" : "Start Session"}
              </button>
              <button
                onClick={onCancel}
                className="rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-[12px] font-semibold text-[var(--color-text-muted)] hover:border-red-300 hover:text-red-500 transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          {/* Declined */}
          {session.status === "declined" && (
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border border-[var(--color-border)] py-2.5 text-[12px] font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ icon, label }: { icon: React.ReactNode; label: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-secondary)]">
      <span className="shrink-0 text-[var(--color-text-muted)]">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
export default function SessionsPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();

  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [tab, setTab] = useState<"upcoming" | "pending" | "past">("upcoming");

  // Re-render every second so countdowns stay live and "ready" state triggers
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  /* ── Supabase fetch ── */
  const fetchSessions = useCallback(async (userId: string) => {
    const supabase = createClient();
    const { data: rows, error } = await supabase
      .from("matches")
      .select(
        "id, status, match_type, course_number, final_study_spot, scheduled_at, duration_minutes, study_methods, notes, started, requester_id, partner_id"
      )
      .or(`requester_id.eq.${userId},partner_id.eq.${userId}`)
      .order("scheduled_at", { ascending: true });

    if (error || !rows) return;

    // Collect unique partner IDs
    const partnerIds = [
      ...new Set(
        rows.map((r) => (r.requester_id === userId ? r.partner_id : r.requester_id))
      ),
    ].filter(Boolean) as string[];

    // Fetch partner names
    const nameMap: Record<string, string> = {};
    if (partnerIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("id, full_name")
        .in("id", partnerIds);
      if (users) {
        for (const u of users) nameMap[u.id] = u.full_name ?? "";
      }
    }

    const converted: StudySession[] = rows.map((row) => {
      const partnerId = row.requester_id === userId ? row.partner_id : row.requester_id;
      const fullName: string = nameMap[partnerId] ?? "Unknown";
      const initials = fullName
        .split(" ")
        .slice(0, 2)
        .map((p: string) => p[0] ?? "")
        .join("")
        .toUpperCase();

      const farFuture = new Date(8640000000000000);
      const scheduledAt = row.scheduled_at ? new Date(row.scheduled_at) : farFuture;

      return {
        id: row.id,
        partnerName: fullName,
        partnerInitials: initials,
        course: row.course_number ?? "",
        location: row.final_study_spot ?? "",
        scheduledAt,
        duration: row.duration_minutes ?? 60,
        status: effectiveStatus(row),
        requestedByMe: row.requester_id === userId,
        studyMethods: (row.study_methods as string[]) ?? [],
        notes: row.notes ?? undefined,
        started: row.started ?? false,
      };
    });

    setSessions(converted);
  }, []);

  /* ── Auto live-status DB sync (every 30s) ── */
  const syncLiveStatus = useCallback(
    async (userId: string) => {
      const supabase = createClient();
      const now = Date.now();

      for (const s of sessions) {
        const start = s.scheduledAt.getTime();
        const end = start + s.duration * 60 * 1000;

        if (s.status === "accepted" && now >= start && now < end) {
          await supabase
            .from("matches")
            .update({ status: "live" })
            .eq("id", s.id)
            .eq("status", "accepted");
        } else if (s.status === "live" && now >= end) {
          await supabase
            .from("matches")
            .update({ status: "completed" })
            .eq("id", s.id)
            .eq("status", "live");
        }
      }

      // Re-fetch after any sync
      await fetchSessions(userId);
    },
    [sessions, fetchSessions]
  );

  /* ── Effects: data loading ── */
  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      // Demo mode: use in-memory store
      setSessions(getSessions() as unknown as StudySession[]);
      const unsub = subscribe(() =>
        setSessions(getSessions() as unknown as StudySession[])
      );
      return unsub;
    }

    // Logged in: fetch from Supabase
    setDbLoading(true);
    fetchSessions(user.id).finally(() => setDbLoading(false));

    const supabase = createClient();
    const channel = supabase
      .channel("matches-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => fetchSessions(user.id)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userLoading, fetchSessions]);

  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => syncLiveStatus(user.id), 30_000);
    return () => clearInterval(id);
  }, [user, syncLiveStatus]);

  /* ── Actions ── */
  const accept = useCallback(
    async (id: string) => {
      if (!user) return;
      const supabase = createClient();
      await supabase.from("matches").update({ status: "accepted" }).eq("id", id);
      await fetchSessions(user.id);
    },
    [user, fetchSessions]
  );

  const decline = useCallback(
    async (id: string) => {
      if (!user) return;
      const supabase = createClient();
      await supabase.from("matches").update({ status: "declined" }).eq("id", id);
      await fetchSessions(user.id);
    },
    [user, fetchSessions]
  );

  const cancel = useCallback(
    async (id: string) => {
      if (!user) return;
      const supabase = createClient();
      await supabase.from("matches").delete().eq("id", id);
      await fetchSessions(user.id);
    },
    [user, fetchSessions]
  );

  const start = useCallback(
    async (session: StudySession) => {
      if (!user) return;
      const supabase = createClient();
      await supabase.from("matches").update({ started: true }).eq("id", session.id);
      router.push(
        `/session?partner=${encodeURIComponent(session.partnerName)}&course=${encodeURIComponent(session.course)}&location=${encodeURIComponent(session.location)}&duration=${session.duration}&matchId=${session.id}`
      );
    },
    [user, router]
  );

  /* ── Demo mode actions (no user) ── */
  const { updateSession: demoUpdate, removeSession: demoRemove } = (() => {
    if (typeof window === "undefined") return { updateSession: undefined, removeSession: undefined };
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const store = require("@/lib/sessionsStore");
      return { updateSession: store.updateSession, removeSession: store.removeSession };
    } catch {
      return { updateSession: undefined, removeSession: undefined };
    }
  })();

  const acceptDemo = useCallback(
    (id: string) => demoUpdate?.(id, { status: "accepted" }),
    [demoUpdate]
  );
  const declineDemo = useCallback(
    (id: string) => demoUpdate?.(id, { status: "declined" }),
    [demoUpdate]
  );
  const cancelDemo = useCallback(
    (id: string) => demoRemove?.(id),
    [demoRemove]
  );
  const startDemo = useCallback(
    (session: StudySession) => {
      demoUpdate?.(session.id, { started: true });
      router.push(
        `/session?partner=${encodeURIComponent(session.partnerName)}&course=${encodeURIComponent(session.course)}&location=${encodeURIComponent(session.location)}&duration=${session.duration}`
      );
    },
    [demoUpdate, router]
  );

  /* ── Derived lists ── */
  const now = Date.now();
  const upcoming = sessions.filter(
    (s) =>
      (s.status === "accepted" || s.status === "live") &&
      s.scheduledAt.getTime() >= now - 30 * 60 * 1000
  );
  const pending = sessions.filter((s) => s.status === "pending");
  const past = sessions.filter(
    (s) =>
      s.status === "completed" ||
      s.status === "declined" ||
      (s.status === "accepted" && s.scheduledAt.getTime() < now - 30 * 60 * 1000)
  );

  const tabData = tab === "upcoming" ? upcoming : tab === "pending" ? pending : past;
  const pendingCount = pending.length;
  const readyCount = upcoming.filter(
    (s) => s.scheduledAt.getTime() - now <= 15 * 60 * 1000
  ).length;

  const isLoading = userLoading || dbLoading;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <Navbar />

      <main className="flex-1 px-12 py-10">
        {/* Back button */}
        <button
          onClick={() => router.push("/matches")}
          className="mb-6 flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="13" y1="8" x2="3" y2="8" />
            <polyline points="7,4 3,8 7,12" />
          </svg>
          Back to Browse
        </button>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-[38px] font-extrabold tracking-[-1.5px] leading-tight">
              My Sessions
            </h1>
            <p className="mt-1.5 text-[15px] text-[var(--color-text-secondary)]">
              Manage your study requests, upcoming sessions, and join when it&apos;s time.
            </p>
          </div>
          <button
            onClick={() => router.push("/matches")}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-[14px] font-bold text-white shadow-[var(--shadow-primary)] transition-all hover:bg-[var(--color-primary-hover)]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Find a Partner
          </button>
        </div>

        {/* Loading spinner */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
            <p className="text-[14px] text-[var(--color-text-muted)]">Loading sessions…</p>
          </div>
        ) : (
          <>
            {/* Alert banners */}
            {readyCount > 0 && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-300 bg-green-50 px-5 py-4">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
                <p className="text-[14px] font-semibold text-green-800">
                  {readyCount === 1 ? "1 session is" : `${readyCount} sessions are`} starting
                  soon — you can join now.
                </p>
              </div>
            )}
            {pendingCount > 0 && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#92400e"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-[14px] font-semibold text-amber-800">
                  {pendingCount} session request{pendingCount > 1 ? "s" : ""} need
                  {pendingCount === 1 ? "s" : ""} your attention.
                </p>
              </div>
            )}

            {/* Tabs */}
            <div className="mb-6 flex gap-1 rounded-xl border border-[var(--color-border)] bg-white p-1 shadow-[var(--shadow-sm)] w-fit">
              {(["upcoming", "pending", "past"] as const).map((t) => {
                const count =
                  t === "upcoming"
                    ? upcoming.length
                    : t === "pending"
                    ? pending.length
                    : past.length;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex items-center gap-2 rounded-lg px-5 py-2 text-[13px] font-semibold capitalize transition-all ${
                      tab === t
                        ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-primary)]"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
                    }`}
                  >
                    {t}
                    {count > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          tab === t
                            ? "bg-white/20 text-white"
                            : "bg-[var(--color-surface)] text-[var(--color-text-muted)]"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Cards */}
            {tabData.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-white py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <p className="text-[15px] font-semibold text-[var(--color-text-secondary)]">
                  No {tab} sessions
                </p>
                <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                  {tab === "upcoming"
                    ? "Request a match to schedule your first session."
                    : "Nothing here yet."}
                </p>
                {tab === "upcoming" && (
                  <button
                    onClick={() => router.push("/matches")}
                    className="mt-5 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-[13px] font-bold text-white shadow-[var(--shadow-primary)] hover:bg-[var(--color-primary-hover)]"
                  >
                    Browse Partners
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">
                {tabData.map((s) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    onAccept={() => (user ? accept(s.id) : acceptDemo(s.id))}
                    onDecline={() => (user ? decline(s.id) : declineDemo(s.id))}
                    onStart={() => (user ? start(s) : startDemo(s))}
                    onCancel={() => (user ? cancel(s.id) : cancelDemo(s.id))}
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

/* ── Icons ── */
function ClockIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function TimerIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M9 3h6" />
      <path d="M12 3v2" />
    </svg>
  );
}
function LocationIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function MethodIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
