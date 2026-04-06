"use client";

import { useGameState } from "./useGameState";
import SetupPanel from "./components/SetupPanel";
import PresenterView from "./components/PresenterView";
import ScribeView from "./components/ScribeView";
import AnalysisLoader from "./components/AnalysisLoader";
import SkeletonReveal from "./components/SkeletonReveal";
import ReDigPanel from "./components/ReDigPanel";

export default function FossilDigPage() {
  const game = useGameState();
  const { state } = game;

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <div className="border-b border-[#e8e0d4] bg-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🦕</span>
          <span className="font-black text-xl tracking-tight text-[#1a1a18]">
            Fossil Dig
          </span>
          {state.topic && (
            <span className="text-sm text-[#9b9b95] font-medium">
              · {state.topic}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {["SETUP","PRESENTING","RECALLING","ANALYZING","REVEALING"].map((phase, i) => (
            <div key={phase} className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full transition-all ${
                state.phase === phase
                  ? "bg-[#c4622d] scale-125"
                  : ["REDIG","COMPLETE"].includes(state.phase) ||
                    ["SETUP","PRESENTING","RECALLING","ANALYZING","REVEALING"].indexOf(state.phase) > i
                  ? "bg-[#c4622d] opacity-40"
                  : "bg-[#e8e0d4]"
              }`}/>
              {i < 4 && <div className="h-px w-4 bg-[#e8e0d4]"/>}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {state.phase === "SETUP" && (
          <SetupPanel
            state={state}
            setRole={game.setRole}
            setTopic={game.setTopic}
            setPresenterNotes={game.setPresenterNotes}
            setPresentationMinutes={game.setPresentationMinutes}
            onStart={game.startPresenting}
          />
        )}
        {state.phase === "PRESENTING" && (
          <PresenterView state={state} onDone={game.startRecalling}/>
        )}
        {state.phase === "RECALLING" && (
          <ScribeView
            state={state}
            setScribeRecall={game.setScribeRecall}
            onSubmit={async () => {
              game.startAnalyzing();
              try {
                const res = await fetch("/api/fossil-dig/analyze", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    presenterNotes: state.presenterNotes,
                    scribeRecall: state.scribeRecall,
                    topic: state.topic,
                    presentationMinutes: state.presentationMinutes,
                  }),
                });
                const data = await res.json();
                game.setAnalysis(data);
              } catch (e) {
                console.error(e);
              }
            }}
          />
        )}
        {state.phase === "ANALYZING" && <AnalysisLoader/>}
        {(state.phase === "REVEALING" || state.phase === "REDIG" || state.phase === "COMPLETE") && (
          <SkeletonReveal
            state={state}
            onStartReDig={game.startReDig}
            onSkipReDig={game.skipReDig}
            onReset={game.resetGame}
          />
        )}
        {state.phase === "REDIG" && (
          <ReDigPanel
            state={state}
            setReDigRecall={game.setReDigRecall}
            onSubmit={async () => {
              try {
                const res = await fetch("/api/fossil-dig/analyze", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    presenterNotes: state.presenterNotes,
                    scribeRecall: state.reDigRecall,
                    topic: state.topic,
                    presentationMinutes: state.presentationMinutes,
                  }),
                });
                const data = await res.json();
                game.setReDigAnalysis(data);
              } catch (e) {
                console.error(e);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
