"use client";

import { useEffect, useState } from "react";
import { FossilDigIcon, PlayerAvatar } from "../../components/gameChrome";
import { PlayerRole } from "../useGameState";

interface Props {
  partnerName: string;
  role: PlayerRole;
}

const MESSAGES = [
  "Extracting fossils from your notes...",
  "Cross-referencing what was taught vs recalled...",
  "Assembling the skeleton...",
  "Calculating knowledge transfer score...",
  "Almost ready...",
];

export default function AnalysisLoader({ partnerName, role }: Props) {
  const [msgIndex, setMsgIndex] = useState(0);
  const partnerFirst = partnerName.split(" ")[0];

  const presenterLabel = role === "presenter" ? "You" : partnerFirst;
  const scribeLabel = role === "scribe" ? "You" : partnerFirst;

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-8">
      {/* Team avatars with transfer arrow */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center gap-1.5">
          <PlayerAvatar name={role === "presenter" ? "You" : partnerName} you={role === "presenter"} size="lg" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">{presenterLabel} taught</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-[var(--color-primary)]"
                style={{ animation: `bounce 1.2s ease-in-out ${i * 0.25}s infinite` }}
              />
            ))}
          </div>
          <FossilDigIcon className="h-5 w-5 text-[var(--color-primary)] animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <PlayerAvatar name={role === "scribe" ? "You" : partnerName} you={role === "scribe"} size="lg" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">{scribeLabel} recalled</span>
        </div>
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
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
