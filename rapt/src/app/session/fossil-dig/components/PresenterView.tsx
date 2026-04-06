"use client";

import { useEffect, useState } from "react";
import { GameState } from "../useGameState";

interface Props {
  state: GameState;
  onDone: () => void;
}

export default function PresenterView({ state, onDone }: Props) {
  const totalSeconds = state.presentationMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (secondsLeft <= 0) { onDone(); return; }
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(interval); onDone(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, secondsLeft]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const isUrgent = secondsLeft <= 60;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[#1a1a18] mb-1">
          You&apos;re on 🦴
        </h1>
        <p className="text-[#6b6b65] text-sm">
          Teach the topic. Your partner is listening — no interruptions.
        </p>
      </div>

      {/* Timer */}
      <div className="rounded-3xl border-2 border-[#e8e0d4] bg-white p-10 flex flex-col items-center gap-6">
        <div className={`text-8xl font-black tabular-nums tracking-tight transition-colors ${isUrgent ? "text-[#c4622d]" : "text-[#1a1a18]"}`}>
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-[#f0ebe4] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${progress}%`,
              background: isUrgent ? "#c4622d" : "#d4956a",
            }}
          />
        </div>

        <div className="text-sm text-[#9b9b95] font-medium">
          {!running ? "Press start when you're ready" : isUrgent ? "Wrapping up soon..." : "Keep going, you're doing great"}
        </div>

        {!running ? (
          <button
            onClick={() => setRunning(true)}
            className="rounded-2xl bg-[#c4622d] px-10 py-4 text-base font-black text-white hover:opacity-90 transition-opacity shadow-lg shadow-[#c4622d]/20"
          >
            Start presenting 🦕
          </button>
        ) : (
          <button
            onClick={onDone}
            className="rounded-2xl border-2 border-[#e8e0d4] bg-white px-10 py-4 text-base font-black text-[#6b6b65] hover:border-[#c4622d] hover:text-[#c4622d] transition-all"
          >
            I&apos;m done early →
          </button>
        )}
      </div>

      {/* Notes reference */}
      {state.presenterNotes && (
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-[#9b9b95] mb-3 block">
            Your notes (reference)
          </label>
          <div className="rounded-2xl border border-[#e8e0d4] bg-white p-6 max-h-64 overflow-y-auto">
            <p className="text-sm text-[#6b6b65] leading-relaxed whitespace-pre-wrap">
              {state.presenterNotes}
            </p>
          </div>
        </div>
      )}

      {/* Topic reminder */}
      <div className="rounded-2xl bg-[#fdf6f2] border border-[#f0d5c4] p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-[#c4622d] mb-1">
          Topic
        </div>
        <div className="font-black text-[#1a1a18]">{state.topic}</div>
      </div>
    </div>
  );
}
