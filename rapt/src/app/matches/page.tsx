"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import { addSession } from "@/lib/sessionsStore";

const PARTNERS = [
  {
    id: "1",
    name: "Rhea Patel",
    quote: '"Let\'s tackle the CS 312 Pset together."',
    course: "CS 312: Algorithms",
    location: "Centennial Library, Room 4",
    style: "prefer-to-teach" as const,
  },
  {
    id: "2",
    name: "Jason Yao",
    quote: '"Looking for some guidance on physics labs."',
    course: "PHYS 201: Mechanics",
    location: "Tue/Thu afternoons",
    style: "need-guidance" as const,
  },
  {
    id: "3",
    name: "Jasmine Ball, Ayan Jannu, Neel Asija",
    quote: '"Quiet co-working only. No talking please."',
    course: "MATH 445: Statistics",
    location: "Botanical Cafe, Downtown",
    style: "silent-co-study" as const,
  },
];

const STYLE_LABELS: Record<string, string> = {
  "prefer-to-teach": "PREFER TO TEACH",
  "need-guidance": "NEED GUIDANCE",
  "silent-co-study": "SILENT CO-STUDY",
};

const STYLE_CLASSES: Record<string, string> = {
  "prefer-to-teach":
    "bg-[var(--color-tag-peach)] text-[#8b4a1a]",
  "need-guidance":
    "bg-indigo-100 text-indigo-700",
  "silent-co-study":
    "bg-[var(--color-text-base)] text-white",
};

const BUTTON_LABELS: Record<string, string> = {
  "prefer-to-teach": "Request Match",
  "need-guidance": "Select Buddy",
  "silent-co-study": "Join Group",
};

interface RequestTarget {
  partnerName: string;
  partnerInitials: string;
  course: string;
  location: string;
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
          <h2 className="text-lg font-extrabold">Request a Study Session</h2>
          <p className="mt-0.5 text-[13px] text-white/70">
            with {target.partnerName} · {target.course}
          </p>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Date + time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Date
              </label>
              <input
                type="date"
                value={date}
                min={todayStr}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-base)] outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-base)] outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Duration
            </label>
            <div className="flex gap-2">
              {[30, 60, 90, 120].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 rounded-xl border-[1.5px] py-2 text-[13px] font-semibold transition-all ${
                    duration === d
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                      : "border-[var(--color-border)] text-[var(--color-text-base)] hover:border-[var(--color-primary-muted)]"
                  }`}
                >
                  {d < 60 ? `${d}m` : `${d / 60}h`}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              What do you want to work on? (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Assignment 4, exam prep, chapter 7..."
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text-base)] outline-none resize-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Location (read-only from partner) */}
          <div className="flex items-center gap-2 rounded-xl bg-[var(--color-surface)] px-3 py-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b6b65" strokeWidth="2" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="text-[12px] text-[var(--color-text-secondary)]">{target.location}</span>
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
              Send Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MatchesPage() {
  const router = useRouter();
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["prefer-to-teach"]);
  const [activeFilters] = useState({
    courses: ["CS 312: Algorithms", "PHYS 201: Mechanics", "MATH 445: Stats"],
    counts: [12, 8, 4],
  });
  const [requestTarget, setRequestTarget] = useState<RequestTarget | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  function toggleStyle(s: string) {
    setSelectedStyles((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function handleSendRequest(date: string, time: string, duration: number, notes: string) {
    if (!requestTarget) return;
    const scheduledAt = new Date(`${date}T${time}`);
    addSession({
      id: Date.now().toString(),
      partnerName: requestTarget.partnerName,
      partnerInitials: requestTarget.partnerInitials,
      course: requestTarget.course,
      location: requestTarget.location,
      scheduledAt,
      duration,
      status: "pending",
      requestedByMe: true,
      studyMethods: ["Discussion"],
      notes: notes || undefined,
    });
    setSentIds((prev) => new Set([...prev, requestTarget.partnerName]));
    setRequestTarget(null);
    router.push("/sessions");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {requestTarget && (
        <RequestModal
          target={requestTarget}
          onClose={() => setRequestTarget(null)}
          onSend={handleSendRequest}
        />
      )}
      <Navbar showSearch />

      <div className="flex flex-1">
        {/* ── Sidebar ── */}
        <aside className="w-[268px] shrink-0 border-r border-[var(--color-border)] px-8 py-10">
          <h1 className="mb-2 text-[36px] font-extrabold tracking-[-1px]">Matches</h1>
          <p className="mb-8 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Find your ideal study rhythm.
          </p>

          {/* Courses */}
          <div className="mb-7">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              Courses
            </p>
            {activeFilters.courses.map((course, i) => (
              <div
                key={course}
                className="flex cursor-pointer items-center justify-between py-2 text-[13px] font-medium transition-colors hover:text-[var(--color-primary)]"
              >
                <span>{course}</span>
                <span className="rounded-full bg-[var(--color-surface)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-text-secondary)]">
                  {activeFilters.counts[i]}
                </span>
              </div>
            ))}
          </div>

          {/* Study Style */}
          <div className="mb-7">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              Study Style
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["prefer-to-teach", "need-guidance", "silent-co-study"].map((s) => (
                <button
                  key={s}
                  onClick={() => toggleStyle(s)}
                  className={`cursor-pointer rounded-full border-[1.5px] px-3 py-1 text-[12px] font-medium transition-all ${
                    selectedStyles.includes(s)
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                      : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-primary-muted)]"
                  }`}
                >
                  {STYLE_LABELS[s]
                    .split(" ")
                    .map((w) => w[0] + w.slice(1).toLowerCase())
                    .join(" ")}
                </button>
              ))}
            </div>
          </div>

          {/* Availability slider */}
          <div className="mb-7">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              Availability
            </p>
            <input
              type="range"
              min={0}
              max={100}
              defaultValue={55}
              className="w-full"
              style={{ accentColor: "var(--color-primary)" }}
            />
            <div className="mt-1.5 flex justify-between text-[11px] text-[var(--color-text-muted)]">
              <span>Morning</span>
              <span>Evening</span>
            </div>
          </div>

          <Button variant="primary" fullWidth>
            <FilterIcon /> Update Feed
          </Button>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 overflow-y-auto px-8 py-10">
          {/* Toolbar */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-0">
              <span className="text-sm text-[var(--color-text-secondary)]">
                Showing 42 available peers
              </span>
              <button className="ml-3 cursor-pointer text-[13px] font-semibold text-[var(--color-primary)] hover:underline">
                Clear all
              </button>
            </div>
            <div className="flex gap-1">
              <button className="flex h-9 w-9 items-center justify-center rounded border border-[var(--color-primary)] text-[var(--color-primary)]">
                <GridIcon />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
                <ListIcon />
              </button>
            </div>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-2 gap-4">
            {PARTNERS.map((p) => (
              <MatchCard
                key={p.id}
                partner={p}
                sent={sentIds.has(p.name)}
                onAction={() =>
                  setRequestTarget({
                    partnerName: p.name,
                    partnerInitials: p.name.split(" ").map((w) => w[0]).slice(0, 2).join(""),
                    course: p.course,
                    location: p.location,
                  })
                }
              />
            ))}

            {/* CTA card */}
            <div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl bg-[var(--color-primary)] p-8 text-center text-white">
              <svg
                className="mb-4 h-12 w-12 opacity-60"
                viewBox="0 0 48 48"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M24 10C16 10 10 16 10 24C10 32 16 38 24 38C32 38 38 32 38 24C38 16 32 10 24 10Z" />
                <path d="M24 20V28M20 24H28" />
              </svg>
              <h3 className="mb-2.5 text-[18px] font-bold">
                Can&apos;t find the perfect peer?
              </h3>
              <p className="mb-5 text-[13px] leading-relaxed text-white/65">
                Update your preferences to find more compatible study rhythms.
              </p>
              <Button variant="secondary" size="sm" onClick={() => router.push("/matching")}>
                Refine Profile
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function MatchCard({
  partner,
  sent,
  onAction,
}: {
  partner: (typeof PARTNERS)[0];
  sent: boolean;
  onAction: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
      <div className="p-6 pb-4">
        <h3 className="mb-1 text-xl font-bold">{partner.name}</h3>
        <p className="mb-4 text-[13px] italic text-[var(--color-text-secondary)]">
          {partner.quote}
        </p>
        <div className="mb-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
            <CourseIcon /> {partner.course}
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
            <LocationIcon /> {partner.location}
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${STYLE_CLASSES[partner.style]}`}
        >
          {STYLE_LABELS[partner.style]}
        </span>
      </div>
      <div className="flex items-center justify-between border-t border-[var(--color-border-light)] px-6 py-4">
        <button className="cursor-pointer text-[13px] font-semibold text-[var(--color-primary)] hover:underline">
          View Profile
        </button>
        {sent ? (
          <span className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-[12px] font-semibold text-amber-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            Request sent
          </span>
        ) : (
          <Button size="sm" onClick={onAction}>
            {BUTTON_LABELS[partner.style]}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ── Icons ── */
function FilterIcon() {
  return (
    <svg width="10" height="7" viewBox="0 0 11 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 1.5h9M3 4.5h5M5 7.5h1" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor">
      <rect x="0" y="0" width="7" height="7" rx="1" /><rect x="10" y="0" width="7" height="7" rx="1" /><rect x="0" y="10" width="7" height="7" rx="1" /><rect x="10" y="10" width="7" height="7" rx="1" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="0" y1="3" x2="18" y2="3" /><line x1="0" y1="9" x2="18" y2="9" /><line x1="0" y1="15" x2="18" y2="15" />
    </svg>
  );
}
function CourseIcon() {
  return (
    <svg width="12" height="15" viewBox="0 0 12 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M2 1h8a1 1 0 0 1 1 1v11l-1.5-1L8 13l-1.5-1L5 13l-1.5-1L2 13V2a1 1 0 0 1 1-1z" />
    </svg>
  );
}
function LocationIcon() {
  return (
    <svg width="12" height="15" viewBox="0 0 12 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M6 1C3.8 1 2 2.8 2 5c0 3.5 4 8 4 8s4-4.5 4-8c0-2.2-1.8-4-4-4z" />
      <circle cx="6" cy="5" r="1.5" />
    </svg>
  );
}
