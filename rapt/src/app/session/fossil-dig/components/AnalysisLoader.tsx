"use client";

import { useEffect, useState } from "react";
import { FossilDigIcon } from "../../components/gameChrome";

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
      <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-[var(--color-primary-muted)] bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-[var(--shadow-primary)]">
        <FossilDigIcon className="h-10 w-10 animate-pulse" />
      </div>

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
