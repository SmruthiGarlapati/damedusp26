"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useErrorGameState } from "./useErrorGameState";
import GameView from "./components/GameView";
import SetupPanel from "./components/ErrorGameSetupPanel";
import ResultsView from "./components/ResultsView";
import { ProofreaderIcon, StudyGameShell } from "../components/gameChrome";

function ErrorCorrectionInner() {
  const game = useErrorGameState();
  const { state } = game;
  const searchParams = useSearchParams();
  const partnerName = searchParams.get("partner") ?? "Marcus Johnson";

  async function handleGenerate() {
    game.startGenerating();
    try {
      const res = await fetch("/api/error-correction/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: state.topic, notes: state.notes }),
      });

      if (!res.ok) {
        console.error("API Error:", await res.text());
        alert("Failed to generate game. Check the console or your API keys.");
        game.resetGame();
        return;
      }

      const data = await res.json();
      game.setGameData(data.sentences, data.totalErrors);
    } catch (e) {
      console.error(e);
      game.resetGame();
    }
  }

  async function handleGrade() {
    game.startAnalyzing();
    try {
      const res = await fetch("/api/error-correction/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sentences: state.sentences,
          userComments: state.userComments,
          totalErrors: state.totalErrors,
        }),
      });

      if (!res.ok) {
        console.error("API Error:", await res.text());
        alert("Failed to grade game.");
        return;
      }

      const data = await res.json();
      game.setResults(data);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <StudyGameShell
      title="Proofreader"
      description={`You and ${partnerName.split(" ")[0]} each investigate the same passage independently — then compare what each of you caught.`}
      topic={state.topic}
      Icon={ProofreaderIcon}
      contentClassName="mx-auto max-w-6xl"
    >
      {state.phase === "SETUP" && (
        <SetupPanel
          state={state}
          setTopic={game.setTopic}
          setNotes={game.setNotes}
          onStart={handleGenerate}
        />
      )}

      {state.phase === "GENERATING" && (
        <div className="flex flex-col items-center justify-center gap-6 py-28 text-center text-white">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-[var(--color-primary-muted)] bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-[var(--shadow-primary)]">
            <ProofreaderIcon className="h-10 w-10 animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="rapt-display text-3xl tracking-tight text-white">Building your proofreader round</p>
            <p className="text-sm text-[var(--color-text-muted)]">Rewriting the passage with realistic mistakes for both of you to investigate.</p>
          </div>
        </div>
      )}

      {state.phase === "PLAYING" && (
        <GameView
          state={state}
          partnerName={partnerName}
          onAddComment={game.addComment}
          onRemoveComment={game.removeComment}
          onSubmit={handleGrade}
        />
      )}

      {state.phase === "ANALYZING" && (
        <div className="flex flex-col items-center justify-center gap-6 py-28 text-center text-white">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-[var(--color-primary-muted)] bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-[var(--shadow-primary)]">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-current border-t-transparent" />
          </div>
          <div className="space-y-2">
            <p className="rapt-display text-3xl tracking-tight text-white">Reviewing your flags</p>
            <p className="text-sm text-[var(--color-text-muted)]">Grading each note and generating clean explanations for the misses.</p>
          </div>
        </div>
      )}

      {state.phase === "RESULTS" && (
        <ResultsView state={state} partnerName={partnerName} onRetry={game.resetGame} />
      )}
    </StudyGameShell>
  );
}

export default function ErrorCorrectionPage() {
  return <Suspense><ErrorCorrectionInner /></Suspense>;
}
