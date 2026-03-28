"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";

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

export default function MatchesPage() {
  const router = useRouter();
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["prefer-to-teach"]);
  const [activeFilters] = useState({
    courses: ["CS 312: Algorithms", "PHYS 201: Mechanics", "MATH 445: Stats"],
    counts: [12, 8, 4],
  });

  function toggleStyle(s: string) {
    setSelectedStyles((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
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
                onAction={() => router.push("/session")}
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
  onAction,
}: {
  partner: (typeof PARTNERS)[0];
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
        <Button size="sm" onClick={onAction}>
          {BUTTON_LABELS[partner.style]}
        </Button>
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
