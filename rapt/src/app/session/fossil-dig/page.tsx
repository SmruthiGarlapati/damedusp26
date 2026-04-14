"use client";

import { useGameState } from "./useGameState";
import SetupPanel from "./components/SetupPanel";
import PresenterView from "./components/PresenterView";
import ScribeView from "./components/ScribeView";
import AnalysisLoader from "./components/AnalysisLoader";
import SkeletonReveal from "./components/SkeletonReveal";
import ReDigPanel from "./components/ReDigPanel";
import { FossilDigIcon, StudyGameShell } from "../components/gameChrome";

export default function FossilDigPage() {
  const game = useGameState();
  const { state } = game;

  return (
    <StudyGameShell
      title="Fossil Dig"
      description="One player teaches from memory, the other reconstructs the lesson, and both of you see exactly what knowledge made it across."
      topic={state.topic}
      Icon={FossilDigIcon}
      contentClassName="mx-auto max-w-4xl"
    >
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
    </StudyGameShell>
  );
}
