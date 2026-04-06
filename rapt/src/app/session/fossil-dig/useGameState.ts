"use client";

import { useState } from "react";

export type GamePhase =
  | "SETUP"
  | "PRESENTING"
  | "RECALLING"
  | "ANALYZING"
  | "REVEALING"
  | "REDIG"
  | "COMPLETE";

export type PlayerRole = "presenter" | "scribe";

export interface AnalysisResult {
  foundConcepts: string[];
  missedConcepts: string[];
  matchScore: number;
  gapExplanation: string;
  reDigPrompt: string;
}

export interface GameState {
  phase: GamePhase;
  role: PlayerRole;
  topic: string;
  presenterNotes: string;
  presentationMinutes: number;
  scribeRecall: string;
  analysis: AnalysisResult | null;
  reDigRecall: string;
  reDigAnalysis: AnalysisResult | null;
}

const initialState: GameState = {
  phase: "SETUP",
  role: "presenter",
  topic: "",
  presenterNotes: "",
  presentationMinutes: 5,
  scribeRecall: "",
  analysis: null,
  reDigRecall: "",
  reDigAnalysis: null,
};

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);

  function setRole(role: PlayerRole) {
    setState((s) => ({ ...s, role }));
  }
  function setTopic(topic: string) {
    setState((s) => ({ ...s, topic }));
  }
  function setPresenterNotes(presenterNotes: string) {
    setState((s) => ({ ...s, presenterNotes }));
  }
  function setPresentationMinutes(presentationMinutes: number) {
    setState((s) => ({ ...s, presentationMinutes }));
  }
  function startPresenting() {
    setState((s) => ({ ...s, phase: "PRESENTING" }));
  }
  function startRecalling() {
    setState((s) => ({ ...s, phase: "RECALLING" }));
  }
  function setScribeRecall(scribeRecall: string) {
    setState((s) => ({ ...s, scribeRecall }));
  }
  function startAnalyzing() {
    setState((s) => ({ ...s, phase: "ANALYZING" }));
  }
  function setAnalysis(analysis: AnalysisResult) {
    setState((s) => ({ ...s, analysis, phase: "REVEALING" }));
  }
  function startReDig() {
    setState((s) => ({ ...s, phase: "REDIG" }));
  }
  function setReDigRecall(reDigRecall: string) {
    setState((s) => ({ ...s, reDigRecall }));
  }
  function setReDigAnalysis(reDigAnalysis: AnalysisResult) {
    setState((s) => ({ ...s, reDigAnalysis, phase: "COMPLETE" }));
  }
  function skipReDig() {
    setState((s) => ({ ...s, phase: "COMPLETE" }));
  }
  function resetGame() {
    setState(initialState);
  }

  return {
    state,
    setRole,
    setTopic,
    setPresenterNotes,
    setPresentationMinutes,
    startPresenting,
    startRecalling,
    setScribeRecall,
    startAnalyzing,
    setAnalysis,
    startReDig,
    setReDigRecall,
    setReDigAnalysis,
    skipReDig,
    resetGame,
  };
}
