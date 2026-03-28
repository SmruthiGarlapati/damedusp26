"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import AvailabilityGrid, {
  CellState,
  makeEmptyGrid,
  DEFAULT_INITIAL_GRID,
} from "@/components/AvailabilityGrid";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type CourseColor = "teal" | "peach";

interface Course {
  id: string;
  code: string;
  name: string;
  professor: string;
  schedule: string;
  color: CourseColor;
  priority: boolean;
  skillLevel: "Beginner" | "Intermediate" | "Advanced";
}

const INITIAL_COURSES: Course[] = [
  {
    id: "1",
    code: "CS",
    name: "CS 312: Introduction to Programming",
    professor: "Prof. Sarah Jenkins",
    schedule: "MWF 10:00 AM",
    color: "teal",
    priority: true,
    skillLevel: "Intermediate",
  },
  {
    id: "2",
    code: "M",
    name: "M 408D: Sequences, Series, & Multivariable",
    professor: "Prof. Michael Chen",
    schedule: "TTH 2:00 PM",
    color: "peach",
    priority: false,
    skillLevel: "Beginner",
  },
];

const calEvents = [
  { day: 0, course: "CS 312", top: "21%", height: "18%", color: "teal" },
  { day: 2, course: "CS 312", top: "21%", height: "18%", color: "teal" },
  { day: 4, course: "CS 312", top: "21%", height: "18%", color: "teal" },
  { day: 1, course: "M-408D", top: "54%", height: "13%", color: "peach" },
  { day: 3, course: "M-408D", top: "54%", height: "13%", color: "peach" },
];

const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI"];

const STUDY_METHODS = [
  "Pomodoro",
  "Flashcards",
  "Discussion",
  "Cliff Notes",
  "Practice Problems",
  "Whiteboard",
];

const STUDY_SPOTS = [
  { label: "PCL (Library)", icon: "📚" },
  { label: "FAC", icon: "🏛️" },
  { label: "Union", icon: "🏢" },
  { label: "Starbucks", icon: "☕" },
  { label: "My Apartment", icon: "🏠" },
  { label: "Other", icon: "📍" },
];

const AMENITIES = [
  "Projector",
  "Whiteboard",
  "Dry-erase markers",
  "Large screen",
  "Printer",
];

const DURATION_OPTIONS = ["30 min", "1 hr", "1.5 hr", "2 hr", "3+ hr"];
const GROUP_SIZES = ["1-on-1", "Small (2-3)", "Any"];
const STUDY_ROLES = [
  { value: "teacher", label: "Teacher", desc: "I like explaining concepts to others" },
  { value: "learner", label: "Learner", desc: "I need material taught to me" },
  { value: "collaborative", label: "Collaborative", desc: "I prefer working through things together" },
];

/* ─────────────────────────────────────────────
   Step Indicator
───────────────────────────────────────────── */
function StepIndicator({ current, total }: { current: number; total: number }) {
  const labels = ["Courses", "Preferences", "Logistics", "Availability"];
  return (
    <div className="mb-10 flex items-center justify-center gap-0">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold transition-all ${
                  done
                    ? "bg-[var(--color-primary)] text-white"
                    : active
                    ? "border-2 border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                    : "border-2 border-[var(--color-border)] bg-white text-[var(--color-text-muted)]"
                }`}
              >
                {done ? (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="1,5 4.5,8.5 11,1.5" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  active ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"
                }`}
              >
                {labels[i]}
              </span>
            </div>
            {i < total - 1 && (
              <div
                className={`mx-3 mb-5 h-px w-16 transition-colors ${
                  done ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
export default function SchedulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);

  // Honor ?step=N deep-links (from matching page Edit buttons)
  useEffect(() => {
    const s = Number(searchParams.get("step"));
    if (s >= 1 && s <= 4) setStep(s);
  }, [searchParams]);

  // Step 1 state
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [courseNum, setCourseNum] = useState("");
  const [profName, setProfName] = useState("");
  const [myUTConnected, setMyUTConnected] = useState(true);
  const [gcalConnected, setGcalConnected] = useState(false);
  const [canvasConnected, setCanvasConnected] = useState(false);

  // Step 2 state
  const [studyRole, setStudyRole] = useState("collaborative");
  const [studyMethods, setStudyMethods] = useState<string[]>(["Pomodoro", "Flashcards"]);
  const [groupSize, setGroupSize] = useState("Small (2-3)");
  const [environment, setEnvironment] = useState("Silent (Library Level 5)");
  const [intensity, setIntensity] = useState("Deep Work (2+ Hours)");

  // Step 3 state
  const [studySpot, setStudySpot] = useState("PCL (Library)");
  const [amenities, setAmenities] = useState<string[]>(["Whiteboard"]);
  const [sessionType, setSessionType] = useState<"recurring" | "one-time">("recurring");
  const [recurringDay, setRecurringDay] = useState("MON");
  const [recurringTime, setRecurringTime] = useState("10:00");
  const [oneTimeDate, setOneTimeDate] = useState("");
  const [oneTimeDeadline, setOneTimeDeadline] = useState("");
  const [duration, setDuration] = useState("1.5 hr");

  // Step 4 state
  const [grid, setGrid] = useState<CellState[][]>(DEFAULT_INITIAL_GRID);

  function addCourse() {
    if (!courseNum.trim()) return;
    setCourses((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        code: courseNum.split(" ")[0] || "?",
        name: `${courseNum}: New Course`,
        professor: profName || "TBA",
        schedule: "TBD",
        color: "teal",
        priority: false,
        skillLevel: "Intermediate",
      },
    ]);
    setCourseNum("");
    setProfName("");
  }

  function removeCourse(id: string) {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }

  function togglePriority(id: string) {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, priority: !c.priority } : c))
    );
  }

  function setSkillLevel(id: string, level: Course["skillLevel"]) {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, skillLevel: level } : c))
    );
  }

  function toggleMethod(m: string) {
    setStudyMethods((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  }

  function toggleAmenity(a: string) {
    setAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  }

  const handleGridChange = useCallback((g: CellState[][]) => setGrid(g), []);

  const priorityCourses = courses.filter((c) => c.priority);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 px-12 py-10">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-[38px] font-extrabold leading-[1.1] tracking-[-1.5px]">
              {step === 1 && "Sync your academic life."}
              {step === 2 && "How do you study best?"}
              {step === 3 && "Plan your sessions."}
              {step === 4 && "Block your availability."}
            </h1>
            <p className="mt-2 text-[15px] text-[var(--color-text-secondary)]">
              {step === 1 && "Connect your schedule and tell us which courses you're taking."}
              {step === 2 && "We'll use this to find study partners that match your style."}
              {step === 3 && "Set your preferred spots, session type, and duration."}
              {step === 4 && "Drag to mark times you're free. 9 AM – 9 PM, Mon – Sun."}
            </p>
          </div>
          <button
            onClick={() => router.push("/matching")}
            className="mt-2 flex shrink-0 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--color-text-secondary)] shadow-[var(--shadow-sm)] transition-all hover:border-[var(--color-primary-muted)] hover:text-[var(--color-primary)]"
          >
            Go to Matching
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="8" x2="13" y2="8" /><polyline points="9,4 13,8 9,12" />
            </svg>
          </button>
        </div>

        <StepIndicator current={step} total={4} />

        {/* ── Step 1: Courses & Integrations ── */}
        {step === 1 && (
          <div className="flex gap-10">
            {/* Left */}
            <div className="flex-1 min-w-0">
              {/* Integration buttons */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <IntegrationButton
                  label="Google Calendar"
                  sublabel={gcalConnected ? "Connected" : "Connect calendar"}
                  active={gcalConnected}
                  icon={<CalendarIcon />}
                  onClick={() => setGcalConnected((v) => !v)}
                />
                <IntegrationButton
                  label="myUT Portal"
                  sublabel={myUTConnected ? "Schedule imported" : "Connect myUT"}
                  active={myUTConnected}
                  icon={<MyUTIcon />}
                  onClick={() => setMyUTConnected((v) => !v)}
                />
                <IntegrationButton
                  label="Canvas LMS"
                  sublabel={canvasConnected ? "Assignments synced" : "Connect Canvas"}
                  active={canvasConnected}
                  icon={<CanvasIcon />}
                  onClick={() => setCanvasConnected((v) => !v)}
                />
              </div>

              {/* Active Courses card */}
              <div className="mb-6 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
                <div className="flex items-center gap-2.5 border-b border-[var(--color-border-light)] px-6 py-5">
                  <BookIcon />
                  <h3 className="text-[15px] font-semibold">Active Courses</h3>
                  <span className="ml-auto rounded-full bg-[var(--color-surface)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-text-muted)]">
                    {courses.length} courses
                  </span>
                </div>

                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="border-b border-[var(--color-border-light)] px-6 py-3.5 transition-colors hover:bg-[var(--color-surface)]"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-base font-bold ${
                          c.color === "teal"
                            ? "bg-[var(--color-teal-light)] text-[var(--color-primary)]"
                            : "bg-[var(--color-peach-light)] text-[#8b4a1a]"
                        }`}
                      >
                        {c.code}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-[14px] font-semibold">{c.name}</div>
                        <div className="text-[12px] text-[var(--color-text-secondary)]">
                          {c.professor}
                        </div>
                      </div>

                      {/* Priority toggle */}
                      <button
                        onClick={() => togglePriority(c.id)}
                        title="Mark as priority"
                        className={`shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                          c.priority
                            ? "bg-amber-100 text-amber-700 border border-amber-300"
                            : "border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-amber-300 hover:text-amber-600"
                        }`}
                      >
                        <svg width="10" height="10" viewBox="0 0 16 16" fill={c.priority ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                          <polygon points="8,1 10,6 15,6 11,9.5 12.5,14.5 8,11.5 3.5,14.5 5,9.5 1,6 6,6" />
                        </svg>
                        Priority
                      </button>

                      {/* Skill level */}
                      <select
                        value={c.skillLevel}
                        onChange={(e) =>
                          setSkillLevel(c.id, e.target.value as Course["skillLevel"])
                        }
                        className="shrink-0 h-8 cursor-pointer rounded-lg border border-[var(--color-border)] bg-white px-2.5 text-[12px] text-[var(--color-text-base)] outline-none focus:border-[var(--color-primary)]"
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>

                      <button
                        onClick={() => removeCourse(c.id)}
                        className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-text-muted)] transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add course form */}
                <div className="grid grid-cols-2 gap-4 border-t border-[var(--color-border-light)] px-6 pt-4 pb-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                      Course Number
                    </label>
                    <input
                      value={courseNum}
                      onChange={(e) => setCourseNum(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCourse()}
                      placeholder="e.g. CS 314"
                      className="h-[47px] rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm outline-none transition-all placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                      Professor Name
                    </label>
                    <input
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCourse()}
                      placeholder="e.g. Dr. Smith"
                      className="h-[47px] rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm outline-none transition-all placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                    />
                  </div>
                </div>
                <div className="px-6 pb-5">
                  <button
                    onClick={addCourse}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--color-border)] py-3 text-[13px] font-semibold text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
                  >
                    <PlusIcon /> Add Course Manually
                  </button>
                </div>
              </div>

              {/* Priority summary callout */}
              {priorityCourses.length > 0 && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" className="shrink-0 text-amber-500">
                    <polygon points="8,1 10,6 15,6 11,9.5 12.5,14.5 8,11.5 3.5,14.5 5,9.5 1,6 6,6" />
                  </svg>
                  <div>
                    <span className="text-[13px] font-semibold text-amber-800">
                      Priority: {priorityCourses.map((c) => c.name.split(":")[0]).join(", ")}
                    </span>
                    <span className="ml-2 text-[12px] text-amber-600">
                      — primary matching criteria
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button size="lg" onClick={() => setStep(2)}>
                  Continue to Preferences
                  <ArrowRightIcon />
                </Button>
              </div>
            </div>

            {/* Right — schedule visualization */}
            <div className="w-[460px] shrink-0">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7">
                <div className="mb-5">
                  <h2 className="text-xl font-bold">Your Week</h2>
                  <p className="text-[12px] text-[var(--color-text-secondary)]">
                    Visualizing your imported myUT schedule
                  </p>
                </div>

                <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-white">
                  <div
                    className="grid border-b border-[var(--color-border-light)] bg-[var(--color-surface)]"
                    style={{ gridTemplateColumns: "repeat(5,1fr)" }}
                  >
                    {WEEK_DAYS.map((d) => (
                      <div
                        key={d}
                        className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]"
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                  <div
                    className="relative grid"
                    style={{ gridTemplateColumns: "repeat(5,1fr)", height: 340 }}
                  >
                    {WEEK_DAYS.map((d, i) => (
                      <div
                        key={d}
                        className={`relative ${i < 4 ? "border-r border-[var(--color-border-light)]" : ""}`}
                      />
                    ))}
                    {calEvents.map((ev, i) => (
                      <div
                        key={i}
                        className={`absolute rounded-md px-2 py-2 text-[10px] font-semibold ${
                          ev.color === "teal"
                            ? "border-l-[3px] border-[var(--color-primary)] bg-[var(--color-teal-light)] text-[var(--color-primary)]"
                            : "border-l-[3px] border-[#c47a3a] bg-[var(--color-peach-light)] text-[#8b4a1a]"
                        }`}
                        style={{
                          left: `calc(${ev.day * 20}% + 4px)`,
                          width: "calc(20% - 8px)",
                          top: ev.top,
                          height: ev.height,
                        }}
                      >
                        <div>{ev.course}</div>
                        <div className="mt-0.5 font-normal opacity-70">
                          {ev.color === "teal" ? "10:00 AM" : "2:00 PM"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5">
                  <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
                    Matching Potential
                  </span>
                  <span className="rounded-full bg-[var(--color-primary)] px-3 py-1 text-[12px] font-semibold text-white">
                    +42 Study Buddies
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Study Preferences ── */}
        {step === 2 && (
          <div className="mx-auto max-w-2xl">
            <div className="flex flex-col gap-6">
              {/* Study role */}
              <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-sm)]">
                <h3 className="mb-4 text-[15px] font-bold">Your study role</h3>
                <div className="flex flex-col gap-3">
                  {STUDY_ROLES.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setStudyRole(r.value)}
                      className={`flex items-start gap-3.5 rounded-xl border-[1.5px] px-5 py-4 text-left transition-all ${
                        studyRole === r.value
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                          : "border-[var(--color-border)] hover:border-[var(--color-primary-muted)]"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          studyRole === r.value
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                            : "border-[var(--color-border)]"
                        }`}
                      >
                        {studyRole === r.value && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${studyRole === r.value ? "text-[var(--color-primary)]" : ""}`}>
                          {r.label}
                        </div>
                        <div className="text-[12px] text-[var(--color-text-secondary)]">
                          {r.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Study methods */}
              <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-sm)]">
                <h3 className="mb-1.5 text-[15px] font-bold">Preferred study methods</h3>
                <p className="mb-4 text-[12px] text-[var(--color-text-secondary)]">Select all that you enjoy</p>
                <div className="flex flex-wrap gap-2.5">
                  {STUDY_METHODS.map((m) => (
                    <button
                      key={m}
                      onClick={() => toggleMethod(m)}
                      className={`rounded-full border-[1.5px] px-4 py-2 text-[13px] font-semibold transition-all ${
                        studyMethods.includes(m)
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                          : "border-[var(--color-border)] bg-white text-[var(--color-text-base)] hover:border-[var(--color-primary-muted)]"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group size + environment + intensity */}
              <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-sm)]">
                <h3 className="mb-4 text-[15px] font-bold">Session preferences</h3>

                <div className="mb-5">
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Group size
                  </label>
                  <div className="flex gap-2">
                    {GROUP_SIZES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setGroupSize(s)}
                        className={`flex-1 rounded-lg border-[1.5px] py-2.5 text-sm font-semibold transition-all ${
                          groupSize === s
                            ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                            : "border-[var(--color-border)] text-[var(--color-text-base)] hover:border-[var(--color-primary-muted)]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                      Preferred environment
                    </label>
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value)}
                      className="h-12 cursor-pointer rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-text-base)] outline-none focus:border-[var(--color-primary)]"
                    >
                      <option>Silent (Library Level 5)</option>
                      <option>Quiet (Library Level 3)</option>
                      <option>Collaborative (Study Room)</option>
                      <option>Cafe Environment</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                      Session intensity
                    </label>
                    <select
                      value={intensity}
                      onChange={(e) => setIntensity(e.target.value)}
                      className="h-12 cursor-pointer rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-text-base)] outline-none focus:border-[var(--color-primary)]"
                    >
                      <option>Deep Work (2+ Hours)</option>
                      <option>Medium (1-2 Hours)</option>
                      <option>Quick Check-in (&lt;1 Hour)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeftIcon /> Back
                </Button>
                <Button size="lg" onClick={() => setStep(3)}>
                  Continue to Logistics
                  <ArrowRightIcon />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Logistics ── */}
        {step === 3 && (
          <div className="mx-auto max-w-2xl">
            <div className="flex flex-col gap-6">
              {/* Study spot */}
              <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-sm)]">
                <h3 className="mb-4 text-[15px] font-bold">Preferred study spot</h3>
                <div className="grid grid-cols-3 gap-3">
                  {STUDY_SPOTS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => setStudySpot(s.label)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-[1.5px] px-3 py-4 transition-all ${
                        studySpot === s.label
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                          : "border-[var(--color-border)] hover:border-[var(--color-primary-muted)]"
                      }`}
                    >
                      <span className="text-2xl">{s.icon}</span>
                      <span
                        className={`text-[12px] font-semibold text-center leading-tight ${
                          studySpot === s.label
                            ? "text-[var(--color-primary)]"
                            : "text-[var(--color-text-base)]"
                        }`}
                      >
                        {s.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location amenities */}
              <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-sm)]">
                <h3 className="mb-1.5 text-[15px] font-bold">Available amenities</h3>
                <p className="mb-4 text-[12px] text-[var(--color-text-secondary)]">
                  What equipment is available at your spot? We&apos;ll use this to plan your session.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {AMENITIES.map((a) => (
                    <button
                      key={a}
                      onClick={() => toggleAmenity(a)}
                      className={`flex items-center gap-2 rounded-lg border-[1.5px] px-4 py-2 text-[13px] font-semibold transition-all ${
                        amenities.includes(a)
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                          : "border-[var(--color-border)] text-[var(--color-text-base)] hover:border-[var(--color-primary-muted)]"
                      }`}
                    >
                      {amenities.includes(a) && (
                        <svg width="10" height="8" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="1,5 4.5,8.5 11,1.5" />
                        </svg>
                      )}
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Session type */}
              <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-sm)]">
                <h3 className="mb-4 text-[15px] font-bold">Session type</h3>
                <div className="mb-5 flex gap-3">
                  {(["recurring", "one-time"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSessionType(t)}
                      className={`flex-1 rounded-lg border-[1.5px] py-3 text-sm font-semibold transition-all ${
                        sessionType === t
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                          : "border-[var(--color-border)] text-[var(--color-text-base)] hover:border-[var(--color-primary-muted)]"
                      }`}
                    >
                      {t === "recurring" ? "Recurring" : "One-time"}
                      <div className={`mt-0.5 text-[11px] font-normal ${sessionType === t ? "text-[var(--color-primary)]/70" : "text-[var(--color-text-muted)]"}`}>
                        {t === "recurring" ? "e.g. weekly lab prep" : "e.g. upcoming exam"}
                      </div>
                    </button>
                  ))}
                </div>

                {sessionType === "recurring" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                        Day of week
                      </label>
                      <select
                        value={recurringDay}
                        onChange={(e) => setRecurringDay(e.target.value)}
                        className="h-11 cursor-pointer rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm outline-none focus:border-[var(--color-primary)]"
                      >
                        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                        Time
                      </label>
                      <input
                        type="time"
                        value={recurringTime}
                        onChange={(e) => setRecurringTime(e.target.value)}
                        className="h-11 rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                        Session date
                      </label>
                      <input
                        type="date"
                        value={oneTimeDate}
                        onChange={(e) => setOneTimeDate(e.target.value)}
                        className="h-11 rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                        Deadline (exam / due date)
                      </label>
                      <input
                        type="date"
                        value={oneTimeDeadline}
                        onChange={(e) => setOneTimeDeadline(e.target.value)}
                        className="h-11 rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Duration */}
              <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-sm)]">
                <h3 className="mb-4 text-[15px] font-bold">Preferred session duration</h3>
                <div className="flex gap-2">
                  {DURATION_OPTIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`flex-1 rounded-lg border-[1.5px] py-2.5 text-[13px] font-semibold transition-all ${
                        duration === d
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                          : "border-[var(--color-border)] text-[var(--color-text-base)] hover:border-[var(--color-primary-muted)]"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeftIcon /> Back
                </Button>
                <Button size="lg" onClick={() => setStep(4)}>
                  Continue to Availability
                  <ArrowRightIcon />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Availability ── */}
        {step === 4 && (
          <div className="mx-auto max-w-4xl">
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-md)]">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold">Weekly Availability</h2>
                  <p className="text-[12px] text-[var(--color-text-secondary)]">
                    Click or drag to mark times you&apos;re free · 9 AM – 9 PM
                  </p>
                </div>
                <button
                  onClick={() => setGrid(makeEmptyGrid())}
                  className="rounded-md px-2.5 py-1 text-[11px] font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-base)] transition-colors"
                >
                  Clear
                </button>
              </div>
              <AvailabilityGrid grid={grid} onChange={handleGridChange} maxHeight={520} />
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeftIcon /> Back
              </Button>
              <Button size="lg" onClick={() => router.push("/matching")}>
                Find my study matches
                <ArrowRightIcon />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function IntegrationButton({
  label,
  sublabel,
  active,
  icon,
  onClick,
}: {
  label: string;
  sublabel: string;
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-4 text-left transition-all ${
        active
          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[var(--shadow-primary)]"
          : "border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)] hover:border-[var(--color-primary-muted)] hover:shadow-[var(--shadow-md)]"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          active ? "bg-white/20" : "bg-[var(--color-surface)]"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold">{label}</div>
        <div className={`truncate text-[11px] ${active ? "text-white/70" : "text-[var(--color-text-muted)]"}`}>
          {sublabel}
        </div>
      </div>
      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          active ? "border-white bg-white/25" : "border-[var(--color-border)]"
        }`}
      >
        {active && (
          <svg width="10" height="8" viewBox="0 0 12 10" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="1,5 4.5,8.5 11,1.5" />
          </svg>
        )}
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────
   Icons
───────────────────────────────────────────── */
function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4285f4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function MyUTIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
    </svg>
  );
}
function CanvasIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e66000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12a4 4 0 0 1 8 0" />
      <line x1="12" y1="8" x2="12" y2="8.01" strokeWidth="3" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="20" height="16" viewBox="0 0 24 18" fill="none" stroke="#6b6b65" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1,4 13,4" /><path d="M11,4v10a1,1 0 0,1-1,1H4a1,1 0 0,1-1-1V4" /><path d="M4,4V2a1,1 0 0,1,1-1h4a1,1 0 0,1,1,1v2" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="7" y1="1" x2="7" y2="13" /><line x1="1" y1="7" x2="13" y2="7" />
    </svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="8" x2="13" y2="8" /><polyline points="9,4 13,8 9,12" />
    </svg>
  );
}
function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="13" y1="8" x2="3" y2="8" /><polyline points="7,4 3,8 7,12" />
    </svg>
  );
}
