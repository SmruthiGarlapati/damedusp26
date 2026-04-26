"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { hasDemoAdminSession, isDemoAdminUser } from "@/lib/demoAdmin";
import { CuteDino } from "@/components/DinoDecoration";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { createClient } from "@/lib/supabase/client";
import {
  getSessions,
  subscribe,
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
  if (ms <= 0) return <span className="text-[11px] font-bold text-emerald-700">Live now</span>;
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
  pending: "border-amber-300/55 bg-[rgba(247,231,191,0.72)] text-amber-700",
  accepted: "border-[rgba(67,100,133,0.18)] bg-[var(--color-primary-light)] text-[var(--color-primary)]",
  declined: "border-rose-200 bg-[rgba(252,236,236,0.84)] text-rose-500",
  live: "border-emerald-300/55 bg-[rgba(223,244,232,0.92)] text-emerald-700",
  completed: "border-[var(--color-border)] bg-white/72 text-[var(--color-text-muted)]",
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
  currentTime,
  onAccept,
  onDecline,
  onStart,
  onCancel,
}: {
  session: StudySession;
  currentTime: number;
  onAccept: () => void;
  onDecline: () => void;
  onStart: () => void;
  onCancel: () => void;
}) {
  const msUntil = session.scheduledAt.getTime() - currentTime;
  const isReady = msUntil <= 15 * 60 * 1000 || session.status === "live"; // within 15 min or live
  const isPast = msUntil <= 0;
  const awaitingMyAccept = session.status === "pending" && !session.requestedByMe;

  return (
    <div
      className={`overflow-hidden rounded-[28px] border bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,239,229,0.88))] shadow-[0_24px_56px_rgba(52,44,35,0.12)] transition-all hover:-translate-y-1 hover:shadow-[0_28px_64px_rgba(52,44,35,0.16)] ${
        isReady && session.status === "accepted"
          ? "border-emerald-300/45 ring-1 ring-emerald-300/28"
          : "border-[var(--color-border)]"
      }`}
    >
      {/* Top strip for live/ready sessions */}
      {isReady && session.status === "accepted" && (
        <div className="flex items-center gap-2 border-b border-emerald-300/35 bg-[linear-gradient(90deg,rgba(226,247,235,0.96),rgba(246,239,229,0.94))] px-5 py-2.5 text-emerald-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(52,168,83,0.16)]" />
          <span className="text-[12px] font-bold">
            {isPast ? "Session is live — join now!" : "Starting soon — get ready!"}
          </span>
        </div>
      )}

      <div className="p-5">
        <div className="mb-4 flex items-start gap-4">
          {/* Avatar */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-action-bg)] text-sm font-bold text-white shadow-[var(--shadow-primary)]">
            {session.partnerInitials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[17px] font-bold text-[var(--color-text-base)]">{session.partnerName}</h3>
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
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-[var(--color-border)] bg-white/72 px-3 py-2.5">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 shrink-0 text-[var(--color-text-muted)]"
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
                className="flex-1 rounded-xl bg-[var(--color-action-bg)] py-2.5 text-[13px] font-bold text-white shadow-[var(--shadow-primary)] transition-all hover:bg-[var(--color-action-hover)]"
              >
                Accept
              </button>
              <button
                onClick={onDecline}
                className="flex-1 rounded-xl border border-rose-200 bg-[rgba(252,236,236,0.84)] py-2.5 text-[13px] font-semibold text-rose-500 transition-all hover:bg-[rgba(248,220,220,0.94)]"
              >
                Decline
              </button>
            </>
          )}

          {/* Waiting for partner */}
          {session.status === "pending" && session.requestedByMe && (
            <>
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-amber-300/55 bg-[rgba(247,231,191,0.72)] px-3 py-2.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" />
                <span className="text-[12px] font-semibold text-amber-700">
                  Waiting for {session.partnerName.split(" ")[0]} to accept
                </span>
              </div>
              <button
                onClick={onCancel}
                className="rounded-xl border border-[var(--color-border)] bg-white/72 px-3 py-2.5 text-[12px] font-semibold text-[var(--color-text-secondary)] transition-colors hover:border-rose-200 hover:bg-[rgba(252,236,236,0.84)] hover:text-rose-500"
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
                    ? "bg-[linear-gradient(135deg,var(--color-action-bg),var(--color-primary-hover))] text-white shadow-[var(--shadow-primary)] hover:brightness-105"
                    : "cursor-not-allowed border border-[var(--color-border)] bg-white/72 text-[var(--color-text-muted)]"
                }`}
              >
                {session.started ? "Resume Session" : isPast ? "Join Session" : "Start Session"}
              </button>
              <button
                onClick={onCancel}
                className="rounded-xl border border-[var(--color-border)] bg-white/72 px-3 py-2.5 text-[12px] font-semibold text-[var(--color-text-secondary)] transition-colors hover:border-rose-200 hover:bg-[rgba(252,236,236,0.84)] hover:text-rose-500"
              >
                Cancel
              </button>
            </>
          )}

          {/* Declined */}
          {session.status === "declined" && (
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border border-[var(--color-border)] bg-white/72 py-2.5 text-[12px] font-semibold text-[var(--color-text-secondary)] transition-colors hover:border-[rgba(67,100,133,0.34)] hover:bg-white"
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
  const isDemoUser = isDemoAdminUser(user);

  const [sessions, setSessions] = useState<StudySession[]>(() =>
    typeof window === "undefined"
      ? []
      : (getSessions() as unknown as StudySession[])
  );
  const [dbLoading, setDbLoading] = useState(() =>
    typeof window === "undefined" ? false : !hasDemoAdminSession()
  );
  const [tab, setTab] = useState<"upcoming" | "pending" | "past">("upcoming");
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Re-render every second so countdowns stay live and "ready" state triggers
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  /* ── Supabase fetch ── */
  const fetchSessions = useCallback(async (userId: string) => {
    try {
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
    } finally {
      setDbLoading(false);
    }
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

    if (!user || isDemoUser) {
      // Demo mode: use in-memory store
      const unsub = subscribe(() =>
        setSessions(getSessions() as unknown as StudySession[])
      );
      return unsub;
    }

    // Logged in: fetch from Supabase
    void fetchSessions(user.id);

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
  }, [user, userLoading, fetchSessions, isDemoUser]);

  useEffect(() => {
    if (!user || isDemoUser) return;
    const id = setInterval(() => syncLiveStatus(user.id), 30_000);
    return () => clearInterval(id);
  }, [user, syncLiveStatus, isDemoUser]);

  /* ── Actions ── */
  const accept = useCallback(
    async (id: string) => {
      if (!user || isDemoUser) return;
      const supabase = createClient();
      await supabase.from("matches").update({ status: "accepted" }).eq("id", id);
      await fetchSessions(user.id);
    },
    [user, fetchSessions, isDemoUser]
  );

  const decline = useCallback(
    async (id: string) => {
      if (!user || isDemoUser) return;
      const supabase = createClient();
      await supabase.from("matches").update({ status: "declined" }).eq("id", id);
      await fetchSessions(user.id);
    },
    [user, fetchSessions, isDemoUser]
  );

  const cancel = useCallback(
    async (id: string) => {
      if (!user || isDemoUser) return;
      const supabase = createClient();
      await supabase.from("matches").delete().eq("id", id);
      await fetchSessions(user.id);
    },
    [user, fetchSessions, isDemoUser]
  );

  const start = useCallback(
    async (session: StudySession) => {
      if (!user || isDemoUser) return;
      const supabase = createClient();
      await supabase.from("matches").update({ started: true }).eq("id", session.id);
      router.push(
        `/session?partner=${encodeURIComponent(session.partnerName)}&course=${encodeURIComponent(session.course)}&location=${encodeURIComponent(session.location)}&duration=${session.duration}&matchId=${session.id}`
      );
    },
    [user, router, isDemoUser]
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
  const upcoming = sessions.filter(
    (s) =>
      (s.status === "accepted" || s.status === "live") &&
      s.scheduledAt.getTime() >= currentTime - 30 * 60 * 1000
  );
  const pending = sessions.filter((s) => s.status === "pending");
  const past = sessions.filter(
    (s) =>
      s.status === "completed" ||
      s.status === "declined" ||
      (s.status === "accepted" && s.scheduledAt.getTime() < currentTime - 30 * 60 * 1000)
  );

  const tabData = tab === "upcoming" ? upcoming : tab === "pending" ? pending : past;
  const pendingCount = pending.length;
  const readyCount = upcoming.filter(
    (s) => s.scheduledAt.getTime() - currentTime <= 15 * 60 * 1000
  ).length;

  const isLoading = userLoading || dbLoading;

  return (
    <div className="rapt-app-shell flex min-h-screen flex-col bg-[var(--color-bg)]">
      <Navbar />

      <main className="rapt-app-main flex-1 px-8 py-8 md:px-12 md:py-10">
        {/* Header */}
        <div className="rapt-hero-card mb-8 flex flex-col gap-5 px-7 py-7 md:flex-row md:items-end md:justify-between md:px-8">
          <div>
            <span className="rapt-eyebrow">
              <span className="h-2 w-2 rounded-full bg-[var(--color-leaf)]" />
              Session control center
            </span>
            <h1 className="rapt-display mt-5 text-[38px] leading-[0.95] text-[var(--color-text-base)] md:text-[44px]">
              My Sessions
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
              Manage requests, keep an eye on what&apos;s starting soon, and jump into active sessions without losing the homepage mood.
            </p>
          </div>
          <button
            onClick={() => router.push("/matches")}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-action-bg)] px-5 py-3 text-[14px] font-bold text-white shadow-[var(--shadow-primary)] transition-all hover:bg-[var(--color-action-hover)] hover:-translate-y-px active:translate-y-0"
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
              <div className="mb-6 flex items-center gap-3 rounded-[22px] border border-emerald-300/45 bg-[linear-gradient(180deg,rgba(226,247,235,0.94),rgba(244,252,247,0.9))] px-5 py-4 backdrop-blur-sm">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(52,168,83,0.14)]" />
                <p className="text-[14px] font-semibold text-emerald-700">
                  {readyCount === 1 ? "1 session is" : `${readyCount} sessions are`} starting
                  soon — you can join now.
                </p>
              </div>
            )}
            {pendingCount > 0 && (
              <div className="mb-6 flex items-center gap-3 rounded-[22px] border border-amber-300/55 bg-[linear-gradient(180deg,rgba(247,231,191,0.72),rgba(255,248,232,0.92))] px-5 py-4 backdrop-blur-sm">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-amber-500"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-[14px] font-semibold text-amber-700">
                  {pendingCount} session request{pendingCount > 1 ? "s" : ""} need
                  {pendingCount === 1 ? "s" : ""} your attention.
                </p>
              </div>
            )}

            {/* Tabs */}
            <div className="mb-6 flex w-fit gap-1 rounded-xl border border-[var(--color-border)] bg-white/80 p-1 shadow-[var(--shadow-sm)] backdrop-blur-sm">
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
                        ? "bg-[var(--color-action-bg)] text-white shadow-[var(--shadow-primary)]"
                        : "text-[var(--color-text-secondary)] hover:bg-white"
                    }`}
                  >
                    {t}
                    {count > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          tab === t
                            ? "bg-white/20 text-white"
                            : "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
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
              <div className="rapt-glass-card flex flex-col items-center justify-center border-dashed py-16 text-center">
                <CuteDino className="mb-2 w-20 h-20 opacity-65" color="#5c84ad" flip={tab === "past"} />
                <p className="text-[15px] font-semibold text-[var(--color-text-secondary)]">
                  No {tab} sessions
                </p>
                <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                  {tab === "upcoming"
                    ? "Find a study partner and schedule your first dig."
                    : "Nothing here yet."}
                </p>
                {tab === "upcoming" && (
                  <button
                    onClick={() => router.push("/matches")}
                    className="mt-5 rounded-xl bg-[var(--color-action-bg)] px-5 py-2.5 text-[13px] font-bold text-white shadow-[var(--shadow-primary)] hover:bg-[var(--color-action-hover)]"
                  >
                    Browse Partners 🦕
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {tabData.map((s) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    currentTime={currentTime}
                    onAccept={() => (user && !isDemoUser ? accept(s.id) : acceptDemo(s.id))}
                    onDecline={() => (user && !isDemoUser ? decline(s.id) : declineDemo(s.id))}
                    onStart={() => (user && !isDemoUser ? start(s) : startDemo(s))}
                    onCancel={() => (user && !isDemoUser ? cancel(s.id) : cancelDemo(s.id))}
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
