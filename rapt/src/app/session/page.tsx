"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";

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

type LogicQ = { prompt: string; options: [string,string,string,string]; answer: 0|1|2|3; explain: string };
type PairQ  = { term: string; def: string };
type FillQ  = { sentence: string; answer: string; options: [string,string,string,string] };
type DrillQ = { q: string; a: boolean };
type FixQ   = { scenario: string; issue: string; fix: string };
interface AIGames { logic: LogicQ[]; pairs: PairQ[]; fill: FillQ[]; drill: DrillQ[]; fix: FixQ[]; recommended: GameId[] }

type Tab    = "flash" | "games" | "discussion";
type GameId = "logic" | "match" | "fill" | "speed" | "fix";

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

const GAME_PILLS: { id: GameId; emoji: string; label: string; color: string }[] = [
  { id: "logic", emoji: "🧠", label: "Brain Blast",   color: "from-violet-500 to-purple-700" },
  { id: "match", emoji: "🃏", label: "Flip Match",    color: "from-blue-500 to-cyan-600"     },
  { id: "fill",  emoji: "🎯", label: "Word Sniper",   color: "from-green-500 to-emerald-700" },
  { id: "speed", emoji: "⚡", label: "Lightning Rod", color: "from-amber-400 to-orange-600"  },
  { id: "fix",   emoji: "💣", label: "Myth Buster",   color: "from-red-500 to-rose-700"      },
];

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
export default function SessionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const partnerName = searchParams.get("partner") ?? "Marcus Johnson";
  const course      = searchParams.get("course")  ?? "CS 314";
  const location    = searchParams.get("location") ?? "PCL Library, Room 2.106";
  const duration    = Number(searchParams.get("duration") ?? 60);
  const matchId     = searchParams.get("matchId") ?? null;

  /* ── Tabs ── */
  const [activeTab, setActiveTab] = useState<Tab>("flash");

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

  /* ── Active game ── */
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  /* ── AI-generated game questions ── */
  const [aiGames,        setAiGames]        = useState<AIGames | null>(null);
  const [aiGamesLoading, setAiGamesLoading] = useState(false);
  const [aiGamesError,   setAiGamesError]   = useState("");
  const aiGamesFetched = useRef(false);

  // Logic Trace
  const [ctIdx,   setCtIdx]   = useState(0);
  const [ctPick,  setCtPick]  = useState<number | null>(null);
  const [ctScore, setCtScore] = useState(0);
  const [ctDone,  setCtDone]  = useState(false);

  // Concept Match
  const [matchSel,   setMatchSel]   = useState<{ side: "term"|"def"; idx: number }|null>(null);
  const [matchDone,  setMatchDone]  = useState<Record<number,boolean>>({});
  const [matchWrong, setMatchWrong] = useState<number[]>([]);

  // Fill Blank
  const [fillIdx,   setFillIdx]   = useState(0);
  const [fillPick,  setFillPick]  = useState<string|null>(null);
  const [fillScore, setFillScore] = useState(0);
  const [fillDone,  setFillDone]  = useState(false);

  // Speed Drill
  const [speedIdx,     setSpeedIdx]     = useState(0);
  const [speedScore,   setSpeedScore]   = useState(0);
  const [speedStreak,  setSpeedStreak]  = useState(0);
  const [speedTime,    setSpeedTime]    = useState(30);
  const [speedRunning, setSpeedRunning] = useState(false);
  const [speedDone,    setSpeedDone]    = useState(false);
  const speedTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Fix It
  const [debugIdx,   setDebugIdx]   = useState(0);
  const [debugPick,  setDebugPick]  = useState<number|null>(null);
  const [debugScore, setDebugScore] = useState(0);
  const [debugDone,  setDebugDone]  = useState(false);

  /* ── AI Summary (Groq) ── */
  const [summary,        setSummary]        = useState<AISummary|null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError,   setSummaryError]   = useState("");
  const summaryFetched = useRef(false);

  /* ════════════════════ DB: on mount ════════════════════ */
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

  /* ════════════════════ DB: save game score ════════════════════ */
  const saveGameScore = useCallback(async (game: string, score: number, total: number) => {
    if (!matchId) return;
    const supabase = createClient();
    const { data } = await supabase.from("matches").select("session_resources").eq("id", matchId).single();
    const sr = (data?.session_resources as Record<string,unknown>) ?? {};
    const games = (sr.games as Record<string,unknown>) ?? {};
    await supabase.from("matches").update({ session_resources: { ...sr, games: { ...games, [game]: { score, total, playedAt: new Date().toISOString() } } } }).eq("id", matchId);
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

  /* ════════════════════ Speed drill timer ════════════════════ */
  useEffect(() => {
    if (speedRunning && speedTime > 0) {
      speedTimer.current = setInterval(() => setSpeedTime((t) => t - 1), 1000);
    } else if (speedTime === 0 && speedRunning) {
      setSpeedRunning(false);
      setSpeedDone(true);
      clearInterval(speedTimer.current);
      saveGameScore("speed", speedScore, Math.max(drillPool.length, 1));

    }
    return () => clearInterval(speedTimer.current);
  }, [speedRunning, speedTime, speedScore, saveGameScore]);

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

  /* ════════════════════ Game helpers ════════════════════ */
  /* ── AI fetch function ── */
  const fetchAIGames = useCallback(async () => {
    aiGamesFetched.current = true;
    setAiGamesLoading(true); setAiGamesError("");
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course, notes, partnerName }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: AIGames = await res.json();
      setAiGames(data);
    } catch {
      setAiGamesError("Could not generate AI questions — using session defaults.");
    } finally {
      setAiGamesLoading(false);
    }
  }, [course, notes, partnerName]);

  /* ── Active question pools (AI if loaded, else empty until generated) ── */
  const logicPool = aiGames?.logic ?? [];
  const pairsPool = aiGames?.pairs ?? [];
  const fillPool  = aiGames?.fill  ?? [];
  const drillPool = aiGames?.drill ?? [];
  const fixPool   = aiGames?.fix   ?? [];

  function openGame(id: GameId) {
    setActiveGame(id);
    if (id === "logic") { setCtIdx(0);    setCtPick(null);   setCtScore(0);    setCtDone(false); }
    if (id === "match") { setMatchSel(null); setMatchDone({}); setMatchWrong([]); }
    if (id === "fill")  { setFillIdx(0);  setFillPick(null); setFillScore(0);  setFillDone(false); }
    if (id === "speed") { setSpeedIdx(0); setSpeedScore(0);  setSpeedStreak(0); setSpeedTime(30); setSpeedRunning(false); setSpeedDone(false); }
    if (id === "fix")   { setDebugIdx(0); setDebugPick(null); setDebugScore(0); setDebugDone(false); }
  }

  function pickCT(i: number) {
    if (ctPick !== null) return; setCtPick(i);
    const ok = i === logicPool[ctIdx].answer;
    if (ok) setCtScore((s) => s + 1);
    setTimeout(() => {
      if (ctIdx + 1 >= logicPool.length) { setCtDone(true); saveGameScore("logic", ctScore + (ok?1:0), logicPool.length); }
      else { setCtIdx((n) => n + 1); setCtPick(null); }
    }, 1100);
  }

  function clickMatch(side: "term"|"def", idx: number) {
    if (matchDone[idx]) return;
    if (!matchSel) { setMatchSel({ side, idx }); return; }
    if (matchSel.side === side) { setMatchSel({ side, idx }); return; }
    const termIdx = side === "def" ? matchSel.idx : idx;
    const defIdx  = side === "def" ? idx : matchSel.idx;
    if (termIdx === defIdx) {
      const next = { ...matchDone, [termIdx]: true };
      setMatchDone(next);
      if (Object.keys(next).length === pairsPool.length) saveGameScore("match", pairsPool.length, pairsPool.length);
    } else {
      setMatchWrong([termIdx, defIdx]);
      setTimeout(() => setMatchWrong([]), 700);
    }
    setMatchSel(null);
  }

  function pickFill(opt: string) {
    if (fillPick !== null) return; setFillPick(opt);
    const ok = opt === fillPool[fillIdx].answer;
    if (ok) setFillScore((s) => s + 1);
    setTimeout(() => {
      if (fillIdx + 1 >= fillPool.length) { setFillDone(true); saveGameScore("fill", fillScore+(ok?1:0), fillPool.length); }
      else { setFillIdx((n) => n + 1); setFillPick(null); }
    }, 900);
  }

  function answerSpeed(a: boolean) {
    if (!speedRunning || speedDone) return;
    const correct = a === drillPool[speedIdx % drillPool.length].a;
    if (correct) { setSpeedScore((s) => s + 1); setSpeedStreak((s) => s + 1); }
    else { setSpeedStreak(0); }
    setSpeedIdx((i) => i + 1);
  }

  function pickDebug(i: number) {
    if (debugPick !== null) return; setDebugPick(i);
    const ok = i === 0; // answer is always index 0 (correct option listed first)
    if (ok) setDebugScore((s) => s + 1);
    setTimeout(() => {
      if (debugIdx + 1 >= fixPool.length) { setDebugDone(true); saveGameScore("fix", debugScore+(ok?1:0), fixPool.length); }
      else { setDebugIdx((n) => n + 1); setDebugPick(null); }
    }, 1300);
  }

  const matchAllDone = pairsPool.length > 0 && Object.keys(matchDone).length === pairsPool.length;
  const colorMap: Record<string, string> = { blue: "border-l-[var(--color-primary)]", green: "border-l-green-500", purple: "border-l-violet-500", amber: "border-l-amber-500" };

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Live banner */}
      <div className="flex items-center gap-3 border-b border-green-200 bg-green-600 px-8 py-2.5 text-white">
        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
        <span className="text-[13px] font-bold">Live Session · {course} with {partnerName}</span>
        <span className="ml-auto text-[12px] font-medium text-white/70">{duration} min · {location}</span>
        <button onClick={() => router.push("/sessions")} className="ml-4 flex items-center gap-1.5 rounded-lg border border-white/30 px-3 py-1 text-[12px] font-semibold hover:bg-white/20">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="13" y1="8" x2="3" y2="8"/><polyline points="7,4 3,8 7,12"/></svg>
          Back
        </button>
        <button onClick={handleEndSession} className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1 text-[12px] font-bold text-white hover:bg-red-600">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
          End Session
        </button>
      </div>

      <div className="grid flex-1 overflow-hidden" style={{ gridTemplateColumns: "220px 1fr 268px" }}>

        {/* ── Left sidebar ── */}
        <aside className="flex flex-col border-r border-[var(--color-border)] p-5 overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-[15px] font-extrabold tracking-tight">Study Session</h2>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">{course}</p>
          </div>
          <nav className="mb-5 flex flex-col gap-1">
            {([
              { id: "flash",      label: "Flashcards", icon: <FlashIcon /> },
              { id: "games",      label: "Games",      icon: <GameIcon /> },
              { id: "discussion", label: "AI Summary", icon: <SparkleIcon /> },
            ] as { id: Tab; label: string; icon: React.ReactNode }[]).map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all ${activeTab === item.id ? "bg-[var(--color-primary)] font-semibold text-white" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"}`}>
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
                  className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-white p-2 text-left transition-colors hover:border-[var(--color-primary-muted)] hover:bg-[var(--color-surface)]">
                  <span className="shrink-0">{r.type === "pdf" ? <PdfIcon /> : r.type === "image" ? <ImageFileIcon /> : <FileIcon />}</span>
                  <p className="truncate text-[11px] font-semibold">{r.name}</p>
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
        <main className="flex flex-col overflow-y-auto p-7 gap-5">

          {/* ══ FLASHCARDS ══ */}
          {activeTab === "flash" && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {FLASHCARDS.map((_, i) => (
                    <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${flipped[i] === "know" ? "bg-green-500" : flipped[i] === "review" ? "bg-amber-400" : i === cardIdx % FLASHCARDS.length ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"}`} />
                  ))}
                </div>
                <span className="text-[12px] text-[var(--color-text-muted)]">{knownCount} known · {reviewCount} to review</span>
              </div>
              <div className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-white p-10 shadow-[var(--shadow-md)]">
                <span className="mb-4 rounded-full bg-[var(--color-primary-light)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--color-primary)]">Card {(cardIdx % FLASHCARDS.length) + 1} of {FLASHCARDS.length}</span>
                <p className="mb-6 max-w-lg text-center text-[18px] font-bold leading-snug">{card.q}</p>
                {!revealed ? (
                  <button onClick={() => setRevealed(true)} className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-8 py-3 text-[14px] font-bold text-white shadow-[var(--shadow-primary)] hover:-translate-y-px hover:bg-[var(--color-primary-hover)] transition-all">
                    <EyeIcon /> Reveal Answer
                  </button>
                ) : (
                  <div className="max-w-lg text-center">
                    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">
                      <p className="text-[14px] leading-relaxed">{card.a}</p>
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
              <div className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-md)] overflow-hidden">
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
                    backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, #e2e8f0 31px, #e2e8f0 32px)",
                    backgroundAttachment: "local",
                    backgroundPosition: "0 11px",
                  }}
                />
              </div>

              {/* ── Divider ── */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--color-border)]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">AI Study Games</span>
                <div className="h-px flex-1 bg-[var(--color-border)]" />
              </div>

              {/* ── AI generate bar ── */}
              {!aiGames && (
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-8 text-center">
                  {aiGamesLoading ? (
                    <>
                      <div className="relative">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
                        <span className="absolute inset-0 flex items-center justify-center text-[20px]">🧠</span>
                      </div>
                      <p className="text-[14px] font-bold text-[var(--color-text-base)]">AI is reading your notes…</p>
                      <p className="text-[12px] text-[var(--color-text-muted)]">Generating tailored games for your session</p>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-2 text-[28px]">🧠🃏🎯⚡💣</div>
                      <p className="text-[15px] font-bold">Generate AI-powered games from your notes</p>
                      <p className="text-[12px] text-[var(--color-text-muted)] max-w-xs">
                        Groq reads your session notes and creates questions tailored to exactly what you&apos;re studying
                      </p>
                      {aiGamesError && <p className="rounded-lg bg-red-50 px-3 py-1.5 text-[12px] text-red-600">{aiGamesError}</p>}
                      <button onClick={fetchAIGames} disabled={aiGamesLoading}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 px-7 py-3 text-[14px] font-bold text-white shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
                        ✨ Generate Games with AI
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* ── Games loaded ── */}
              {aiGames && (
                <>
                  {/* Recommended banner */}
                  {aiGames.recommended?.length > 0 && !activeGame && (
                    <div className="flex items-center gap-3 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-3">
                      <span className="text-[16px]">✨</span>
                      <p className="text-[12px] text-violet-800">
                        <strong>AI recommends for this session:</strong>{" "}
                        {aiGames.recommended.map(id => GAME_PILLS.find(g=>g.id===id)?.label).filter(Boolean).join(" and ")}
                      </p>
                      <button onClick={() => { aiGamesFetched.current = false; setAiGames(null); setAiGamesError(""); }}
                        className="ml-auto text-[11px] font-semibold text-violet-500 hover:text-violet-700">↺ Regenerate</button>
                    </div>
                  )}

                  {/* Game pills */}
                  <div className="flex gap-2 flex-wrap items-center">
                    {GAME_PILLS.map((g) => {
                      const isRec = aiGames.recommended?.includes(g.id);
                      return (
                        <button key={g.id} onClick={() => activeGame === g.id ? setActiveGame(null) : openGame(g.id)}
                          className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all hover:-translate-y-px ${activeGame === g.id ? `bg-gradient-to-r ${g.color} text-white shadow-lg border-0` : "border border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"}`}>
                          {isRec && activeGame !== g.id && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-violet-500 border-2 border-white" />}
                          <span>{g.emoji}</span>{g.label}
                        </button>
                      );
                    })}
                    {activeGame && (
                      <button onClick={() => setActiveGame(null)}
                        className="ml-auto flex items-center gap-1 rounded-full border border-[var(--color-border)] px-3 py-2 text-[12px] font-semibold text-[var(--color-text-muted)] hover:border-red-300 hover:text-red-500">
                        ✕ Close
                      </button>
                    )}
                  </div>

                  {/* Game content */}
                  {activeGame && (
                    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-md)]">

                      {/* 🧠 Brain Blast */}
                      {activeGame === "logic" && (
                        <div>
                          <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-6 py-4 flex items-center justify-between">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-widest text-violet-200">🧠 Brain Blast</p>
                              <p className="text-[13px] font-semibold text-white mt-0.5">Reason through each scenario</p>
                            </div>
                            <span className="rounded-full bg-white/20 px-3 py-1 text-[13px] font-bold text-white">{ctScore}/{logicPool.length}</span>
                          </div>
                          <div className="p-6">
                            {ctDone ? <ScoreScreen score={ctScore} total={logicPool.length} onRetry={() => openGame("logic")} /> : logicPool.length === 0 ? <EmptyGame /> : (
                              <>
                                <ProgressBar current={ctIdx} total={logicPool.length} color="violet" />
                                <div className="my-5 rounded-xl bg-gradient-to-br from-gray-900 to-slate-800 px-6 py-5 shadow-inner">
                                  <p className="text-[15px] font-semibold text-violet-200 leading-relaxed">{logicPool[ctIdx].prompt}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  {logicPool[ctIdx].options.map((opt,i) => {
                                    const ok=i===logicPool[ctIdx].answer; const sel=ctPick===i;
                                    return (
                                      <button key={i} onClick={() => pickCT(i)}
                                        className={`rounded-xl border-2 px-4 py-3.5 text-[13px] font-semibold text-left transition-all ${ctPick===null?"border-[var(--color-border)] hover:border-violet-400 hover:bg-violet-50 cursor-pointer":ok?"border-green-400 bg-green-50 text-green-800":sel?"border-red-300 bg-red-50 text-red-700":"border-[var(--color-border)] opacity-35"}`}>
                                        <span className={`mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold ${ctPick===null?"bg-gray-100 text-gray-500":ok?"bg-green-500 text-white":sel?"bg-red-400 text-white":"bg-gray-100 text-gray-400"}`}>{String.fromCharCode(65+i)}</span>
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                                {ctPick!==null && (
                                  <div className={`mt-4 flex items-start gap-3 rounded-xl border px-4 py-3 ${ctPick===logicPool[ctIdx].answer?"border-green-200 bg-green-50":"border-red-200 bg-red-50"}`}>
                                    <span className="text-[18px]">{ctPick===logicPool[ctIdx].answer?"🎉":"💡"}</span>
                                    <p className={`text-[13px] leading-relaxed ${ctPick===logicPool[ctIdx].answer?"text-green-800":"text-red-800"}`}>
                                      {ctPick===logicPool[ctIdx].answer?"Nailed it! ":"Not quite — "}{logicPool[ctIdx].explain}
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 🃏 Flip Match */}
                      {activeGame === "match" && (
                        <div>
                          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-4 flex items-center justify-between">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-100">🃏 Flip Match</p>
                              <p className="text-[13px] font-semibold text-white mt-0.5">Connect each term to its definition</p>
                            </div>
                            <span className="rounded-full bg-white/20 px-3 py-1 text-[13px] font-bold text-white">{Object.keys(matchDone).length}/{pairsPool.length}</span>
                          </div>
                          <div className="p-6">
                            {matchAllDone ? <ScoreScreen score={pairsPool.length} total={pairsPool.length} onRetry={() => openGame("match")} perfect /> : pairsPool.length === 0 ? <EmptyGame /> : (
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-2">
                                  <p className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-blue-500">Terms</p>
                                  {pairsPool.map((p,i)=>{ const done=matchDone[i]; const sel=matchSel?.side==="term"&&matchSel.idx===i; const wrong=matchWrong.includes(i)&&matchSel?.side!=="term";
                                    return <button key={i} onClick={()=>!done&&clickMatch("term",i)}
                                      className={`rounded-xl border-2 px-4 py-3 text-left text-[13px] font-bold transition-all duration-150 ${done?"border-green-400 bg-green-50 text-green-800 cursor-default":sel?"border-blue-500 bg-blue-50 text-blue-800 scale-[1.02] shadow-md":wrong?"border-red-300 bg-red-50":"border-[var(--color-border)] hover:border-blue-400 hover:bg-blue-50 cursor-pointer"}`}>
                                      {p.term}{done&&<span className="ml-1 text-green-500">✓</span>}
                                    </button>;
                                  })}
                                </div>
                                <div className="flex flex-col gap-2">
                                  <p className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-cyan-600">Definitions</p>
                                  {pairsPool.map((p,i)=>{ const done=matchDone[i]; const sel=matchSel?.side==="def"&&matchSel.idx===i; const wrong=matchWrong.includes(i)&&matchSel?.side!=="def";
                                    return <button key={i} onClick={()=>!done&&clickMatch("def",i)}
                                      className={`rounded-xl border-2 px-4 py-3 text-left text-[12px] leading-snug transition-all duration-150 ${done?"border-green-400 bg-green-50 text-green-700 cursor-default":sel?"border-cyan-500 bg-cyan-50 text-cyan-800 scale-[1.02] shadow-md":wrong?"border-red-300 bg-red-50":"border-[var(--color-border)] hover:border-cyan-400 hover:bg-cyan-50 cursor-pointer"}`}>
                                      {p.def}{done&&<span className="ml-1 text-green-500">✓</span>}
                                    </button>;
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 🎯 Word Sniper */}
                      {activeGame === "fill" && (
                        <div>
                          <div className="bg-gradient-to-r from-green-500 to-emerald-700 px-6 py-4 flex items-center justify-between">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-widest text-green-100">🎯 Word Sniper</p>
                              <p className="text-[13px] font-semibold text-white mt-0.5">Lock in the missing word</p>
                            </div>
                            <span className="rounded-full bg-white/20 px-3 py-1 text-[13px] font-bold text-white">{fillScore}/{fillPool.length}</span>
                          </div>
                          <div className="p-6">
                            {fillDone ? <ScoreScreen score={fillScore} total={fillPool.length} onRetry={() => openGame("fill")} /> : fillPool.length === 0 ? <EmptyGame /> : (
                              <>
                                <ProgressBar current={fillIdx} total={fillPool.length} color="green" />
                                <div className="my-5 rounded-xl border-2 border-dashed border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 px-6 py-5 text-center">
                                  <p className="text-[18px] font-bold leading-snug text-gray-800">
                                    {fillPool[fillIdx].sentence.split("___").map((part, i, arr) => (
                                      <span key={i}>{part}{i < arr.length - 1 && (
                                        fillPick
                                          ? <span className={`mx-1 rounded-lg border-2 px-3 py-0.5 font-mono ${fillPick===fillPool[fillIdx].answer?"border-green-400 bg-green-100 text-green-800":"border-red-300 bg-red-100 text-red-700"}`}>{fillPick}</span>
                                          : <span className="mx-1 inline-flex min-w-[80px] justify-center rounded-lg border-2 border-dashed border-green-400 bg-white px-3 py-0.5 text-green-400 font-mono">?</span>
                                      )}</span>
                                    ))}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  {fillPool[fillIdx].options.map((opt) => { const ok=opt===fillPool[fillIdx].answer; const sel=fillPick===opt;
                                    return <button key={opt} onClick={() => pickFill(opt)}
                                      className={`rounded-xl border-2 px-5 py-3 text-[14px] font-bold transition-all ${!fillPick?"border-[var(--color-border)] hover:border-green-400 hover:bg-green-50 cursor-pointer":ok?"border-green-400 bg-green-50 text-green-800":sel?"border-red-300 bg-red-50 text-red-700":"border-[var(--color-border)] opacity-35"}`}>{opt}</button>; })}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ⚡ Lightning Rod */}
                      {activeGame === "speed" && (
                        <div>
                          <div className={`px-6 py-4 flex items-center justify-between transition-colors ${speedTime<=10 && speedRunning?"bg-gradient-to-r from-red-500 to-rose-600":"bg-gradient-to-r from-amber-400 to-orange-600"}`}>
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-100">⚡ Lightning Rod</p>
                              <p className="text-[13px] font-semibold text-white mt-0.5">True or False — as fast as you can</p>
                            </div>
                            <div className="flex items-center gap-3">
                              {speedStreak >= 3 && <span className="rounded-full bg-white/20 px-2 py-0.5 text-[12px] font-bold text-white">🔥 {speedStreak}</span>}
                              <span className="rounded-full bg-white/20 px-3 py-1 text-[13px] font-bold text-white">{speedScore} pts</span>
                            </div>
                          </div>
                          <div className="p-6">
                            {speedDone ? <ScoreScreen score={speedScore} total={speedIdx} onRetry={() => openGame("speed")} /> :
                             !speedRunning && speedTime === 30 ? (
                              <div className="flex flex-col items-center py-8 gap-4">
                                <span className="text-6xl animate-bounce">⚡</span>
                                <p className="text-[17px] font-extrabold text-center">30 seconds. True or False.</p>
                                <p className="text-[12px] text-[var(--color-text-muted)]">{drillPool.length} AI-generated questions from your notes</p>
                                <button onClick={() => setSpeedRunning(true)}
                                  className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-10 py-3.5 text-[15px] font-extrabold text-white shadow-lg hover:-translate-y-0.5 transition-all">
                                  GO ⚡
                                </button>
                              </div>
                             ) : (
                              <>
                                <div className="mb-3 flex items-center justify-between">
                                  <span className={`text-[28px] font-extrabold tabular-nums ${speedTime<=10?"text-red-500":"text-amber-500"}`}>{speedTime}s</span>
                                  <div className="flex flex-col items-end gap-0.5">
                                    <span className="text-[12px] font-bold text-[var(--color-text-muted)]">Q {speedIdx + 1}</span>
                                  </div>
                                </div>
                                <div className="mb-1 h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                                  <div className={`h-2.5 rounded-full transition-all duration-1000 ${speedTime<=10?"bg-red-500":"bg-gradient-to-r from-amber-400 to-orange-500"}`} style={{ width:`${(speedTime/30)*100}%` }} />
                                </div>
                                <div className="my-5 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 px-5 py-6">
                                  <p className="text-center text-[17px] font-bold leading-snug text-gray-800">{drillPool[speedIdx % drillPool.length].q}</p>
                                </div>
                                <div className="flex gap-3">
                                  <button onClick={() => answerSpeed(true)} className="flex-1 rounded-xl bg-green-600 py-5 text-[17px] font-extrabold text-white shadow-[0_6px_20px_rgba(22,163,74,0.35)] hover:bg-green-700 hover:-translate-y-0.5 active:translate-y-0 transition-all">✓ True</button>
                                  <button onClick={() => answerSpeed(false)} className="flex-1 rounded-xl bg-red-500 py-5 text-[17px] font-extrabold text-white shadow-[0_6px_20px_rgba(239,68,68,0.35)] hover:bg-red-600 hover:-translate-y-0.5 active:translate-y-0 transition-all">✗ False</button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 💣 Myth Buster */}
                      {activeGame === "fix" && (
                        <div>
                          <div className="bg-gradient-to-r from-red-500 to-rose-700 px-6 py-4 flex items-center justify-between">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-widest text-red-100">💣 Myth Buster</p>
                              <p className="text-[13px] font-semibold text-white mt-0.5">Spot the flaw — then detonate it</p>
                            </div>
                            <span className="rounded-full bg-white/20 px-3 py-1 text-[13px] font-bold text-white">{debugScore}/{fixPool.length}</span>
                          </div>
                          <div className="p-6">
                            {debugDone ? <ScoreScreen score={debugScore} total={fixPool.length} onRetry={() => openGame("fix")} /> : fixPool.length === 0 ? <EmptyGame /> : (
                              <>
                                <ProgressBar current={debugIdx} total={fixPool.length} color="red" />
                                <div className="my-5 rounded-xl border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-rose-50 px-5 py-5 shadow-sm">
                                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-red-500">⚠ Claim to Evaluate</p>
                                  <p className="text-[15px] font-semibold leading-relaxed text-red-900 whitespace-pre-wrap">{fixPool[debugIdx].scenario}</p>
                                </div>
                                <p className="mb-3 text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wide">What&apos;s wrong with this?</p>
                                {debugPick === null ? (
                                  <div className="flex flex-col gap-2">
                                    <button onClick={() => pickDebug(0)} className="rounded-xl border-2 border-[var(--color-border)] px-4 py-3.5 text-left text-[13px] font-semibold hover:border-red-400 hover:bg-red-50 cursor-pointer transition-all">
                                      💥 {fixPool[debugIdx].issue}
                                    </button>
                                    <button onClick={() => pickDebug(1)} className="rounded-xl border-2 border-[var(--color-border)] px-4 py-3.5 text-left text-[13px] font-semibold hover:border-red-400 hover:bg-red-50 cursor-pointer transition-all">
                                      The reasoning is logically sound
                                    </button>
                                    <button onClick={() => pickDebug(2)} className="rounded-xl border-2 border-[var(--color-border)] px-4 py-3.5 text-left text-[13px] font-semibold hover:border-red-400 hover:bg-red-50 cursor-pointer transition-all">
                                      Only the conclusion is wrong, not the method
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div className={`rounded-xl border-2 px-5 py-4 text-[13px] font-semibold mb-3 flex items-start gap-3 ${debugPick===0?"border-green-400 bg-green-50 text-green-800":"border-red-300 bg-red-50 text-red-700"}`}>
                                      <span className="text-[20px] shrink-0">{debugPick===0?"🎯":"💥"}</span>
                                      <span>{debugPick===0?"Correct! ":"Actually — "}{fixPool[debugIdx].issue}</span>
                                    </div>
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1.5">✅ The Fix</p>
                                      <p className="text-[13px] text-emerald-800 leading-relaxed">{fixPool[debugIdx].fix}</p>
                                    </div>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]">
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
                <div className="grid grid-cols-2 gap-2">
                  {resources.map((r, i) => (
                    <button key={i} onClick={() => setPreviewFile(r)}
                      className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left transition-colors hover:border-[var(--color-primary-muted)] hover:shadow-sm cursor-pointer">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] ${r.type==="pdf"?"bg-red-50":r.type==="image"?"bg-blue-50":"bg-white"}`}>
                        {r.type === "pdf" ? <PdfIcon /> : r.type === "image" ? <ImageFileIcon /> : <FileIcon />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-semibold leading-tight">{r.name}</p>
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
                    <p className="text-[13px] italic leading-relaxed text-[var(--color-text-secondary)]">"{displaySummary.headline}"</p>
                  </div>

                  {/* Core Concepts — 2-col cards */}
                  <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">📌 Core Concepts</p>
                    <div className="grid grid-cols-2 gap-3">
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
        <aside className="border-l border-[var(--color-border)] p-5 overflow-y-auto">
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-[12px] font-bold text-white">
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
                <div key={a.label} className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-[12px] font-medium">{a.icon}{a.label}</div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── File Preview Modal ── */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setPreviewFile(null)}>
          <div className="flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl" style={{ height: "85vh" }} onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-5 py-3.5 shrink-0">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] ${previewFile.type === "pdf" ? "bg-red-50" : previewFile.type === "image" ? "bg-blue-50" : "bg-white"}`}>
                {previewFile.type === "pdf" ? <PdfIcon /> : previewFile.type === "image" ? <ImageFileIcon /> : <FileIcon />}
              </div>
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

/* ════════════════════ SHARED COMPONENTS ════════════════════ */
function ProgressBar({ current, total, color = "primary" }: { current: number; total: number; color?: string }) {
  const activeClass = color === "violet" ? "bg-violet-500" : color === "green" ? "bg-green-500" : color === "red" ? "bg-red-500" : "bg-[var(--color-primary)]";
  const dimClass    = color === "violet" ? "bg-violet-300" : color === "green" ? "bg-green-300" : color === "red" ? "bg-red-300" : "bg-[var(--color-primary)] opacity-40";
  return (
    <div className="flex items-center gap-3 mt-2">
      <div className="flex flex-1 gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < current ? activeClass : i === current ? dimClass : "bg-[var(--color-border)]"}`} />
        ))}
      </div>
      <span className="shrink-0 text-[12px] font-semibold text-[var(--color-text-muted)]">{current+1}/{total}</span>
    </div>
  );
}

function EmptyGame() {
  return (
    <div className="flex flex-col items-center py-10 gap-3">
      <span className="text-4xl">🤖</span>
      <p className="text-[14px] font-bold text-[var(--color-text)]">No questions generated yet</p>
      <p className="text-[12px] text-[var(--color-text-muted)]">Generate AI questions from your notes to play</p>
    </div>
  );
}

function ScoreScreen({ score, total, onRetry, perfect }: { score: number; total: number; onRetry: () => void; perfect?: boolean }) {
  const pct = total > 0 ? Math.round((score/total)*100) : 100;
  return (
    <div className="flex flex-col items-center py-10">
      <div className="mb-3 text-5xl">{perfect||pct===100?"🏆":pct>=70?"🎉":"📚"}</div>
      <p className="text-[22px] font-extrabold">{score} / {total}</p>
      <p className="mt-1 text-[14px] text-[var(--color-text-secondary)]">{pct===100?"Perfect score!":pct>=70?"Great work!":"Keep at it!"}</p>
      <button onClick={onRetry} className="mt-5 rounded-xl bg-[var(--color-primary)] px-7 py-2.5 text-[13px] font-bold text-white shadow-[var(--shadow-primary)] hover:bg-[var(--color-primary-hover)]">Play Again</button>
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
function PdfIcon() { return <svg width="14" height="18" viewBox="0 0 16 20" fill="none" stroke="#6b6b65" strokeWidth="1.8" strokeLinecap="round"><path d="M9 1H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7L9 1z"/><path d="M9 1v6h6"/></svg>; }
function ImageFileIcon() { return <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="#6b6b65" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="1" width="16" height="16" rx="2"/><circle cx="6" cy="6" r="2"/><path d="M1 13l4-4 3 3 3-3 4 4"/></svg>; }
function FileIcon() { return <svg width="14" height="18" viewBox="0 0 16 20" fill="none" stroke="#6b6b65" strokeWidth="1.8" strokeLinecap="round"><path d="M9 1H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7L9 1z"/><path d="M9 1v6h6"/><line x1="4" y1="13" x2="12" y2="13"/></svg>; }
function PlusIcon() { return <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/></svg>; }
function WhiteboardIcon() { return <svg width="13" height="11" viewBox="0 0 13 11" fill="none" stroke="#6b6b65" strokeWidth="1.5" strokeLinecap="round"><rect x="0" y="0" width="13" height="9" rx="1"/><line x1="0" y1="4" x2="13" y2="4"/></svg>; }
function WifiIcon() { return <svg width="14" height="10" viewBox="0 0 16 11" fill="none" stroke="#6b6b65" strokeWidth="1.5" strokeLinecap="round"><path d="M1 4C4 1.5 7 1 8 4C9 1 12 1.5 15 4"/><path d="M3 6.5C5 5 6.5 5 8 6.5C9.5 5 11 5 13 6.5"/><circle cx="8" cy="9" r="1" fill="#6b6b65"/></svg>; }
function QuietIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b6b65" strokeWidth="1.8" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>; }
function CafeIcon() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#6b6b65" strokeWidth="1.5" strokeLinecap="round"><path d="M3 1h6l1 4H2L3 1z"/><path d="M2 5v5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V5"/></svg>; }
