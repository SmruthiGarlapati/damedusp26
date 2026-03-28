"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";

export default function MatchingPage() {
  const router = useRouter();
  const [groupSize, setGroupSize] = useState("2-3");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 px-12 py-10">
        {/* Hero */}
        <div className="mb-9">
          <h1 className="text-[42px] font-extrabold tracking-[-1px] leading-tight mb-2.5">
            Matching
          </h1>
          <p className="text-[15px] leading-relaxed text-[var(--color-text-secondary)] max-w-[560px]">
            Based on your schedule, study preferences, and availability, here are your best matches.
            Adjust your group preferences below to refine results.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid gap-5" style={{ gridTemplateColumns: "320px 1fr 240px" }}>
          {/* ── Left column ── */}
          <div className="flex flex-col gap-4">
            {/* Academic Sync */}
            <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
              <div className="flex items-center gap-2.5 border-b border-[var(--color-border-light)] px-5 py-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b6b65" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
                <h2 className="text-sm font-bold">Academic Sync</h2>
              </div>

              <div className="divide-y divide-[var(--color-border-light)]">
                {/* CS 3450 */}
                <div className="px-5 py-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--color-text-base)]">CS 3450</span>
                    <span className="rounded-full bg-[var(--color-tag-green)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-primary)]">
                      Active
                    </span>
                  </div>
                  <p className="mb-2.5 text-[12px] text-[var(--color-text-secondary)]">
                    Software Engineering Architecture
                  </p>
                  <div className="flex items-center gap-1.5 rounded-md bg-[var(--color-surface)] px-2.5 py-1.5">
                    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" stroke="#6b6b65" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="1" width="10" height="12" rx="1.5"/>
                      <line x1="3.5" y1="4.5" x2="8.5" y2="4.5"/>
                      <line x1="3.5" y1="7" x2="8.5" y2="7"/>
                      <line x1="3.5" y1="9.5" x2="6.5" y2="9.5"/>
                    </svg>
                    <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">
                      Assignment 4: Design Patterns
                    </span>
                  </div>
                </div>

                {/* MATH 2210 */}
                <div className="px-5 py-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--color-text-base)]">MATH 2210</span>
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-600">
                      Syncing
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--color-text-secondary)]">
                    Multivariable Calculus
                  </p>
                </div>
              </div>

              <div className="border-t border-[var(--color-border-light)] px-5 py-4">
                <Button variant="primary" fullWidth>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                    <path d="M21 3v5h-5"/>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                    <path d="M8 16H3v5"/>
                  </svg>
                  Refresh Canvas
                </Button>
              </div>
            </div>

            {/* Group Preferences */}
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-sm)]">
              <h2 className="mb-5 text-base font-bold">Group Preferences</h2>
              <div className="mb-5">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Ideal Group Size
                </p>
                <div className="flex gap-2">
                  {["2-3", "4-5", "Solo+"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setGroupSize(s)}
                      className={`flex-1 cursor-pointer rounded-lg border-[1.5px] py-2.5 text-sm font-semibold transition-all ${
                        groupSize === s
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                          : "border-[var(--color-border)] bg-white text-[var(--color-text-base)] hover:border-[var(--color-primary-muted)]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Focus Level
                </p>
                <input
                  type="range"
                  min={0}
                  max={100}
                  defaultValue={75}
                  className="w-full"
                  style={{ accentColor: "var(--color-primary)" }}
                />
                <div className="mt-1.5 flex justify-between text-[11px] text-[var(--color-text-muted)]">
                  <span>Social</span>
                  <span>Ultra-Focus</span>
                </div>
              </div>
            </div>

            {/* Edit shortcuts */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push("/schedule?step=1")}
                className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-[13px] font-semibold text-[var(--color-text-secondary)] shadow-[var(--shadow-sm)] transition-all hover:border-[var(--color-primary-muted)] hover:text-[var(--color-primary)]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit courses &amp; integrations
              </button>
              <button
                onClick={() => router.push("/schedule?step=2")}
                className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-[13px] font-semibold text-[var(--color-text-secondary)] shadow-[var(--shadow-sm)] transition-all hover:border-[var(--color-primary-muted)] hover:text-[var(--color-primary)]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit study preferences
              </button>
              <button
                onClick={() => router.push("/schedule?step=3")}
                className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-[13px] font-semibold text-[var(--color-text-secondary)] shadow-[var(--shadow-sm)] transition-all hover:border-[var(--color-primary-muted)] hover:text-[var(--color-primary)]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit logistics &amp; study spot
              </button>
            </div>
          </div>

          {/* ── Center column — Availability summary + match criteria ── */}
          <div className="flex flex-col gap-5">
            {/* Availability summary */}
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-md)]">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold">Your Availability</h2>
                  <p className="text-[12px] text-[var(--color-text-secondary)]">
                    Set in your profile setup · 9 AM – 9 PM
                  </p>
                </div>
                <button
                  onClick={() => router.push("/schedule?step=4")}
                  className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface)]"
                >
                  Edit
                </button>
              </div>

              {/* Visual availability summary — mini heatmap */}
              <div className="grid gap-2">
                {[
                  { day: "MON", blocks: [false, false, false, false, true, true, true, true, false, false, false, false] },
                  { day: "TUE", blocks: [false, false, false, false, false, false, false, false, true, true, true, true] },
                  { day: "WED", blocks: [false, false, false, false, true, true, true, true, false, false, false, false] },
                  { day: "THU", blocks: [false, false, false, false, false, false, false, false, true, true, true, true] },
                  { day: "FRI", blocks: [false, false, false, false, true, true, true, true, true, true, false, false] },
                  { day: "SAT", blocks: [true, true, true, true, false, false, false, false, false, false, false, false] },
                  { day: "SUN", blocks: [false, false, false, false, false, false, false, false, false, false, false, false] },
                ].map((row) => (
                  <div key={row.day} className="flex items-center gap-2">
                    <span className="w-8 shrink-0 text-[10px] font-bold text-[var(--color-text-muted)]">{row.day}</span>
                    <div className="flex flex-1 gap-0.5">
                      {row.blocks.map((on, i) => (
                        <div
                          key={i}
                          className={`h-5 flex-1 rounded-sm transition-colors ${
                            on ? "bg-[var(--color-primary)]" : "bg-[var(--color-surface)] border border-[var(--color-border-light)]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <div className="mt-1 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
                    <span>9 AM</span>
                    <span>12 PM</span>
                    <span>3 PM</span>
                    <span>6 PM</span>
                    <span>9 PM</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[var(--color-primary)]">18.5 hrs free this week</span>
                </div>
              </div>
            </div>

            {/* Match criteria breakdown */}
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-sm)]">
              <h2 className="mb-4 text-base font-bold">Match Criteria</h2>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Priority course overlap", value: 95, color: "var(--color-primary)" },
                  { label: "Schedule compatibility", value: 82, color: "var(--color-primary)" },
                  { label: "Study style alignment", value: 74, color: "#7c6fcd" },
                  { label: "Skill level match", value: 68, color: "#c47a3a" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">{item.label}</span>
                      <span className="text-[12px] font-bold" style={{ color: item.color }}>{item.value}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface)]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${item.value}%`, background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-4">
            {/* Top partners */}
            <div className="rounded-xl bg-[var(--color-primary)] p-6 text-white">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-bold">Top Partners</h2>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold">
                  8 Matches
                </span>
              </div>
              {[
                { name: "Elena Chen", sub: "CS 3450 • 98% Match" },
                { name: "Marcus Thorne", sub: "MATH 2210 • 94% Match" },
              ].map((p) => (
                <div key={p.name} className="mb-2 rounded-lg bg-white/10 p-3 transition-colors hover:bg-white/15">
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="text-[12px] text-white/65">{p.sub}</div>
                </div>
              ))}
              <button
                onClick={() => router.push("/matches")}
                className="mt-2 w-full cursor-pointer rounded-lg border border-white/25 bg-white/15 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/25"
              >
                Explore All Matches
              </button>
            </div>

            {/* Insight */}
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                Insight
              </p>
              <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                Your peak focus hours overlap with{" "}
                <strong className="text-[var(--color-primary)]">
                  65% of classmates
                </strong>{" "}
                in CS 3450. Consider moving blocks to 10 AM for better group matching.
              </p>
            </div>

            {/* Study spot */}
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                  Preferred Spot
                </p>
                <button
                  onClick={() => router.push("/schedule?step=3")}
                  className="text-[10px] font-semibold text-[var(--color-primary)] hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📚</span>
                <div>
                  <div className="text-[13px] font-bold">PCL (Library)</div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">Whiteboard · Projector</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => router.push("/matches")}
        className="fixed bottom-7 right-7 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-[22px] text-white shadow-[0_4px_16px_rgba(26,74,66,0.4)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-primary-hover)] hover:shadow-[0_6px_20px_rgba(26,74,66,0.5)]"
        title="Quick Match"
      >
        ⚡
      </button>
    </div>
  );
}
