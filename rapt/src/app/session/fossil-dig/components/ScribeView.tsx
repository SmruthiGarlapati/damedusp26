"use client";

import { useEffect, useState } from "react";
import { GameState } from "../useGameState";

interface Props {
  state: GameState;
  setScribeRecall: (text: string) => void;
  onSubmit: () => void;
}

export default function ScribeView({ state, setScribeRecall, onSubmit }: Props) {
  const recallMinutes = state.presentationMinutes <= 5 ? 3 : state.presentationMinutes <= 10 ? 4 : 5;
  const totalSeconds = recallMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [text, setText] = useState("");
  const [started, setStarted] = useState(false);

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
    setScribeRecall(text);
    onSubmit();
  }

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const isUrgent = secondsLeft <= 60;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[#1a1a18] mb-1">
          Brain dump time 🧠
        </h1>
        <p className="text-[#6b6b65] text-sm">
          Write down everything you remember. No notes, no hints — pure recall.
        </p>
      </div>

      {/* Topic reminder */}
      <div className="rounded-2xl bg-[#fdf6f2] border border-[#f0d5c4] p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-[#c4622d] mb-1">
          Topic
        </div>
        <div className="font-black text-[#1a1a18]">{state.topic}</div>
      </div>

      {!started ? (
        /* Pre-recall screen */
        <div className="rounded-3xl border-2 border-[#e8e0d4] bg-white p-10 flex flex-col items-center gap-6 text-center">
          <span className="text-6xl">👂</span>
          <div>
            <p className="font-black text-xl text-[#1a1a18] mb-2">
              Ready to recall?
            </p>
            <p className="text-sm text-[#6b6b65] max-w-sm leading-relaxed">
              You have {recallMinutes} minutes to write down everything you remember from the presentation. No peeking at notes.
            </p>
          </div>
          <button
            onClick={() => setStarted(true)}
            className="rounded-2xl bg-[#c4622d] px-10 py-4 text-base font-black text-white hover:opacity-90 transition-opacity shadow-lg shadow-[#c4622d]/20"
          >
            Start recall 🦕
          </button>
        </div>
      ) : (
        /* Active recall screen */
        <div className="flex flex-col gap-4">
          {/* Timer bar */}
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
            placeholder="Start typing everything you remember... concepts, definitions, examples, anything."
            className="w-full rounded-2xl border-2 border-[#e8e0d4] bg-white px-6 py-5 text-sm text-[#1a1a18] outline-none focus:border-[#c4622d] transition-colors placeholder:text-[#c4622d]/30 min-h-[280px] resize-none leading-relaxed"
          />

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={wordCount < 5}
            className={`w-full rounded-2xl py-4 text-base font-black tracking-tight transition-all ${
              wordCount >= 5
                ? "bg-[#c4622d] text-white hover:opacity-90 hover:-translate-y-0.5 shadow-lg shadow-[#c4622d]/20"
                : "bg-[#e8e0d4] text-[#9b9b95] cursor-not-allowed"
            }`}
          >
            Submit recall →
          </button>
          <p className="text-center text-xs text-[#9b9b95]">
            {wordCount < 5 ? `Write at least 5 words to submit` : "Submit when you're done or wait for the timer"}
          </p>
        </div>
      )}
    </div>
  );
}
