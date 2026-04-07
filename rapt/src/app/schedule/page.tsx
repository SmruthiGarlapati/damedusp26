"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import AvailabilityGrid, {
  CellState,
  makeEmptyGrid,
  DEFAULT_INITIAL_GRID,
} from "@/components/AvailabilityGrid";
import { isDemoAdminUser } from "@/lib/demoAdmin";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/lib/useCurrentUser";

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
const SURFACE_CARD_CLS =
  "rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,38,18,0.96),rgba(10,22,10,0.92))] shadow-[var(--shadow-md)] backdrop-blur-sm";
const LABEL_CLS = "text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c8e898]/70";
const FIELD_CLS =
  "rounded-xl border border-white/12 bg-[rgba(255,255,255,0.06)] px-4 text-sm text-[var(--color-text-base)] outline-none transition-all [color-scheme:dark] placeholder:text-[#c8e898]/40 focus:border-[var(--color-primary)] focus:bg-[rgba(255,255,255,0.08)] focus:ring-2 focus:ring-[var(--color-primary)]/15";
const INPUT_CLS = `h-[47px] ${FIELD_CLS}`;
const SELECT_CLS = `h-11 cursor-pointer ${FIELD_CLS}`;

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
                className={`flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold transition-all ${
                  done
                    ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-primary)]"
                    : active
                    ? "border border-[var(--color-primary)] bg-[rgba(232,90,10,0.16)] text-[var(--color-fossil)] shadow-[var(--shadow-primary)]"
                    : "border border-white/12 bg-white/6 text-[#f5f0e8]/74"
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
                className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                  done || active ? "text-[#f5f0e8]" : "text-[#c8e898]/58"
                }`}
              >
                {labels[i]}
              </span>
            </div>
            {i < total - 1 && (
              <div
                className={`mx-3 mb-5 h-px w-16 transition-colors ${
                  done ? "bg-[var(--color-primary)]" : "bg-white/12"
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
function SchedulePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);

  const { user, loading: userLoading } = useCurrentUser();
  const isDemoUser = isDemoAdminUser(user);
  const [dbLoading, setDbLoading] = useState(false);

  // Honor ?step=N deep-links (from matching page Edit buttons)
  useEffect(() => {
    const s = Number(searchParams.get("step"));
    if (s >= 1 && s <= 4) setStep(s);
  }, [searchParams]);

  // Step 1 state
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [courseNum, setCourseNum] = useState("");
  const [profName, setProfName] = useState("");

  // Step 2 state

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

  // Load existing data from DB when user loads
  useEffect(() => {
    if (!user) return;

    const prefs = user.preferences as Record<string, unknown>;
    if (prefs) {
      if (Array.isArray(prefs.techniques)) setStudyMethods(prefs.techniques as string[]);
      if (typeof prefs.group_size === "string") setGroupSize(prefs.group_size);
      if (typeof prefs.environment_type === "string") setEnvironment(prefs.environment_type);
      if (typeof prefs.preferred_study_spot === "string") setStudySpot(prefs.preferred_study_spot);
    }

    const avail = user.availability as Record<string, unknown>;
    if (avail && Array.isArray(avail.grid)) {
      setGrid(avail.grid as CellState[][]);
    }

    if (isDemoUser) return;

    const supabase = createClient();

    async function loadFromDb() {
      if (!user) return;
      setDbLoading(true);
      try {
        // Load course_records
        const { data: courseRecords } = await supabase
          .from("course_records")
          .select("*")
          .eq("user_id", user.id);

        if (courseRecords && courseRecords.length > 0) {
          const loadedCourses: Course[] = courseRecords.map((record) => ({
            id: record.id,
            code: record.course_number.split(" ")[0] || "?",
            name: record.course_number,
            professor: record.professor || "TBA",
            schedule: "TBD",
            color: "teal" as const,
            priority: false,
            skillLevel: "Intermediate" as const,
          }));
          setCourses(loadedCourses);
        }

      } catch (err) {
        console.error("Failed to load data from DB:", err);
      } finally {
        setDbLoading(false);
      }
    }

    void loadFromDb();
  }, [user, isDemoUser]);

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

  // Step transition handlers
  function handleStep1Continue() {
    if (user && !isDemoUser) {
      const supabase = createClient();
      const userId = user.id;
      const courseSnapshot = courses;
      void (async () => {
        try {
          await supabase.from("course_records").delete().eq("user_id", userId);
          await supabase.from("course_records").insert(
            courseSnapshot.map((c) => ({
              user_id: userId,
              course_number: c.name.split(":")[0].trim(),
              professor: c.professor || null,
            }))
          );
        } catch (err) {
          console.error("Failed to save courses:", err);
        }
      })();
    }
    setStep(2);
  }

  function handleStep2Continue() {
    if (user && !isDemoUser) {
      const supabase = createClient();
      const userId = user.id;
      const existingPrefs = (user.preferences as Record<string, unknown>) ?? {};
      void (async () => {
        try {
          await supabase
            .from("users")
            .update({
              preferences: {
                ...existingPrefs,
                techniques: studyMethods,
                group_size: groupSize,
                environment_type: environment,
              },
            })
            .eq("id", userId);
        } catch (err) {
          console.error("Failed to save study preferences:", err);
        }
      })();
    }
    setStep(3);
  }

  function handleStep3Continue() {
    if (user && !isDemoUser) {
      const supabase = createClient();
      const userId = user.id;
      const existingPrefs = (user.preferences as Record<string, unknown>) ?? {};
      void (async () => {
        try {
          await supabase
            .from("users")
            .update({
              preferences: {
                ...existingPrefs,
                preferred_study_spot: studySpot,
              },
            })
            .eq("id", userId);
        } catch (err) {
          console.error("Failed to save spot preference:", err);
        }
      })();
    }
    setStep(4);
  }

  function handleStep4Finish() {
    if (user && !isDemoUser) {
      const supabase = createClient();
      const userId = user.id;
      const gridSnapshot = grid;
      void (async () => {
        try {
          await supabase
            .from("users")
            .update({ availability: { grid: gridSnapshot } })
            .eq("id", userId);
        } catch (err) {
          console.error("Failed to save availability:", err);
        }
      })();
    }
    router.push("/matching");
  }

  const continueDisabled = userLoading || dbLoading;

  return (
    <div className="rapt-app-shell flex min-h-screen flex-col">
      <Navbar />

      <main className="rapt-app-main flex-1 px-8 py-8 md:px-12 md:py-10">
        {/* Header */}
        <div className="rapt-hero-card mb-8 flex flex-col gap-5 px-7 py-7 md:flex-row md:items-start md:justify-between md:px-8">
          <div>
            <span className="rapt-eyebrow">
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
              Study setup
            </span>
            <h1 className="rapt-display mt-5 text-[38px] leading-[1.02] text-[var(--color-text-base)] md:text-[44px]">
              {step === 1 && "Set up your courses."}
              {step === 2 && "How do you study best?"}
              {step === 3 && "Plan your sessions."}
              {step === 4 && "Block your availability."}
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
              {step === 1 && "Tell us which courses you're taking."}
              {step === 2 && "We'll use this to find study partners that match your style."}
              {step === 3 && "Set your preferred spots, session type, and duration."}
              {step === 4 && "Drag to mark times you're free. 9 AM – 9 PM, Mon – Sun."}
            </p>
          </div>
          <button
            onClick={() => router.push("/matching")}
            className="mt-2 flex shrink-0 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[rgba(255,255,255,0.06)] px-4 py-2.5 text-[13px] font-semibold text-[var(--color-text-secondary)] shadow-[var(--shadow-sm)] transition-all hover:border-[var(--color-primary-muted)] hover:text-[var(--color-primary)]"
          >
            Go to Matching
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="8" x2="13" y2="8" /><polyline points="9,4 13,8 9,12" />
            </svg>
          </button>
        </div>

        <StepIndicator current={step} total={4} />

        {/* ── Step 1: Courses ── */}
        {step === 1 && (
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-start">
            {/* Left */}
            <div className="flex-1 min-w-0">
              {/* Active Courses card */}
              <div className={`${SURFACE_CARD_CLS} mb-6 overflow-hidden`}>
                <div className="flex items-center gap-2.5 border-b border-white/8 px-6 py-5">
                  <BookIcon />
                  <h3 className="text-[15px] font-semibold text-[var(--color-text-base)]">Active Courses</h3>
                  <span className="ml-auto rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold text-[#c8e898]/78">
                    {courses.length} courses
                  </span>
                </div>

                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="border-b border-white/6 px-6 py-4 transition-colors hover:bg-white/4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${
                          c.color === "teal"
                            ? "bg-[rgba(114,184,74,0.18)] text-[#d8f2b7]"
                            : "bg-[rgba(196,122,58,0.2)] text-[#ffd1ad]"
                        }`}
                      >
                        {c.code}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-[15px] font-semibold text-[var(--color-text-base)]">{c.name}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[12px] text-[var(--color-text-secondary)]">
                          <span>{c.professor}</span>
                          <span className="h-1 w-1 rounded-full bg-white/18" />
                          <span className="text-[#c8e898]/68">{c.schedule}</span>
                        </div>
                      </div>

                      {/* Priority toggle */}
                      <button
                        onClick={() => togglePriority(c.id)}
                        title="Mark as priority"
                        className={`shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                          c.priority
                            ? "border border-amber-300 bg-amber-100 text-amber-700"
                            : "border border-white/10 bg-white/4 text-[#c8e898]/58 hover:border-amber-300 hover:text-amber-200"
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
                        className="h-9 shrink-0 min-w-[138px] rounded-xl border border-white/12 bg-[rgba(255,255,255,0.06)] px-3 text-[12px] text-[var(--color-text-base)] outline-none transition-all focus:border-[var(--color-primary)]"
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>

                      <button
                        onClick={() => removeCourse(c.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add course form */}
                <div className="grid grid-cols-2 gap-4 border-t border-white/6 px-6 pt-5 pb-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={LABEL_CLS}>
                      Course Number
                    </label>
                    <input
                      value={courseNum}
                      onChange={(e) => setCourseNum(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCourse()}
                      placeholder="e.g. CS 314"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={LABEL_CLS}>
                      Professor Name
                    </label>
                    <input
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCourse()}
                      placeholder="e.g. Dr. Smith"
                      className={INPUT_CLS}
                    />
                  </div>
                </div>
                <div className="px-6 pb-5">
                  <button
                    onClick={addCourse}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/14 bg-white/3 py-3.5 text-[13px] font-semibold text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-fossil)]"
                  >
                    <PlusIcon /> Add Course Manually
                  </button>
                </div>
              </div>

              {/* Priority summary callout */}
              {priorityCourses.length > 0 && (
                <div className="mb-6 flex items-center gap-3 rounded-[20px] border border-amber-300/40 bg-[rgba(151,102,34,0.22)] px-5 py-4 shadow-[0_14px_28px_rgba(0,0,0,0.14)]">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" className="shrink-0 text-amber-300">
                    <polygon points="8,1 10,6 15,6 11,9.5 12.5,14.5 8,11.5 3.5,14.5 5,9.5 1,6 6,6" />
                  </svg>
                  <div>
                    <span className="text-[13px] font-semibold text-amber-100">
                      Priority: {priorityCourses.map((c) => c.name.split(":")[0]).join(", ")}
                    </span>
                    <span className="ml-2 text-[12px] text-amber-200/80">
                      — primary matching criteria
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button size="lg" onClick={handleStep1Continue} disabled={continueDisabled}>
                  Continue to Preferences
                  <ArrowRightIcon />
                </Button>
              </div>
            </div>

            {/* Right — schedule visualization */}
            <div className="xl:sticky xl:top-24">
              <div className={`${SURFACE_CARD_CLS} p-7`}>
                <div className="mb-5">
                  <h2 className="text-[30px] font-bold leading-none text-[var(--color-text-base)]">Your Week</h2>
                  <p className="mt-2 text-[12px] text-[var(--color-text-secondary)]">
                    Visualizing your imported myUT schedule
                  </p>
                </div>

                <div className="overflow-hidden rounded-[20px] border border-white/10 bg-[rgba(8,18,8,0.72)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div
                    className="grid border-b border-white/8 bg-[rgba(255,255,255,0.04)]"
                    style={{ gridTemplateColumns: "repeat(5,1fr)" }}
                  >
                    {WEEK_DAYS.map((d) => (
                      <div
                        key={d}
                        className="py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c8e898]/72"
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
                        className={`relative ${i < 4 ? "border-r border-white/6" : ""}`}
                      />
                    ))}
                    {calEvents.map((ev, i) => (
                      <div
                        key={i}
                        className={`absolute rounded-xl px-3 py-2.5 text-[10px] font-semibold shadow-[0_12px_24px_rgba(0,0,0,0.14)] ${
                          ev.color === "teal"
                            ? "border-l-[3px] border-[var(--color-primary)] bg-[rgba(114,184,74,0.16)] text-[#dff5c2]"
                            : "border-l-[3px] border-[#ffb06d] bg-[rgba(196,122,58,0.18)] text-[#ffd5b4]"
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

                <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/6 px-4 py-3">
                  <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
                    Matching Potential
                  </span>
                  <span className="rounded-full bg-[var(--color-primary)] px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-[var(--shadow-primary)]">
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
              {/* Study methods */}
              <div className={`${SURFACE_CARD_CLS} p-6`}>
                <h3 className="mb-1.5 text-[18px] font-bold text-[var(--color-text-base)]">Preferred study methods</h3>
                <p className="mb-4 text-[13px] text-[var(--color-text-secondary)]">Select all that you enjoy</p>
                <div className="flex flex-wrap gap-2.5">
                  {STUDY_METHODS.map((m) => (
                    <button
                      key={m}
                      onClick={() => toggleMethod(m)}
                      className={`rounded-full border-[1.5px] px-4 py-2 text-[13px] font-semibold transition-all ${
                        studyMethods.includes(m)
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[var(--shadow-primary)]"
                          : "border-white/10 bg-white/4 text-[var(--color-text-base)] hover:border-white/18 hover:bg-white/7"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group size + environment + intensity */}
              <div className={`${SURFACE_CARD_CLS} p-6`}>
                <h3 className="mb-4 text-[18px] font-bold text-[var(--color-text-base)]">Session preferences</h3>

                <div className="mb-5">
                  <label className={`mb-2 block ${LABEL_CLS}`}>
                    Group size
                  </label>
                  <div className="flex gap-2">
                    {GROUP_SIZES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setGroupSize(s)}
                        className={`flex-1 rounded-lg border-[1.5px] py-2.5 text-sm font-semibold transition-all ${
                          groupSize === s
                            ? "border-[var(--color-primary)] bg-[rgba(232,90,10,0.16)] text-white shadow-[var(--shadow-primary)]"
                            : "border-white/10 bg-white/4 text-[var(--color-text-base)] hover:border-white/18 hover:bg-white/7"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={LABEL_CLS}>
                      Preferred environment
                    </label>
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value)}
                      className={SELECT_CLS}
                    >
                      <option>Silent (Library Level 5)</option>
                      <option>Quiet (Library Level 3)</option>
                      <option>Collaborative (Study Room)</option>
                      <option>Cafe Environment</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={LABEL_CLS}>
                      Session intensity
                    </label>
                    <select
                      value={intensity}
                      onChange={(e) => setIntensity(e.target.value)}
                      className={SELECT_CLS}
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
                <Button size="lg" onClick={handleStep2Continue} disabled={continueDisabled}>
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
              <div className={`${SURFACE_CARD_CLS} p-6`}>
                <h3 className="mb-4 text-[18px] font-bold text-[var(--color-text-base)]">Preferred study spot</h3>
                <div className="grid grid-cols-3 gap-3">
                  {STUDY_SPOTS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => setStudySpot(s.label)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-[1.5px] px-3 py-4 transition-all ${
                        studySpot === s.label
                          ? "border-[var(--color-primary)] bg-[rgba(232,90,10,0.14)] shadow-[var(--shadow-primary)]"
                          : "border-white/10 bg-white/4 hover:border-white/18 hover:bg-white/7"
                      }`}
                    >
                      <span className="text-2xl">{s.icon}</span>
                      <span
                        className={`text-[12px] font-semibold text-center leading-tight ${
                          studySpot === s.label
                            ? "text-white"
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
              <div className={`${SURFACE_CARD_CLS} p-6`}>
                <h3 className="mb-1.5 text-[18px] font-bold text-[var(--color-text-base)]">Available amenities</h3>
                <p className="mb-4 text-[13px] text-[var(--color-text-secondary)]">
                  What equipment is available at your spot? We&apos;ll use this to plan your session.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {AMENITIES.map((a) => (
                    <button
                      key={a}
                      onClick={() => toggleAmenity(a)}
                      className={`flex items-center gap-2 rounded-lg border-[1.5px] px-4 py-2 text-[13px] font-semibold transition-all ${
                        amenities.includes(a)
                          ? "border-[var(--color-primary)] bg-[rgba(232,90,10,0.16)] text-white shadow-[var(--shadow-primary)]"
                          : "border-white/10 bg-white/4 text-[var(--color-text-base)] hover:border-white/18 hover:bg-white/7"
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
              <div className={`${SURFACE_CARD_CLS} p-6`}>
                <h3 className="mb-4 text-[18px] font-bold text-[var(--color-text-base)]">Session type</h3>
                <div className="mb-5 flex gap-3">
                  {(["recurring", "one-time"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSessionType(t)}
                      className={`flex-1 rounded-lg border-[1.5px] py-3 text-sm font-semibold transition-all ${
                        sessionType === t
                          ? "border-[var(--color-primary)] bg-[rgba(232,90,10,0.16)] text-white shadow-[var(--shadow-primary)]"
                          : "border-white/10 bg-white/4 text-[var(--color-text-base)] hover:border-white/18 hover:bg-white/7"
                      }`}
                    >
                      {t === "recurring" ? "Recurring" : "One-time"}
                      <div className={`mt-0.5 text-[11px] font-normal ${sessionType === t ? "text-white/72" : "text-[var(--color-text-muted)]"}`}>
                        {t === "recurring" ? "e.g. weekly lab prep" : "e.g. upcoming exam"}
                      </div>
                    </button>
                  ))}
                </div>

                {sessionType === "recurring" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className={LABEL_CLS}>
                        Day of week
                      </label>
                      <select
                        value={recurringDay}
                        onChange={(e) => setRecurringDay(e.target.value)}
                        className={SELECT_CLS}
                      >
                        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={LABEL_CLS}>
                        Time
                      </label>
                      <input
                        type="time"
                        value={recurringTime}
                        onChange={(e) => setRecurringTime(e.target.value)}
                        className={INPUT_CLS}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className={LABEL_CLS}>
                        Session date
                      </label>
                      <input
                        type="date"
                        value={oneTimeDate}
                        onChange={(e) => setOneTimeDate(e.target.value)}
                        className={INPUT_CLS}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={LABEL_CLS}>
                        Deadline (exam / due date)
                      </label>
                      <input
                        type="date"
                        value={oneTimeDeadline}
                        onChange={(e) => setOneTimeDeadline(e.target.value)}
                        className={INPUT_CLS}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Duration */}
              <div className={`${SURFACE_CARD_CLS} p-6`}>
                <h3 className="mb-4 text-[18px] font-bold text-[var(--color-text-base)]">Preferred session duration</h3>
                <div className="flex gap-2">
                  {DURATION_OPTIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`flex-1 rounded-lg border-[1.5px] py-2.5 text-[13px] font-semibold transition-all ${
                        duration === d
                          ? "border-[var(--color-primary)] bg-[rgba(232,90,10,0.16)] text-white shadow-[var(--shadow-primary)]"
                          : "border-white/10 bg-white/4 text-[var(--color-text-base)] hover:border-white/18 hover:bg-white/7"
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
                <Button size="lg" onClick={handleStep3Continue} disabled={continueDisabled}>
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
            <div className={`${SURFACE_CARD_CLS} p-6`}>
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-text-base)]">Weekly Availability</h2>
                  <p className="text-[12px] text-[var(--color-text-secondary)]">
                    Click or drag to mark times you&apos;re free · 9 AM – 9 PM
                  </p>
                </div>
                <button
                  onClick={() => setGrid(makeEmptyGrid())}
                  className="rounded-full border border-white/12 bg-white/4 px-3 py-1.5 text-[11px] font-semibold text-[var(--color-text-secondary)] transition-colors hover:border-white/18 hover:bg-white/7 hover:text-[var(--color-text-base)]"
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
              <Button size="lg" onClick={handleStep4Finish}>
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
   Icons
───────────────────────────────────────────── */
function BookIcon() {
  return (
    <svg width="20" height="16" viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#c8e898]/66">
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

export default function SchedulePage() {
  return <Suspense><SchedulePageInner /></Suspense>;
}
