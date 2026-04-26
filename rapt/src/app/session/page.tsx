"use client";

import Link from "next/link";
import { CuteDino, DinoCardAccent } from "@/components/DinoDecoration";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { GAME_LAUNCH_ITEMS, withSessionQuery } from "./components/gameChrome";

/* ════════════════════════════════════════
   TYPES
════════════════════════════════════════ */
const FLASHCARDS = [
  { q: "What is a linked list?",                           a: "A linear data structure where each node stores data and a pointer to the next node. Unlike arrays, nodes are not stored contiguously in memory." },
  { q: "Time complexity of searching a linked list?",      a: "O(n) — traverse from head. No random access by index." },
  { q: "What is a binary tree?",                           a: "A tree where each node has at most two children: left and right." },
  { q: "What is an in-order traversal?",                   a: "Left → Root → Right. For a BST this visits nodes in sorted ascending order." },
  { q: "Height of a balanced binary tree with n nodes?",   a: "O(log n) — each level doubles node count, so ≈log₂(n) levels." },
  { q: "What is a doubly linked list?",                    a: "Each node has next and prev pointers, enabling O(1) deletion given a direct node reference." },
];

type Tab    = "flash" | "games" | "discussion";

interface DBResource { name: string; url: string; uploader: string; type: "pdf" | "image" | "other"; uploadedAt: string; }
interface AISummary {
  headline: string;
  concepts: { term: string; def: string; color: string }[];
  complexity: { op: string; ll: string; bst_avg: string; bst_worst: string }[];
  tip: string;
}

/* ── Demo seed data ── */
const DEMO_FILES: DBResource[] = [
  { name: "Week 7 — Linked Lists Lecture.pdf",  url: "/demo-files/linked-lists-lecture.html",  uploader: "Prof. Scott",  type: "pdf",   uploadedAt: "" },
  { name: "Binary Trees Diagram Sheet.pdf",     url: "/demo-files/binary-trees-diagram.html",  uploader: "Marcus J.",    type: "pdf",   uploadedAt: "" },
  { name: "CS 314 Exam 2 Practice Problems.pdf",url: "/demo-files/cs314-exam2-practice.html",  uploader: "Panav M.",     type: "pdf",   uploadedAt: "" },
  { name: "Pointer Arithmetic Cheatsheet.png",  url: "/demo-files/pointer-arithmetic.svg",     uploader: "TA Office",    type: "image", uploadedAt: "" },
];

const DEMO_SUMMARY: AISummary = {
  headline: "Focused on dynamic memory and tree traversals — core topics for the upcoming CS 314 Exam 2.",
  concepts: [
    { term: "Singly Linked List",   def: "A chain of nodes where each stores data and a next pointer. O(n) search, O(1) head insert — no random index access.", color: "blue" },
    { term: "Binary Search Tree",   def: "A binary tree enforcing left < root < right. Average O(log n) for search, insert, delete; degrades to O(n) when unbalanced.", color: "green" },
    { term: "Tree Traversals",      def: "In-order (L→Root→R) gives sorted output on BSTs. Pre-order visits root first; post-order visits root last.", color: "purple" },
    { term: "Doubly Linked List",   def: "Adds a prev pointer to each node. Enables O(1) deletion when holding a direct node reference — costs 8 extra bytes/node.", color: "amber" },
  ],
  complexity: [
    { op: "Search",       ll: "O(n)",   bst_avg: "O(log n)", bst_worst: "O(n)" },
    { op: "Insert",       ll: "O(1)*",  bst_avg: "O(log n)", bst_worst: "O(n)" },
    { op: "Delete",       ll: "O(n)",   bst_avg: "O(log n)", bst_worst: "O(n)" },
    { op: "Index access", ll: "O(n)",   bst_avg: "—",        bst_worst: "—"    },
  ],
  tip: "For Exam 2, practice drawing pointer diagrams for insert and delete — most lost points come from incorrect next/prev updates. Pay special attention to edge cases: empty list, single-node list, and head/tail deletions.",
};

const DEMO_NOTES = `Session: ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} · CS 314 with Marcus

Key topics today:
• Linked lists — O(n) search, O(1) head insert
• BST property: left < root < right
• In-order traversal gives sorted output

Questions to follow up on:
• When does a BST degrade to O(n)? → skewed/sorted insertion
• Difference between pre-order, in-order, post-order?

TODO before Exam 2:
☐ Practice pointer diagrams for insert/delete
☐ Review doubly linked list deletion
☐ Memorize traversal orders
`;

/* ════════════════════════════════════════
   PAGE
════════════════════════════════════════ */
function SessionPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestedTab = searchParams.get("tab");
  const launcherQuery = searchParams.toString();

  const partnerName = searchParams.get("partner") ?? "Marcus Johnson";
  const course      = searchParams.get("course")  ?? "CS 314";
  const location    = searchParams.get("location") ?? "PCL Library, Room 2.106";
  const duration    = Number(searchParams.get("duration") ?? 60);
  const matchId     = searchParams.get("matchId") ?? null;

  /* ── Tabs ── */
  const [activeTab, setActiveTab] = useState<Tab>(() =>
    requestedTab === "flash" || requestedTab === "games" || requestedTab === "discussion"
      ? requestedTab
      : "flash",
  );

  /* ── Flashcards ── */
  const [cardIdx, setCardIdx]   = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [flipped, setFlipped]   = useState<Record<number, "know" | "review">>({});

  /* ── Notes ── */
  const [notes, setNotes]         = useState(DEMO_NOTES);
  const [notesSaved, setNotesSaved] = useState(true);
  const didMountNotes = useRef(false);
  const notesTimer    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* ── Resources (demo when no matchId; real sessions load from DB on mount) ── */
  const [resources, setResources] = useState<DBResource[]>(DEMO_FILES);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputSummaryRef = useRef<HTMLInputElement>(null);

  /* ── File preview modal ── */
  const [previewFile, setPreviewFile] = useState<DBResource | null>(null);

  /* ── AI Summary (Groq) ── */
  const [summary,        setSummary]        = useState<AISummary|null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError,   setSummaryError]   = useState("");
  const summaryFetched = useRef(false);

  /* ════════════════════ DB: on mount ════════════════════ */
  useEffect(() => {
    if (requestedTab === "flash" || requestedTab === "games" || requestedTab === "discussion") {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  useEffect(() => {
    if (!matchId) return;
    const supabase = createClient();
    supabase.from("matches").update({ started: true, status: "live" }).eq("id", matchId).then(() => {});
    supabase.from("matches").select("notes, session_resources").eq("id", matchId).single().then(({ data }) => {
      if (data?.notes) setNotes(data.notes);
      // Real session: always override demo files (even if none uploaded yet)
      setResources([]);
      if (data?.session_resources) {
        const sr = data.session_resources as Record<string,unknown>;
        if (Array.isArray(sr.files) && sr.files.length) setResources(sr.files as DBResource[]);
        if (sr.flashcards && typeof sr.flashcards === "object") setFlipped(sr.flashcards as Record<number,"know"|"review">);
      }
      didMountNotes.current = true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ════════════════════ DB: auto-save notes ════════════════════ */
  useEffect(() => {
    if (!matchId || !didMountNotes.current) return;
    setNotesSaved(false);
    clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(async () => {
      const supabase = createClient();
      await supabase.from("matches").update({ notes }).eq("id", matchId);
      setNotesSaved(true);
    }, 2000);
    return () => clearTimeout(notesTimer.current);
  }, [notes, matchId]);

  /* ════════════════════ DB: save flashcard progress ════════════════════ */
  const saveFlashcards = useCallback(async (next: Record<number,"know"|"review">) => {
    if (!matchId) return;
    const supabase = createClient();
    const { data } = await supabase.from("matches").select("session_resources").eq("id", matchId).single();
    const sr = (data?.session_resources as Record<string,unknown>) ?? {};
    await supabase.from("matches").update({ session_resources: { ...sr, flashcards: next } }).eq("id", matchId);
  }, [matchId]);

  /* ════════════════════ Groq: fetch summary ════════════════════ */
  const fetchSummary = useCallback(async () => {
    if (summaryFetched.current) return;
    summaryFetched.current = true;
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course, notes, partnerName }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: AISummary = await res.json();
      setSummary(data);
    } catch {
      setSummaryError("Could not generate summary. Add your GROQ_API_KEY to .env.local.");
    } finally {
      setSummaryLoading(false);
    }
  }, [course, notes, partnerName]);

  useEffect(() => {
    if (activeTab === "discussion") fetchSummary();
  }, [activeTab, fetchSummary]);

  /* ════════════════════ End session ════════════════════ */
  const handleEndSession = async () => {
    if (matchId) {
      const supabase = createClient();
      await supabase.from("matches").update({ status: "completed", notes }).eq("id", matchId);
    }
    router.push("/sessions");
  };

  /* ════════════════════ File upload ════════════════════ */
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const supabase = createClient();
    const path = matchId ? `sessions/${matchId}/${Date.now()}-${file.name}` : `demo/${Date.now()}-${file.name}`;
    const { data: uploaded, error } = await supabase.storage.from("session-files").upload(path, file);
    if (error || !uploaded) { alert("Upload failed — check Supabase storage bucket."); return; }
    const { data: { publicUrl } } = supabase.storage.from("session-files").getPublicUrl(path);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const type: DBResource["type"] = ext === "pdf" ? "pdf" : ["png","jpg","jpeg","gif","webp"].includes(ext) ? "image" : "other";
    const newR: DBResource = { name: file.name, url: publicUrl, uploader: "You", type, uploadedAt: new Date().toISOString() };
    const updated = [...resources, newR];
    setResources(updated);
    if (matchId) {
      const { data } = await supabase.from("matches").select("session_resources").eq("id", matchId).single();
      const sr = (data?.session_resources as Record<string,unknown>) ?? {};
      await supabase.from("matches").update({ session_resources: { ...sr, files: updated } }).eq("id", matchId);
    }
    e.target.value = "";
  }

  /* ════════════════════ Flashcard helpers ════════════════════ */
  const card = FLASHCARDS[cardIdx % FLASHCARDS.length];
  const knownCount  = Object.values(flipped).filter((v) => v === "know").length;
  const reviewCount = Object.values(flipped).filter((v) => v === "review").length;
  function markCard(verdict: "know"|"review") {
    const next = { ...flipped, [cardIdx]: verdict };
    setFlipped(next); setRevealed(false); setCardIdx((i) => i + 1);
    saveFlashcards(next);
  }
  const colorMap: Record<string, string> = { blue: "border-l-[var(--color-primary)]", green: "border-l-green-500", purple: "border-l-violet-500", amber: "border-l-amber-500" };
  const fileBadgeClasses: Record<DBResource["type"], string> = {
    pdf: "border-[#f0c7bf] bg-[#fff1ed] text-[#cb5f4b]",
    image: "border-[#bfd4ee] bg-[#eef6ff] text-[#4b78b0]",
    other: "border-[var(--color-primary-muted)] bg-[var(--color-primary-light)] text-[var(--color-primary)]",
  };

  function renderFileBadge(resource: DBResource, size: "compact" | "regular" = "regular") {
    const badgeSize = size === "compact" ? "h-10 w-10 rounded-xl" : "h-11 w-11 rounded-xl";
    const iconClassName = size === "compact" ? "h-[18px] w-[18px]" : "h-5 w-5";

    return (
      <div
        className={`flex shrink-0 items-center justify-center border ${badgeSize} ${fileBadgeClasses[resource.type]}`}
      >
        {resource.type === "pdf" ? (
          <PdfIcon className={iconClassName} />
        ) : resource.type === "image" ? (
          <ImageFileIcon className={iconClassName} />
        ) : (
          <FileIcon className={iconClassName} />
        )}
      </div>
    );
  }

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <div className="rapt-app-shell rapt-session-workspace flex min-h-screen flex-col">
      <Navbar />

      <div className="relative mx-4 mb-4 overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,239,229,0.88))] shadow-[0_24px_56px_rgba(52,44,35,0.12)] backdrop-blur-sm md:mx-6">
        <DinoCardAccent className="opacity-70" color="#5c84ad" />
        {/* Live banner */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 border-b border-[var(--color-border-light)] bg-[var(--color-action-bg)] px-6 py-3 text-[var(--color-bone)] md:px-8">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          <span className="text-[13px] font-bold">Live Session · {course} with {partnerName}</span>
          <span className="ml-auto text-[12px] font-medium text-[#D9D9D9]/70">{duration} min · {location}</span>
          <button onClick={() => router.push("/sessions")} className="ml-4 flex items-center gap-1.5 rounded-lg border border-[#D9D9D9]/20 px-3 py-1 text-[12px] font-semibold text-[#FFFFFF] transition-colors hover:bg-white/10">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="13" y1="8" x2="3" y2="8"/><polyline points="7,4 3,8 7,12"/></svg>
            Back
          </button>
          <button onClick={handleEndSession} className="flex items-center gap-1.5 rounded-lg bg-[var(--color-action-bg)] px-3 py-1 text-[12px] font-bold text-white transition-colors hover:bg-[var(--color-action-hover)]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
            End Session
          </button>
        </div>

        <div className="relative z-10 grid flex-1 overflow-hidden xl:min-h-[calc(100vh-11rem)] xl:grid-cols-[220px_minmax(0,1fr)_268px]">

        {/* ── Left sidebar ── */}
        <aside className="order-2 flex flex-col border-t border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(244,236,226,0.72))] p-5 overflow-y-auto xl:order-1 xl:border-t-0 xl:border-r">
          <div className="mb-4">
            <h2 className="rapt-display text-[18px] font-extrabold tracking-tight text-[var(--color-text-base)]">Study Session</h2>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">{course}</p>
          </div>
          <nav className="mb-5 flex flex-col gap-1">
            {([
              { id: "flash",      label: "Flashcards", icon: <FlashIcon /> },
              { id: "games",      label: "Games",      icon: <GameIcon /> },
              { id: "discussion", label: "AI Summary", icon: <SparkleIcon /> },
            ] as { id: Tab; label: string; icon: React.ReactNode }[]).map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all ${activeTab === item.id ? "bg-[var(--color-action-bg)] font-semibold text-white shadow-[var(--shadow-primary)]" : "text-[var(--color-text-secondary)] hover:bg-white/80"}`}>
                {item.icon}{item.label}
              </button>
            ))}
          </nav>

          {/* Files in sidebar */}
          <div className="border-t border-[var(--color-border)] pt-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Shared Files</p>
            <div className="flex flex-col gap-1.5">
              {resources.slice(0, 4).map((r, i) => (
                <button key={i} onClick={() => setPreviewFile(r)}
                  className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white/94 p-2.5 text-left shadow-[0_6px_16px_rgba(52,44,35,0.06)] transition-all hover:border-[var(--color-primary-muted)] hover:bg-white hover:shadow-[0_10px_22px_rgba(52,44,35,0.1)]">
                  {renderFileBadge(r, "compact")}
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold text-[var(--color-text-base)]">{r.name}</p>
                    <p className="mt-0.5 truncate text-[10px] text-[var(--color-text-muted)]">{r.uploader}</p>
                  </div>
                </button>
              ))}
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
              <button onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-1 rounded-lg border-[1.5px] border-dashed border-[var(--color-border)] py-2 text-[11px] font-medium text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
                <PlusIcon /> Upload
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="order-1 flex flex-col gap-5 overflow-y-auto p-5 md:p-7 xl:order-2">

          {/* ══ FLASHCARDS ══ */}
          {activeTab === "flash" && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {FLASHCARDS.map((_, i) => (
                    <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${flipped[i] === "know" ? "bg-green-500" : flipped[i] === "review" ? "bg-amber-400" : i === cardIdx % FLASHCARDS.length ? "bg-[var(--color-action-bg)]" : "bg-[var(--color-border)]"}`} />
                  ))}
                </div>
                <span className="text-[12px] text-[var(--color-text-muted)]">{knownCount} known · {reviewCount} to review</span>
              </div>
              <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[26px] border border-[var(--color-border)] bg-white p-10 shadow-[var(--shadow-md)]">
                <span className="mb-4 rounded-full bg-[var(--color-primary-light)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--color-primary)]">Card {(cardIdx % FLASHCARDS.length) + 1} of {FLASHCARDS.length}</span>
                <p className="mb-6 max-w-lg text-center text-[18px] font-bold leading-snug text-[var(--color-text-base)]">{card.q}</p>
                {!revealed ? (
                  <button onClick={() => setRevealed(true)} className="flex items-center gap-2 rounded-xl bg-[var(--color-action-bg)] px-8 py-3 text-[14px] font-bold text-white shadow-[var(--shadow-primary)] hover:-translate-y-px hover:bg-[var(--color-action-hover)] transition-all">
                    <EyeIcon /> Reveal Answer
                  </button>
                ) : (
                  <div className="max-w-lg text-center">
                    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">
                      <p className="text-[14px] leading-relaxed text-[var(--color-text-secondary)]">{card.a}</p>
                    </div>
                    <div className="mt-5 flex justify-center gap-3">
                      <button onClick={() => markCard("review")} className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-2.5 text-[13px] font-bold text-amber-700 hover:bg-amber-100">🤔 Still learning</button>
                      <button onClick={() => markCard("know")} className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(22,163,74,0.25)] hover:bg-green-700">✓ Got it!</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-between">
                <button onClick={() => { setCardIdx((i) => Math.max(0,i-1)); setRevealed(false); }} disabled={cardIdx===0} className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-4 py-2 text-[12px] font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-40"><ChevronLeftIcon /> Prev</button>
                <button onClick={() => { setCardIdx((i) => i+1); setRevealed(false); }} className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-4 py-2 text-[12px] font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">Skip <ChevronRightIcon /></button>
              </div>
            </>
          )}

          {/* ══ GAMES ══ */}
          {activeTab === "games" && (
            <div className="flex flex-col gap-5">

              {/* ── Notepad FIRST ── */}
              <div className="flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-md)]">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    <span className="text-[12px] font-bold">Session Notes</span>
                    <span className={`text-[10px] font-medium ${notesSaved ? "text-green-600" : "text-[var(--color-text-muted)]"}`}>
                      {matchId ? (notesSaved ? "● Saved" : "● Saving…") : "● Demo mode"}
                    </span>
                  </div>
                  {notes.length > 0 && <span className="text-[10px] text-[var(--color-text-muted)]">{notes.length} chars</span>}
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Take notes here — they're auto-saved every 2 seconds…"
                  className="w-full resize-none outline-none text-[14px] text-[var(--color-text-base)] placeholder:text-[var(--color-text-muted)]"
                  style={{
                    fontFamily: "ui-monospace, monospace",
                    lineHeight: "32px",
                    padding: "12px 20px 20px",
                    minHeight: 320,
                    backgroundColor: "rgba(255,253,250,0.98)",
                    backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, rgba(67,100,133,0.09) 31px, rgba(67,100,133,0.09) 32px)",
                    backgroundAttachment: "local",
                    backgroundPosition: "0 11px",
                  }}
                />
              </div>

              {/* ── Divider ── */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--color-border)]" />
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                  <span>🦕</span>
                  Study Games
                  <span>🦖</span>
                </span>
                <div className="h-px flex-1 bg-[var(--color-border)]" />
              </div>

              {/* ── Playing together banner ── */}
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-primary-muted)] bg-[var(--color-primary-light)] px-4 py-3">
                <div className="flex -space-x-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[var(--color-primary-light)] text-[9px] font-bold text-[var(--color-primary)]">YOU</div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[var(--color-action-bg)] text-[10px] font-bold text-white">
                    {partnerName.split(" ").map((p) => p[0]).join("").slice(0,2).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-[12px] font-bold text-[var(--color-text-base)]">Playing with {partnerName.split(" ")[0]}</span>
                  <span className="ml-2 text-[11px] text-[var(--color-text-muted)]">· Pick a game below to play together</span>
                </div>
                <span className="rounded-full bg-[var(--color-action-bg)] px-2.5 py-1 text-[10px] font-bold text-white">2 Players</span>
              </div>

              {/* ── Game launcher cards ── */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {GAME_LAUNCH_ITEMS.map((game) => {
                  const isCollaborative = game.label === "Fossil Dig" || game.label === "Brain Blast" || game.label === "Lightning Rod";
                  const isFossilDig = game.label === "Fossil Dig";
                  return game.href ? (
                    <Link
                      key={game.label}
                      href={withSessionQuery(game.href, { toString: () => launcherQuery })}
                      className={`group relative flex flex-col gap-3 rounded-2xl border p-4 transition-all duration-200 ${game.available ? "border-[var(--color-primary-muted)] bg-[var(--color-primary-light)] shadow-[0_10px_22px_rgba(52,44,35,0.08)] hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-[0_14px_28px_rgba(52,44,35,0.12)]" : "border-[var(--color-border)] bg-white/74 hover:border-[rgba(67,100,133,0.28)] hover:bg-white"}`}
                    >
                      {isCollaborative && (
                        <span className="absolute right-3 top-3 rounded-full bg-[var(--color-action-bg)] px-1.5 py-0.5 text-[9px] font-bold text-white">2P</span>
                      )}
                      {isFossilDig ? (
                        <CuteDino className="h-9 w-9 transition-transform duration-200 group-hover:scale-110" color="#436485" />
                      ) : (
                        <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${game.available ? "border border-[var(--color-border)] bg-white text-[var(--color-primary)]" : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"}`}>
                          <game.Icon className="h-4 w-4" />
                        </span>
                      )}
                      <div>
                        <span className={`block text-[13px] font-bold leading-tight ${game.available ? "text-[var(--color-text-base)]" : "text-[var(--color-text-muted)]"}`}>
                          {game.label}
                        </span>
                        {isCollaborative && game.available && (
                          <span className="mt-0.5 block text-[10px] text-[var(--color-text-muted)]">Together with {partnerName.split(" ")[0]}</span>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <span
                      key={game.label}
                      className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-white/74 p-4 text-[var(--color-text-muted)]"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]">
                        <game.Icon className="h-4 w-4" />
                      </span>
                      <span className="text-[13px] font-bold leading-tight text-[var(--color-text-muted)]">
                        {game.label}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ AI SUMMARY (Groq) ══ */}
          {activeTab === "discussion" && (() => {
            const displaySummary = summary ?? (summaryError ? DEMO_SUMMARY : null);
            const isDemo = !summary && !!summaryError;
            return (
            <div className="flex flex-col gap-4">

              {/* ── Header ── */}
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-5 py-4 shadow-[var(--shadow-sm)]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-action-bg)]">
                  <SparkleIcon color="white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[16px] font-extrabold tracking-tight">AI Study Summary</h2>
                  <p className="text-[12px] text-[var(--color-text-secondary)]">{course} · Live with {partnerName.split(" ")[0]}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isDemo && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">Demo</span>}
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold text-green-700">● Live</span>
                  <button onClick={() => { summaryFetched.current = false; setSummary(null); setSummaryError(""); fetchSummary(); }}
                    disabled={summaryLoading}
                    className="rounded-lg border border-[var(--color-border)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-40">
                    ↺ Regenerate
                  </button>
                </div>
              </div>

              {/* ── Shared Files — right under header ── */}
              <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">📎 Session Files</p>
                  <button onClick={() => fileInputSummaryRef.current?.click()}
                    className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
                    <PlusIcon /> Upload
                  </button>
                </div>
                <input ref={fileInputSummaryRef} type="file" className="hidden" onChange={handleFileUpload} />
                <div className="grid gap-2 md:grid-cols-2">
                  {resources.map((r, i) => (
                    <button key={i} onClick={() => setPreviewFile(r)}
                      className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white p-3 text-left shadow-[0_8px_18px_rgba(52,44,35,0.06)] transition-all hover:border-[var(--color-primary-muted)] hover:shadow-[0_12px_26px_rgba(52,44,35,0.1)] cursor-pointer">
                      {renderFileBadge(r)}
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-semibold leading-tight text-[var(--color-text-base)]">{r.name}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{r.uploader}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Loading ── */}
              {summaryLoading && (
                <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-5 py-5 shadow-[var(--shadow-sm)]">
                  <div className="h-5 w-5 animate-spin rounded-full border-[3px] border-[var(--color-primary)] border-t-transparent shrink-0" />
                  <p className="text-[13px] text-[var(--color-text-muted)]">Groq is reading your notes and generating a personalized summary…</p>
                </div>
              )}

              {/* ── Summary content (Groq or demo fallback) ── */}
              {displaySummary && !summaryLoading && (
                <>
                  {/* Headline */}
                  <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-5 py-4 shadow-[var(--shadow-sm)]">
                    <SparkleIcon />
                    <p className="text-[13px] italic leading-relaxed text-[var(--color-text-secondary)]">&ldquo;{displaySummary.headline}&rdquo;</p>
                  </div>

                  {/* Core Concepts — 2-col cards */}
                  <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">📌 Core Concepts</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {displaySummary.concepts.map(({ term, def, color }) => (
                        <div key={term} className={`rounded-xl border border-[var(--color-border)] border-l-[3px] ${colorMap[color] ?? "border-l-[var(--color-primary)]"} bg-[var(--color-surface)] p-4`}>
                          <p className="mb-1.5 text-[13px] font-bold text-[var(--color-text-base)]">{term}</p>
                          <p className="text-[12px] leading-relaxed text-[var(--color-text-secondary)]">{def}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time Complexity table */}
                  <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">⚡ Time Complexity</p>
                    <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className="bg-[var(--color-surface)]">
                            {["Operation","Singly LL","BST avg","BST worst"].map((h) => (
                              <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {displaySummary.complexity.map((row, ri) => (
                            <tr key={ri} className={ri%2===0?"bg-white":"bg-[var(--color-surface)]"}>
                              <td className="border-t border-[var(--color-border)] px-4 py-2.5 font-semibold text-[var(--color-text-base)]">{row.op}</td>
                              {[row.ll, row.bst_avg, row.bst_worst].map((v,i) => (
                                <td key={i} className={`border-t border-[var(--color-border)] px-4 py-2.5 font-mono text-[12px] font-bold ${v==="O(1)"||v==="O(1)*"?"text-green-600":v.includes("log")?"text-[var(--color-primary)]":v==="—"?"text-[var(--color-text-muted)] font-normal":"text-[var(--color-text-secondary)]"}`}>{v}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-2 text-[10px] text-[var(--color-text-muted)]">* At head. Tail insert without tail pointer is O(n).</p>
                  </div>

                  {/* Study Tip */}
                  <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 px-5 py-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[18px]">💡</div>
                    <div>
                      <p className="text-[13px] font-bold text-amber-900">{isDemo ? "Exam Focus" : "AI Study Tip"}</p>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-amber-800">{displaySummary.tip}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            );
          })()}
        </main>

        {/* ── Right sidebar ── */}
        <aside className="order-3 border-t border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(244,236,226,0.72))] p-5 overflow-y-auto xl:border-t-0 xl:border-l">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Session Logistics</p>

          {/* Google Maps */}
          <div className="relative mb-3 overflow-hidden rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)]" style={{ height: 160 }}>
            <div className="absolute inset-0 overflow-hidden" style={{ height: 160 }}>
              <iframe title="map" src="https://maps.google.com/maps?q=Perry+Castaneda+Library+101+E+21st+St+Austin+TX&t=&z=17&ie=UTF8&iwloc=&output=embed"
                width="100%" height="200" style={{ border:0, marginTop:0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>
          <a href="https://www.google.com/maps/search/?api=1&query=Perry+Castaneda+Library+101+E+21st+St+Austin+TX" target="_blank" rel="noopener noreferrer"
            className="mb-4 flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-primary)] hover:underline">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Open in Google Maps
          </a>

          <div className="mb-4">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Location</p>
            <p className="text-[13px] font-semibold">{location}</p>
          </div>

          <div className="mb-5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Study Partner</p>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-action-bg)] text-[12px] font-bold text-white">
                {partnerName.split(" ").map((p) => p[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div>
                <p className="text-[13px] font-semibold">{partnerName}</p>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /><span className="text-[11px] text-green-600 font-medium">Online</span></span>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Amenities</p>
            <div className="flex flex-col gap-1.5">
              {[{label:"Whiteboard",icon:<WhiteboardIcon/>},{label:"Fast Wi-Fi",icon:<WifiIcon/>},{label:"Quiet Zone",icon:<QuietIcon/>},{label:"Cafe Nearby",icon:<CafeIcon/>}].map((a) => (
                <div key={a.label} className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-[12px] font-medium text-[var(--color-text-base)]">{a.icon}{a.label}</div>
              ))}
            </div>
          </div>
        </aside>
      </div>
      </div>

      {/* ── File Preview Modal ── */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(52,44,35,0.24)] backdrop-blur-sm p-4" onClick={() => setPreviewFile(null)}>
          <div className="flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl" style={{ height: "85vh" }} onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-5 py-3.5 shrink-0">
              {renderFileBadge(previewFile, "compact")}
              <div className="flex-1 min-w-0">
                <p className="truncate text-[13px] font-bold">{previewFile.name}</p>
                <p className="text-[11px] text-[var(--color-text-muted)]">Shared by {previewFile.uploader}</p>
              </div>
              <a href={previewFile.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Open tab
              </a>
              <button onClick={() => setPreviewFile(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-red-200 hover:bg-red-50 hover:text-red-500 text-[14px] font-bold">✕</button>
            </div>
            {/* Modal body */}
            <div className="flex-1 overflow-hidden bg-[var(--color-surface)]">
              {previewFile.type === "image" ? (
                <div className="flex h-full items-center justify-center p-6">
                  <img src={previewFile.url} alt={previewFile.name} className="max-h-full max-w-full rounded-xl object-contain shadow-md" />
                </div>
              ) : (
                <iframe src={previewFile.url} title={previewFile.name} className="h-full w-full border-0" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════ ICONS ════════════════════ */
function FlashIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>; }
function GameIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M7 12h.01"/><path d="M17 12h.01"/></svg>; }
function SparkleIcon({ color="currentColor" }: { color?: string }) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75z"/></svg>; }
function EyeIcon() { return <svg width="18" height="13" viewBox="0 0 22 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 7.5C1 7.5 4.5 2 11 2C17.5 2 21 7.5 21 7.5C21 7.5 17.5 13 11 13C4.5 13 1 7.5 1 7.5Z"/><circle cx="11" cy="7.5" r="2.5"/></svg>; }
function ChevronLeftIcon() { return <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6,1 2,6 6,11"/></svg>; }
function ChevronRightIcon() { return <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="2,1 6,6 2,11"/></svg>; }
function PdfIcon({ className = "h-5 w-5" }: { className?: string }) { return <svg viewBox="0 0 16 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}><path d="M9 1H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7L9 1z"/><path d="M9 1v6h6"/></svg>; }
function ImageFileIcon({ className = "h-5 w-5" }: { className?: string }) { return <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}><rect x="1" y="1" width="16" height="16" rx="2"/><circle cx="6" cy="6" r="2"/><path d="M1 13l4-4 3 3 3-3 4 4"/></svg>; }
function FileIcon({ className = "h-5 w-5" }: { className?: string }) { return <svg viewBox="0 0 16 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}><path d="M9 1H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7L9 1z"/><path d="M9 1v6h6"/><line x1="4" y1="13" x2="12" y2="13"/></svg>; }
function PlusIcon() { return <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/></svg>; }
function WhiteboardIcon() { return <svg width="13" height="11" viewBox="0 0 13 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[#D9D9D9]/70"><rect x="0" y="0" width="13" height="9" rx="1"/><line x1="0" y1="4" x2="13" y2="4"/></svg>; }
function WifiIcon() { return <svg width="14" height="10" viewBox="0 0 16 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[#D9D9D9]/70"><path d="M1 4C4 1.5 7 1 8 4C9 1 12 1.5 15 4"/><path d="M3 6.5C5 5 6.5 5 8 6.5C9.5 5 11 5 13 6.5"/><circle cx="8" cy="9" r="1" fill="currentColor"/></svg>; }
function QuietIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-[#D9D9D9]/70"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>; }
function CafeIcon() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[#D9D9D9]/70"><path d="M3 1h6l1 4H2L3 1z"/><path d="M2 5v5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V5"/></svg>; }

export default function SessionPage() {
  return <Suspense><SessionPageInner /></Suspense>;
}
