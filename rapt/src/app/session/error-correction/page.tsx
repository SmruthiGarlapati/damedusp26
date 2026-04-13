"use client";

import { useErrorGameState } from "./useErrorGameState";
import GameView from "./components/GameView";
import SetupPanel from "./components/ErrorGameSetupPanel";
import ResultsView from "./components/ResultsView";

export default function ErrorCorrectionPage() {
  const game = useErrorGameState();
  const { state } = game;

  async function handleGenerate() {
    game.startGenerating();
    try {
      const res = await fetch("/api/error-correction/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: state.topic, notes: state.notes }),
      });
      
      // Safety check: if the API crashes, stop here before trying to parse JSON
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
    <div className="rapt-app-shell min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[rgba(13,28,13,0.9)] shadow-[var(--shadow-lg)] backdrop-blur-sm">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#173417] px-8 py-4">
          <div className="flex items-center gap-3 text-[var(--color-bone)]">
            <span className="text-2xl">📝</span>
            <span className="rapt-display text-xl tracking-tight text-white">Proofreader</span>
            {state.topic && (
              <span className="text-sm font-medium text-[#c8e898]/70">
                · {state.topic}
              </span>
            )}
          </div>
        </div>

        <div className="px-6 py-10">
          
          {/* Replaced the placeholder with the actual SetupPanel! */}
          {state.phase === "SETUP" && (
            <SetupPanel 
              state={state}
              setTopic={game.setTopic}
              setNotes={game.setNotes}
              onStart={handleGenerate}
            />
          )}

          {state.phase === "GENERATING" && (
            <div className="flex flex-col items-center justify-center py-32 gap-6 text-white">
              <span className="text-6xl animate-bounce">🧠</span>
              <p className="text-xl font-bold">AI is reading your notes...</p>
              <p className="text-sm text-[var(--color-text-muted)]">Planting realistic errors for you to find.</p>
            </div>
          )}
          
          {state.phase === "PLAYING" && (
            <GameView 
              state={state} 
              onAddComment={game.addComment} 
              onRemoveComment={game.removeComment} 
              onSubmit={handleGrade} 
            />
          )}

          {state.phase === "ANALYZING" && (
            <div className="flex flex-col items-center justify-center py-32 gap-6 text-white">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
              <p className="text-xl font-bold">Grading your investigation...</p>
            </div>
          )}

          {state.phase === "RESULTS" && (
             <ResultsView state={state} onRetry={game.resetGame} />
          )}
        </div>
      </div>
    </div>
  );
}