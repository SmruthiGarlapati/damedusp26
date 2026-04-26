"use client";

import { useState } from "react";

export type GamePhase = "SETUP" | "GENERATING" | "PLAYING" | "ANALYZING" | "RESULTS";

export interface Sentence {
  id: string;
  text: string;
  isError: boolean;
  correctText: string; 
}

export interface UserComment {
  sentenceId: string;
  originalText: string;
  comment: string;
}

export interface GradingResult {
  score: number;
  totalErrors: number;
  troublePoints: string[];
  feedback: { sentenceId: string; isCorrect: boolean; aiFeedback: string }[];
}

export interface ErrorGameState {
  phase: GamePhase;
  topic: string;
  notes: string;
  sentences: Sentence[];
  totalErrors: number;
  userComments: Record<string, UserComment>; // Keyed by sentenceId
  results: GradingResult | null;
}

const initialState: ErrorGameState = {
  phase: "SETUP",
  topic: "American History",
  notes: "",
  sentences: [],
  totalErrors: 0,
  userComments: {},
  results: null,
};

export function useErrorGameState() {
  const [state, setState] = useState<ErrorGameState>(initialState);

  const setTopic = (topic: string) => setState((s) => ({ ...s, topic }));
  const setNotes = (notes: string) => setState((s) => ({ ...s, notes }));
  
  const startGenerating = () => setState((s) => ({ ...s, phase: "GENERATING" }));
  
  const setGameData = (sentences: Sentence[], totalErrors: number) => 
    setState((s) => ({ ...s, sentences, totalErrors, phase: "PLAYING" }));

  const addComment = (sentenceId: string, originalText: string, comment: string) => {
    setState((s) => ({
      ...s,
      userComments: { ...s.userComments, [sentenceId]: { sentenceId, originalText, comment } }
    }));
  };

  const removeComment = (sentenceId: string) => {
    setState((s) => {
      const next = { ...s.userComments };
      delete next[sentenceId];
      return { ...s, userComments: next };
    });
  };

  const startAnalyzing = () => setState((s) => ({ ...s, phase: "ANALYZING" }));
  
  const setResults = (results: GradingResult) => 
    setState((s) => ({ ...s, results, phase: "RESULTS" }));

  const resetGame = () => setState(initialState);

  return {
    state,
    setTopic,
    setNotes,
    startGenerating,
    setGameData,
    addComment,
    removeComment,
    startAnalyzing,
    setResults,
    resetGame,
  };
}
