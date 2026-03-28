"use client";

import { useCallback, useRef, useState } from "react";

export type CellState = "empty" | "selected";

export const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// 9 AM → 9 PM = 12 hours × 4 slots = 48 rows
export const TOTAL_ROWS = 48;

export const TIME_LABELS: string[] = Array.from({ length: TOTAL_ROWS }, (_, i) => {
  const hour24 = 9 + Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  const hour12 = hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 < 12 ? "AM" : "PM";
  return `${hour12}:${String(minutes).padStart(2, "0")} ${ampm}`;
});

export function makeEmptyGrid(): CellState[][] {
  return Array.from({ length: TOTAL_ROWS }, () =>
    Array(DAYS.length).fill("empty") as CellState[]
  );
}

export const DEFAULT_INITIAL_GRID: CellState[][] = (() => {
  const g = makeEmptyGrid();
  // Mon/Wed/Fri 10–11 AM (rows 4–7)
  [0, 2, 4].forEach((col) => {
    for (let r = 4; r < 8; r++) g[r][col] = "selected";
  });
  // Tue/Thu 2–3 PM (rows 20–23)
  [1, 3].forEach((col) => {
    for (let r = 20; r < 24; r++) g[r][col] = "selected";
  });
  return g;
})();

const nextState: Record<CellState, CellState> = {
  empty: "selected",
  selected: "empty",
};

interface AvailabilityGridProps {
  grid: CellState[][];
  onChange: (grid: CellState[][]) => void;
  maxHeight?: number;
}

export default function AvailabilityGrid({
  grid,
  onChange,
  maxHeight = 480,
}: AvailabilityGridProps) {
  const isDragging = useRef(false);
  const paintState = useRef<CellState>("selected");

  const startPaint = useCallback(
    (row: number, col: number) => {
      isDragging.current = true;
      const ns = nextState[grid[row][col]];
      paintState.current = ns;
      const next = grid.map((r) => [...r]);
      next[row][col] = ns;
      onChange(next);
    },
    [grid, onChange]
  );

  const continuePaint = useCallback(
    (row: number, col: number) => {
      if (!isDragging.current) return;
      if (grid[row][col] === paintState.current) return;
      const next = grid.map((r) => [...r]);
      next[row][col] = paintState.current;
      onChange(next);
    },
    [grid, onChange]
  );

  const stopPaint = useCallback(() => {
    isDragging.current = false;
  }, []);

  const selectedCount = grid.flat().filter((c) => c === "selected").length;
  const freeHours = (selectedCount * 15) / 60;

  return (
    <div>
      {/* Scrollable grid */}
      <div
        className="mb-4 overflow-y-auto rounded-xl border border-[var(--color-border)]"
        style={{ maxHeight }}
        onMouseLeave={stopPaint}
        onMouseUp={stopPaint}
      >
        {/* Sticky day-header row */}
        <div
          className="sticky top-0 z-10 grid bg-[var(--color-surface)] border-b border-[var(--color-border)]"
          style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}
        >
          <div />
          {DAYS.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Data rows — one per 15-minute slot */}
        <div
          className="grid select-none bg-white"
          style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}
        >
          {Array.from({ length: TOTAL_ROWS }, (_, row) => {
            const isHour = row % 4 === 0;
            return (
              <div key={`row-${row}`} className="contents">
                {/* Time label */}
                <div
                  className={`flex items-center justify-end pr-2 text-[9px] text-[var(--color-text-muted)] ${
                    isHour
                      ? "font-semibold text-[var(--color-text-secondary)]"
                      : "opacity-60"
                  } ${isHour && row !== 0 ? "border-t border-[var(--color-border-light)]" : ""}`}
                  style={{ height: 18 }}
                >
                  {TIME_LABELS[row]}
                </div>

                {/* Day cells */}
                {DAYS.map((_, col) => {
                  const state = grid[row][col];
                  const isSelected = state === "selected";

                  const above = row > 0 && grid[row - 1][col] === "selected";
                  const below =
                    row < TOTAL_ROWS - 1 && grid[row + 1][col] === "selected";
                  const roundTop = isSelected && !above;
                  const roundBottom = isSelected && !below;

                  const radius =
                    roundTop && roundBottom
                      ? "rounded-md"
                      : roundTop
                      ? "rounded-t-md"
                      : roundBottom
                      ? "rounded-b-md"
                      : "";

                  return (
                    <div
                      key={`c-${row}-${col}`}
                      className={`cursor-pointer px-1 ${
                        isHour && row !== 0
                          ? "border-t border-[var(--color-border-light)]"
                          : ""
                      }`}
                      style={{ height: 18 }}
                      onMouseDown={() => startPaint(row, col)}
                      onMouseEnter={() => continuePaint(row, col)}
                      onMouseUp={stopPaint}
                    >
                      <div
                        className={`h-full w-full transition-all duration-100 ${
                          isSelected
                            ? `bg-[var(--color-primary)] opacity-90 hover:opacity-100 ${radius}`
                            : "hover:bg-[var(--color-primary-light)] rounded-md"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend + summary */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)]">
          <div
            className="h-3 w-3 rounded-[3px] border border-[var(--color-border)]"
            style={{ background: "#f0f0ed" }}
          />
          Available
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)]">
          <div className="h-3 w-3 rounded-[3px] bg-[var(--color-primary)]" />
          Selected
        </div>
        <p className="ml-auto text-[11px] font-medium text-[var(--color-primary)]">
          {freeHours.toFixed(1)} hrs marked this week
        </p>
      </div>
    </div>
  );
}
