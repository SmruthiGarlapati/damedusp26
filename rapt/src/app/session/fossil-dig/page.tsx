"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useGameState } from "./useGameState";
import SetupPanel from "./components/SetupPanel";
import PresenterView from "./components/PresenterView";
import ScribeView from "./components/ScribeView";
import AnalysisLoader from "./components/AnalysisLoader";
import SkeletonReveal from "./components/SkeletonReveal";
import ReDigPanel from "./components/ReDigPanel";
import { FossilDigIcon, StudyGameShell } from "../components/gameChrome";

function FossilDigInner() {
  const searchParams = useSearchParams();
  const partnerName = searchParams.get("partner") ?? "Marcus Johnson";
  const partnerFirst = partnerName.split(" ")[0];
  const initialRole = partnerFirst === "Tani" ? "scribe" : "presenter";
  const game = useGameState(initialRole);
  const { state } = game;

  return (
    <StudyGameShell
      title="Fossil Dig"
      description={`You and ${partnerFirst} take turns teaching and recalling — then see exactly what knowledge made it across.`}
      topic={state.topic}
      Icon={FossilDigIcon}
      contentClassName="mx-auto max-w-4xl"
    >
        {state.phase === "SETUP" && (
          <SetupPanel
            state={state}
            partnerName={partnerName}
            setRole={game.setRole}
            setTopic={game.setTopic}
            setPresenterNotes={game.setPresenterNotes}
            setPresentationMinutes={game.setPresentationMinutes}
            onStart={game.startPresenting}
          />
        )}
        {state.phase === "PRESENTING" && (
          <PresenterView state={state} partnerName={partnerName} onDone={game.startRecalling}/>
        )}
        {state.phase === "RECALLING" && (
          <ScribeView
            state={state}
            partnerName={partnerName}
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
        {state.phase === "ANALYZING" && <AnalysisLoader partnerName={partnerName} role={state.role} />}
        {(state.phase === "REVEALING" || state.phase === "REDIG" || state.phase === "COMPLETE") && (
          <SkeletonReveal
            state={state}
            partnerName={partnerName}
            onStartReDig={game.startReDig}
            onSkipReDig={game.skipReDig}
            onReset={game.resetGame}
          />
        )}
        {state.phase === "REDIG" && (
          <ReDigPanel
            state={state}
            partnerName={partnerName}
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

export default function FossilDigPage() {
  return <Suspense><FossilDigInner /></Suspense>;
}
