"use client";

import { useEffect, useState } from "react";
import { GameState } from "../useGameState";

interface Props {
  state: GameState;
  setReDigRecall: (text: string) => void;
  onSubmit: () => void;
}

export default function ReDigPanel({ state, setReDigRecall, onSubmit }: Props) {
  const [text, setText] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [started, setStarted] = useState(false);

  const missedConcepts = state.analysis?.missedConcepts ?? [];
  const reDigPrompt = state.analysis?.reDigPrompt ?? "";
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isUrgent = secondsLeft <= 30;
  const progress = ((90 - secondsLeft) / 90) * 100;

  useEffect(() => {
    if (!started) return;
    if (secondsLeft <= 0) { handleSubmit(); return; }
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(interval); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, secondsLeft]);

  function handleSubmit() {
    setReDigRecall(text);
    onSubmit();
  }

  return (
    <div className="flex flex-col gap-6 mt-6">
      <div className="rounded-2xl border-2 border-[#c4622d] bg-[#fdf6f2] p-6">
        <div className="text-xs font-bold uppercase tracking-widest text-[#c4622d] mb-2">
          Re-dig — missed concepts
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {missedConcepts.map((c) => (
            <span key={c} className="rounded-full bg-white border border-[#f0d5c4] px-3 py-1 text-xs font-bold text-[#c4622d]">
              {c}
            </span>
          ))}
        </div>
        <p className="text-sm text-[#6b6b65] leading-relaxed">
          {reDigPrompt}
        </p>
      </div>

      {!started ? (
        <div className="rounded-3xl border-2 border-[#e8e0d4] bg-white p-10 flex flex-col items-center gap-6 text-center">
          <span className="text-6xl">🦴</span>
          <div>
            <p className="font-black text-xl text-[#1a1a18] mb-2">
              Second chance to excavate
            </p>
            <p className="text-sm text-[#6b6b65] max-w-sm leading-relaxed">
              The presenter will re-explain the missed concepts. Then you get 90 seconds to recall them.
            </p>
          </div>
          <button
            onClick={() => setStarted(true)}
            className="rounded-2xl bg-[#c4622d] px-10 py-4 text-base font-black text-white hover:opacity-90 transition-opacity shadow-lg shadow-[#c4622d]/20"
          >
            Start re-dig 🦕
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Timer */}
          <div className="rounded-2xl border-2 border-[#e8e0d4] bg-white px-6 py-4 flex items-center gap-4">
            <div className={`text-3xl font-black tabular-nums tracking-tight transition-colors ${isUrgent ? "text-[#c4622d]" : "text-[#1a1a18]"}`}>
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </div>
            <div className="flex-1 h-2 bg-[#f0ebe4] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${progress}%`,
                  background: isUrgent ? "#c4622d" : "#d4956a",
                }}
              />
            </div>
            <div className="text-sm text-[#9b9b95] font-medium tabular-nums">
              {wordCount} words
            </div>
          </div>

          {/* Text area */}
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Now recall the missed concepts — in your own words..."
            className="w-full rounded-2xl border-2 border-[#e8e0d4] bg-white px-6 py-5 text-sm text-[#1a1a18] outline-none focus:border-[#c4622d] transition-colors placeholder:text-[#9b9b95] min-h-[200px] resize-none leading-relaxed"
          />

          <button
            onClick={handleSubmit}
            disabled={wordCount < 3}
            className={`w-full rounded-2xl py-4 text-base font-black tracking-tight transition-all ${
              wordCount >= 3
                ? "bg-[#c4622d] text-white hover:opacity-90 hover:-translate-y-0.5 shadow-lg shadow-[#c4622d]/20"
                : "bg-[#e8e0d4] text-[#9b9b95] cursor-not-allowed"
            }`}
          >
            Submit re-dig →
          </button>
        </div>
      )}
    </div>
  );
}
