"use client";

import type { ComponentType } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RefreshIcon, StudyGameShell, withSessionQuery } from "./gameChrome";

type IconProps = { className?: string };
type IconComponent = ComponentType<IconProps>;

export type GeneratedGameId = "logic" | "match" | "fill" | "speed";
type LogicQ = { prompt: string; options: [string, string, string, string]; answer: 0 | 1 | 2 | 3; explain: string };
type PairQ = { term: string; def: string };
type FillQ = { sentence: string; answer: string; options: [string, string, string, string] };
type DrillQ = { q: string; a: boolean };
type FixQ = { scenario: string; issue: string; fix: string };
type RecommendedGameId = GeneratedGameId | "fix";
type AIGames = { logic: LogicQ[]; pairs: PairQ[]; fill: FillQ[]; drill: DrillQ[]; fix: FixQ[]; recommended: RecommendedGameId[] };

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

const DEMO_AI_GAMES: AIGames = {
  recommended: ["logic", "match"],
  logic: [
    {
      prompt: "A student inserts sorted values into a binary search tree and notices search gets slower every time. What actually happened?",
      options: [
        "The tree became skewed, so search degraded toward O(n)",
        "The tree automatically rebalanced into O(log n)",
        "Linked lists replaced the tree nodes in memory",
        "In-order traversal was caching the search path",
      ],
      answer: 0,
      explain: "Sorted insertion can create a one-sided BST. Once the tree is skewed, search behaves much more like walking a linked list.",
    },
    {
      prompt: "You need to remove a node quickly when you already have a direct pointer to it. Which structure gives the cleanest O(1) path?",
      options: [
        "A doubly linked list, because each node also tracks its previous node",
        "A singly linked list, because head access makes all deletions O(1)",
        "Any binary tree, because children always point back to their parent",
        "An array, because index deletion never shifts elements",
      ],
      answer: 0,
      explain: "With both `next` and `prev`, a doubly linked list can reconnect neighbors immediately if you already hold the node reference.",
    },
    {
      prompt: "A classmate claims linked lists are ideal when you need frequent random access by position. What is the best rebuttal?",
      options: [
        "Random access is still O(n) because you have to traverse from the head",
        "Random access becomes O(1) after the first lookup",
        "Linked lists store indexes inside every node",
        "Pointers make position lookup faster than arrays",
      ],
      answer: 0,
      explain: "Linked lists trade contiguous storage for flexible inserts, but position lookup still requires walking node by node.",
    },
    {
      prompt: "Why does an in-order traversal matter so much for BSTs in this session?",
      options: [
        "Because it visits values in sorted order when the BST property holds",
        "Because it always checks the root twice for accuracy",
        "Because it skips every leaf and only compares parents",
        "Because it turns the tree into a linked list in memory",
      ],
      answer: 0,
      explain: "In-order means left, root, right. On a valid BST, that yields values in ascending order.",
    },
  ],
  pairs: [
    { term: "Singly Linked List", def: "A node chain with only a next pointer, so position lookup is O(n)." },
    { term: "Binary Search Tree", def: "A tree where smaller values go left and larger values go right." },
    { term: "In-order Traversal", def: "Visits left subtree, then root, then right subtree." },
    { term: "Doubly Linked List", def: "Stores both next and previous pointers for easier local deletion." },
    { term: "Skewed Tree", def: "A tree that has effectively collapsed into a one-sided chain." },
  ],
  fill: [
    {
      sentence: "Searching for a value in a linked list is ___ because each node may need to be visited in sequence.",
      answer: "O(n)",
      options: ["O(n)", "O(1)", "O(log n)", "O(n log n)"],
    },
    {
      sentence: "In a BST, an ___ traversal returns values in sorted order.",
      answer: "in-order",
      options: ["in-order", "post-order", "level-order", "reverse-order"],
    },
    {
      sentence: "When a BST receives already sorted insertions, it can become ___ and lose its average-case speed.",
      answer: "skewed",
      options: ["skewed", "hashed", "cyclic", "balanced"],
    },
    {
      sentence: "A doubly linked list adds a ___ pointer so a node can move backward as well as forward.",
      answer: "prev",
      options: ["prev", "root", "depth", "index"],
    },
  ],
  drill: [
    { q: "A linked list supports O(1) random access by index.", a: false },
    { q: "A balanced BST usually gives O(log n) search.", a: true },
    { q: "In-order traversal on a BST produces sorted output.", a: true },
    { q: "A doubly linked list removes the need for a next pointer.", a: false },
    { q: "Sorted insertions can make a BST behave like a linear chain.", a: true },
    { q: "Deleting from the head of a linked list is always O(n).", a: false },
    { q: "A skewed BST can degrade search complexity to O(n).", a: true },
    { q: "Post-order traversal always returns BST values in ascending order.", a: false },
  ],
  fix: [
    {
      scenario: "“Because a tree has branches, searching a BST is always O(log n) no matter what order you insert values.”",
      issue: "That ignores skewed trees. Insert order can destroy the balanced shape that makes logarithmic search possible.",
      fix: "BSTs are only O(log n) on average when the tree stays reasonably balanced. In the worst case, search degrades to O(n).",
    },
    {
      scenario: "“A doubly linked list is just a singly linked list with extra storage, so deletion complexity stays the same in every case.”",
      issue: "The previous pointer changes local deletion dramatically when you already hold the node you want to remove.",
      fix: "A doubly linked list still has O(n) search, but given a direct node reference it can reconnect neighbors in O(1).",
    },
    {
      scenario: "“If in-order traversal gives sorted output, then any traversal on a BST must also preserve sorting somehow.”",
      issue: "Traversal order matters. Pre-order and post-order visit nodes in very different sequences.",
      fix: "Only in-order traversal guarantees ascending output on a BST because it processes left subtree, root, then right subtree.",
    },
  ],
};

const GAME_PANEL = "overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] shadow-[var(--shadow-md)]";
const GAME_HEADER = "flex items-center justify-between border-b border-[var(--color-border)] bg-[rgba(255,255,255,0.04)] px-6 py-4";
const GAME_EYEBROW = "text-[11px] font-bold uppercase tracking-widest text-[var(--color-primary)]";
const GAME_SUBTITLE = "mt-0.5 text-[13px] font-semibold text-[var(--color-text-base)]";
const GAME_BADGE = "rounded-full border border-[var(--color-primary-muted)] bg-[var(--color-primary-light)] px-3 py-1 text-[13px] font-bold text-[var(--color-primary)]";

interface GeneratedGamePageProps {
  gameId: GeneratedGameId;
  title: string;
  description: string;
  Icon: IconComponent;
}

export function GeneratedGamePage({ gameId, title, description, Icon }: GeneratedGamePageProps) {
  const searchParams = useSearchParams();
  const course = searchParams.get("course") ?? "CS 314";
  const partnerName = searchParams.get("partner") ?? "Marcus Johnson";
  const matchId = searchParams.get("matchId");
  const fallbackHref = withSessionQuery("/session", searchParams, { tab: "games" });
  const { games, loading, warning, refresh } = useGeneratedSessionGames({ course, partnerName, matchId });

  return (
    <StudyGameShell
      title={title}
      description={description}
      topic={course}
      Icon={Icon}
      fallbackHref={fallbackHref}
      contentClassName="mx-auto max-w-4xl"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">
            Built from your latest {course} notes with {partnerName.split(" ")[0]}.
          </p>
          <button
            type="button"
            onClick={() => {
              void refresh();
            }}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-2 text-[12px] font-semibold text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-primary-muted)] hover:text-white"
          >
            <RefreshIcon className="h-4 w-4" />
            Refresh questions
          </button>
        </div>

        {warning ? (
          <div className="rounded-2xl border border-amber-200/30 bg-amber-100/10 px-4 py-3 text-[12px] text-amber-100">
            {warning}
          </div>
        ) : null}

        {loading || !games ? (
          <GeneratedGameLoading title={title} />
        ) : (
          <GeneratedGameBoard gameId={gameId} games={games} />
        )}
      </div>
    </StudyGameShell>
  );
}

function useGeneratedSessionGames({
  course,
  partnerName,
  matchId,
}: {
  course: string;
  partnerName: string;
  matchId: string | null;
}) {
  const [games, setGames] = useState<AIGames | null>(null);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setWarning("");

    let notes = DEMO_NOTES;

    if (matchId) {
      try {
        const supabase = createClient();
        const { data } = await supabase.from("matches").select("notes").eq("id", matchId).single();
        if (typeof data?.notes === "string" && data.notes.trim()) {
          notes = data.notes;
        }
      } catch (error) {
        console.error("Failed to load session notes for generated game:", error);
      }
    }

    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course, notes, partnerName }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data: AIGames = await res.json();
      setGames(data);
    } catch (error) {
      console.error("Generated game page error:", error);
      setWarning("Using demo questions while AI game generation warms up.");
      setGames(DEMO_AI_GAMES);
    } finally {
      setLoading(false);
    }
  }, [course, matchId, partnerName]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { games, loading, warning, refresh };
}

function GeneratedGameBoard({ gameId, games }: { gameId: GeneratedGameId; games: AIGames }) {
  if (gameId === "logic") {
    return <BrainBlastGame pool={games.logic} />;
  }

  if (gameId === "match") {
    return <FlipMatchGame pool={games.pairs} />;
  }

  if (gameId === "fill") {
    return <WordSniperGame pool={games.fill} />;
  }

  return <LightningRodGame pool={games.drill} />;
}

function BrainBlastGame({ pool }: { pool: LogicQ[] }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setQuestionIndex(0);
    setSelectedIndex(null);
    setScore(0);
    setDone(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  if (pool.length === 0) {
    return <EmptyGame />;
  }

  const question = pool[questionIndex];

  function pickOption(index: number) {
    if (selectedIndex !== null) return;

    setSelectedIndex(index);
    const correct = index === question.answer;
    if (correct) {
      setScore((current) => current + 1);
    }

    timeoutRef.current = setTimeout(() => {
      if (questionIndex + 1 >= pool.length) {
        setDone(true);
      } else {
        setQuestionIndex((current) => current + 1);
        setSelectedIndex(null);
      }
    }, 1100);
  }

  if (done) {
    return <ScoreScreen score={score} total={pool.length} onRetry={reset} />;
  }

  return (
    <div className={GAME_PANEL}>
      <div className={GAME_HEADER}>
        <div>
          <p className={GAME_EYEBROW}>Brain Blast</p>
          <p className={GAME_SUBTITLE}>Reason through each scenario.</p>
        </div>
        <span className={GAME_BADGE}>{score}/{pool.length}</span>
      </div>
      <div className="p-6">
        <ProgressBar current={questionIndex} total={pool.length} />
        <div className="my-5 rounded-xl border border-white/10 bg-[rgba(0,0,0,0.2)] px-6 py-5 shadow-inner">
          <p className="text-[15px] font-semibold leading-relaxed text-[var(--color-text-base)]">{question.prompt}</p>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {question.options.map((option, index) => {
            const correct = index === question.answer;
            const selected = selectedIndex === index;
            return (
              <button
                key={option}
                type="button"
                onClick={() => pickOption(index)}
                className={`rounded-xl border-2 px-4 py-3.5 text-left text-[13px] font-semibold transition-all ${
                  selectedIndex === null
                    ? "cursor-pointer border-white/10 bg-white/5 text-[var(--color-text-base)] hover:border-[var(--color-primary-muted)] hover:bg-white/8"
                    : correct
                      ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                      : selected
                        ? "border-red-400/40 bg-red-500/10 text-red-100"
                        : "border-white/10 opacity-35"
                }`}
              >
                <span
                  className={`mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold ${
                    selectedIndex === null
                      ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                      : correct
                        ? "bg-emerald-400 text-[#092313]"
                        : selected
                          ? "bg-red-400 text-[#230909]"
                          : "bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.55)]"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </button>
            );
          })}
        </div>
        {selectedIndex !== null ? (
          <div className={`mt-4 flex items-start gap-3 rounded-xl border px-4 py-3 ${selectedIndex === question.answer ? "border-emerald-400/40 bg-emerald-500/10" : "border-red-400/40 bg-red-500/10"}`}>
            <span className="text-[18px]">{selectedIndex === question.answer ? "🎉" : "💡"}</span>
            <p className={`text-[13px] leading-relaxed ${selectedIndex === question.answer ? "text-emerald-100" : "text-red-100"}`}>
              {selectedIndex === question.answer ? "Nailed it! " : "Not quite — "}
              {question.explain}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FlipMatchGame({ pool }: { pool: PairQ[] }) {
  const [selectedCard, setSelectedCard] = useState<{ side: "term" | "def"; index: number } | null>(null);
  const [matched, setMatched] = useState<Record<number, boolean>>({});
  const [wrongFlash, setWrongFlash] = useState<number[]>([]);

  const reset = useCallback(() => {
    setSelectedCard(null);
    setMatched({});
    setWrongFlash([]);
  }, []);

  if (pool.length === 0) {
    return <EmptyGame />;
  }

  const allDone = Object.keys(matched).length === pool.length;

  function clickCard(side: "term" | "def", index: number) {
    if (matched[index]) return;
    if (!selectedCard) {
      setSelectedCard({ side, index });
      return;
    }

    if (selectedCard.side === side) {
      setSelectedCard({ side, index });
      return;
    }

    const termIndex = side === "def" ? selectedCard.index : index;
    const defIndex = side === "def" ? index : selectedCard.index;

    if (termIndex === defIndex) {
      setMatched((current) => ({ ...current, [termIndex]: true }));
    } else {
      setWrongFlash([termIndex, defIndex]);
      setTimeout(() => setWrongFlash([]), 700);
    }

    setSelectedCard(null);
  }

  if (allDone) {
    return <ScoreScreen score={pool.length} total={pool.length} onRetry={reset} perfect />;
  }

  return (
    <div className={GAME_PANEL}>
      <div className={GAME_HEADER}>
        <div>
          <p className={GAME_EYEBROW}>Flip Match</p>
          <p className={GAME_SUBTITLE}>Connect each term to its definition.</p>
        </div>
        <span className={GAME_BADGE}>{Object.keys(matched).length}/{pool.length}</span>
      </div>
      <div className="grid gap-3 p-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-primary)]">Terms</p>
          {pool.map((item, index) => {
            const done = matched[index];
            const selected = selectedCard?.side === "term" && selectedCard.index === index;
            const wrong = wrongFlash.includes(index) && selectedCard?.side !== "term";
            return (
              <button
                key={item.term}
                type="button"
                onClick={() => !done && clickCard("term", index)}
                className={`rounded-xl border-2 px-4 py-3 text-left text-[13px] font-bold transition-all duration-150 ${
                  done
                    ? "cursor-default border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                    : selected
                      ? "scale-[1.02] border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-text-base)] shadow-md"
                      : wrong
                        ? "border-red-400/40 bg-red-500/10 text-red-100"
                        : "cursor-pointer border-white/10 bg-white/5 text-[var(--color-text-base)] hover:border-[var(--color-primary-muted)] hover:bg-white/8"
                }`}
              >
                {item.term}
                {done ? <span className="ml-1 text-emerald-300">✓</span> : null}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-primary)]">Definitions</p>
          {pool.map((item, index) => {
            const done = matched[index];
            const selected = selectedCard?.side === "def" && selectedCard.index === index;
            const wrong = wrongFlash.includes(index) && selectedCard?.side !== "def";
            return (
              <button
                key={`${item.term}-def`}
                type="button"
                onClick={() => !done && clickCard("def", index)}
                className={`rounded-xl border-2 px-4 py-3 text-left text-[12px] leading-snug transition-all duration-150 ${
                  done
                    ? "cursor-default border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                    : selected
                      ? "scale-[1.02] border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-text-base)] shadow-md"
                      : wrong
                        ? "border-red-400/40 bg-red-500/10 text-red-100"
                        : "cursor-pointer border-white/10 bg-white/5 text-[var(--color-text-secondary)] hover:border-[var(--color-primary-muted)] hover:bg-white/8"
                }`}
              >
                {item.def}
                {done ? <span className="ml-1 text-emerald-300">✓</span> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WordSniperGame({ pool }: { pool: FillQ[] }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setDone(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  if (pool.length === 0) {
    return <EmptyGame />;
  }

  const question = pool[questionIndex];

  function pickOption(option: string) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(option);
    const correct = option === question.answer;
    if (correct) {
      setScore((current) => current + 1);
    }

    timeoutRef.current = setTimeout(() => {
      if (questionIndex + 1 >= pool.length) {
        setDone(true);
      } else {
        setQuestionIndex((current) => current + 1);
        setSelectedAnswer(null);
      }
    }, 900);
  }

  if (done) {
    return <ScoreScreen score={score} total={pool.length} onRetry={reset} />;
  }

  return (
    <div className={GAME_PANEL}>
      <div className={GAME_HEADER}>
        <div>
          <p className={GAME_EYEBROW}>Word Sniper</p>
          <p className={GAME_SUBTITLE}>Lock in the missing word.</p>
        </div>
        <span className={GAME_BADGE}>{score}/{pool.length}</span>
      </div>
      <div className="p-6">
        <ProgressBar current={questionIndex} total={pool.length} />
        <div className="my-5 rounded-xl border-2 border-dashed border-[var(--color-primary-muted)] bg-[rgba(255,255,255,0.04)] px-6 py-5 text-center">
          <p className="text-[18px] font-bold leading-snug text-[var(--color-text-base)]">
            {question.sentence.split("___").map((part, index, allParts) => (
              <span key={`${part}-${index}`}>
                {part}
                {index < allParts.length - 1 ? (
                  selectedAnswer ? (
                    <span className={`mx-1 rounded-lg border-2 px-3 py-0.5 font-mono ${selectedAnswer === question.answer ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100" : "border-red-400/40 bg-red-500/10 text-red-100"}`}>
                      {selectedAnswer}
                    </span>
                  ) : (
                    <span className="mx-1 inline-flex min-w-[80px] justify-center rounded-lg border-2 border-dashed border-[var(--color-primary-muted)] bg-[rgba(0,0,0,0.18)] px-3 py-0.5 font-mono text-[var(--color-primary)]">
                      ?
                    </span>
                  )
                ) : null}
              </span>
            ))}
          </p>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {question.options.map((option) => {
            const correct = option === question.answer;
            const selected = selectedAnswer === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => pickOption(option)}
                className={`rounded-xl border-2 px-5 py-3 text-[14px] font-bold transition-all ${
                  !selectedAnswer
                    ? "cursor-pointer border-white/10 bg-white/5 text-[var(--color-text-base)] hover:border-[var(--color-primary-muted)] hover:bg-white/8"
                    : correct
                      ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                      : selected
                        ? "border-red-400/40 bg-red-500/10 text-red-100"
                        : "border-white/10 opacity-35"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LightningRodGame({ pool }: { pool: DrillQ[] }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const reset = useCallback(() => {
    setQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    setRunning(false);
    setDone(false);
  }, []);

  useEffect(() => {
    if (!running || done) return;
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          clearInterval(timer);
          setRunning(false);
          setDone(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [done, running]);

  if (pool.length === 0) {
    return <EmptyGame />;
  }

  function answer(value: boolean) {
    if (!running || done) return;
    const currentQuestion = pool[questionIndex % pool.length];
    const correct = value === currentQuestion.a;
    if (correct) {
      setScore((current) => current + 1);
      setStreak((current) => current + 1);
    } else {
      setStreak(0);
    }
    setQuestionIndex((current) => current + 1);
  }

  if (done) {
    return <ScoreScreen score={score} total={questionIndex} onRetry={reset} />;
  }

  return (
    <div className={GAME_PANEL}>
      <div className={GAME_HEADER}>
        <div>
          <p className={GAME_EYEBROW}>Lightning Rod</p>
          <p className={GAME_SUBTITLE}>True or False. Move fast.</p>
        </div>
        <div className="flex items-center gap-3">
          {streak >= 3 ? <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[12px] font-bold text-amber-100">🔥 {streak}</span> : null}
          <span className={GAME_BADGE}>{score} pts</span>
        </div>
      </div>
      <div className="p-6">
        {!running && timeLeft === 30 ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <span className="text-6xl">⚡</span>
            <p className="text-[17px] font-extrabold text-[var(--color-text-base)]">30 seconds. True or False.</p>
            <p className="text-[12px] text-[var(--color-text-muted)]">{pool.length} AI-generated prompts from your notes.</p>
            <button
              type="button"
              onClick={() => setRunning(true)}
              className="rounded-xl bg-[var(--color-primary)] px-10 py-3.5 text-[15px] font-extrabold text-white shadow-[var(--shadow-primary)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-primary-hover)]"
            >
              Go
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <span className={`text-[28px] font-extrabold tabular-nums ${timeLeft <= 10 ? "text-red-300" : "text-[var(--color-primary)]"}`}>{timeLeft}s</span>
              <span className="text-[12px] font-bold text-[var(--color-text-muted)]">Q {questionIndex + 1}</span>
            </div>
            <div className="mb-1 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className={`h-2.5 rounded-full transition-all duration-1000 ${timeLeft <= 10 ? "bg-red-400" : "bg-[var(--color-primary)]"}`} style={{ width: `${(timeLeft / 30) * 100}%` }} />
            </div>
            <div className="my-5 rounded-xl border border-white/10 bg-[rgba(0,0,0,0.2)] px-5 py-6">
              <p className="text-center text-[17px] font-bold leading-snug text-[var(--color-text-base)]">{pool[questionIndex % pool.length].q}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => answer(true)}
                className="flex-1 rounded-xl bg-green-600 py-5 text-[17px] font-extrabold text-white shadow-[0_6px_20px_rgba(22,163,74,0.35)] transition-all hover:-translate-y-0.5 hover:bg-green-700 active:translate-y-0"
              >
                ✓ True
              </button>
              <button
                type="button"
                onClick={() => answer(false)}
                className="flex-1 rounded-xl bg-red-500 py-5 text-[17px] font-extrabold text-white shadow-[0_6px_20px_rgba(239,68,68,0.35)] transition-all hover:-translate-y-0.5 hover:bg-red-600 active:translate-y-0"
              >
                ✗ False
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GeneratedGameLoading({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-6 py-20 text-center text-white shadow-[var(--shadow-md)]">
      <div className="h-14 w-14 animate-spin rounded-full border-[3px] border-[var(--color-primary)] border-t-transparent" />
      <div className="space-y-2">
        <p className="rapt-display text-3xl tracking-tight text-white">Building {title}</p>
        <p className="text-sm text-[var(--color-text-muted)]">Pulling your session notes into a fresh round now.</p>
      </div>
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="mt-2 flex items-center gap-3">
      <div className="flex flex-1 gap-1">
        {Array.from({ length: total }).map((_, index) => (
          <div key={index} className={`h-1.5 flex-1 rounded-full ${index < current ? "bg-[var(--color-primary)]" : index === current ? "bg-[var(--color-primary)] opacity-45" : "bg-white/10"}`} />
        ))}
      </div>
      <span className="shrink-0 text-[12px] font-semibold text-[var(--color-text-muted)]">{current + 1}/{total}</span>
    </div>
  );
}

function EmptyGame() {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <span className="text-4xl">🤖</span>
      <p className="text-[14px] font-bold text-[var(--color-text-base)]">No questions generated yet.</p>
      <p className="text-[12px] text-[var(--color-text-muted)]">Refresh the page to pull a fresh round from your notes.</p>
    </div>
  );
}

function ScoreScreen({ score, total, onRetry, perfect }: { score: number; total: number; onRetry: () => void; perfect?: boolean }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 100;
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <div className="mb-3 text-5xl">{perfect || pct === 100 ? "🏆" : pct >= 70 ? "🎉" : "📚"}</div>
      <p className="text-[22px] font-extrabold text-[var(--color-text-base)]">{score} / {total}</p>
      <p className="mt-1 text-[14px] text-[var(--color-text-secondary)]">{pct === 100 ? "Perfect score!" : pct >= 70 ? "Great work!" : "Keep at it!"}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-xl bg-[var(--color-primary)] px-7 py-2.5 text-[13px] font-bold text-white shadow-[var(--shadow-primary)] hover:bg-[var(--color-primary-hover)]"
      >
        Play Again
      </button>
    </div>
  );
}
