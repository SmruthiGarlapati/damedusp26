"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Extracting fossils from your notes...",
  "Comparing DNA strands...",
  "Assembling the skeleton...",
  "Calculating match score...",
  "Almost ready...",
];

export default function AnalysisLoader() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-32 gap-8">
      {/* Animated dino */}
      <div className="text-7xl animate-bounce">🦕</div>

      {/* Spinning bones */}
      <div className="flex items-center gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-[#c4622d]"
            style={{
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Rotating messages */}
      <div className="text-center">
        <p className="mb-2 text-xl font-black text-[var(--color-text-base)]">
          Analyzing your excavation
        </p>
        <p className="text-sm text-[var(--color-text-muted)] transition-all">
          {MESSAGES[msgIndex]}
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.5); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
