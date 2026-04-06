"use client";

import { GameState, PlayerRole } from "../useGameState";

interface Props {
  state: GameState;
  setRole: (role: PlayerRole) => void;
  setTopic: (topic: string) => void;
  setPresenterNotes: (notes: string) => void;
  setPresentationMinutes: (mins: number) => void;
  onStart: () => void;
}

export default function SetupPanel({ state, setRole, setTopic, setPresenterNotes, setPresentationMinutes, onStart }: Props) {
  const canStart = state.topic.trim().length > 0 && (state.role === "scribe" || state.presenterNotes.trim().length > 0);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setPresenterNotes(text);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[#1a1a18] mb-1">Set up your dig 🦴</h1>
        <p className="text-[#6b6b65] text-sm">One person teaches, the other listens and recalls. Both of you learn.</p>
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-[#9b9b95] mb-3 block">Your role</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { role: "presenter" as PlayerRole, emoji: "🦴", title: "Lead Paleontologist", desc: "You teach the topic. Upload your notes and present." },
            { role: "scribe" as PlayerRole, emoji: "👂", title: "Field Scribe", desc: "You listen carefully, then recall everything from memory." },
          ].map((r) => (
            <button key={r.role} onClick={() => setRole(r.role)}
              className={`text-left rounded-2xl border-2 p-5 transition-all ${state.role === r.role ? "border-[#c4622d] bg-[#fdf6f2]" : "border-[#e8e0d4] bg-white hover:border-[#c4622d]/40"}`}>
              <div className="text-2xl mb-2">{r.emoji}</div>
              <div className="font-bold text-sm text-[#1a1a18] mb-1">{r.title}</div>
              <div className="text-xs text-[#9b9b95] leading-relaxed">{r.desc}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-[#9b9b95] mb-3 block">Topic / Course</label>
        <input type="text" value={state.topic} onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. MIS 333K — Database Normalization"
          className="w-full rounded-xl border border-[#e8e0d4] bg-white px-4 py-3 text-sm text-[#1a1a18] outline-none focus:border-[#c4622d] transition-colors placeholder:text-[#9b9b95]"/>
      </div>
      {state.role === "presenter" && (
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-[#9b9b95] mb-3 block">Your notes</label>
          <div className="rounded-xl border-2 border-dashed border-[#e8e0d4] bg-white p-6 text-center">
            {state.presenterNotes ? (
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">✅</span>
                <span className="text-sm font-semibold text-[#1a1a18]">Notes loaded</span>
                <span className="text-xs text-[#9b9b95]">{state.presenterNotes.length} characters</span>
                <button onClick={() => setPresenterNotes("")} className="text-xs text-[#c4622d] underline mt-1">Remove</button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <span className="text-3xl">📄</span>
                <div>
                  <p className="text-sm font-semibold text-[#1a1a18]">Upload your notes</p>
                  <p className="text-xs text-[#9b9b95] mt-1">TXT, PDF, or DOCX · max 10MB</p>
                </div>
                <label className="cursor-pointer rounded-lg bg-[#c4622d] px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition-opacity">
                  Choose file
                  <input type="file" accept=".txt,.pdf,.docx" className="hidden" onChange={handleFileUpload}/>
                </label>
                <p className="text-xs text-[#9b9b95]">or paste below</p>
                <textarea placeholder="...paste your notes directly here"
                  className="w-full rounded-lg border border-[#e8e0d4] px-3 py-2 text-xs text-[#1a1a18] outline-none focus:border-[#c4622d] min-h-[80px] resize-none"
                  onChange={(e) => setPresenterNotes(e.target.value)}/>
              </div>
            )}
          </div>
        </div>
      )}
      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-[#9b9b95] mb-3 block">Presentation time</label>
        <div className="flex gap-3">
          {[5, 10, 15].map((mins) => (
            <button key={mins} onClick={() => setPresentationMinutes(mins)}
              className={`flex-1 rounded-xl border-2 py-3 text-sm font-bold transition-all ${state.presentationMinutes === mins ? "border-[#c4622d] bg-[#fdf6f2] text-[#c4622d]" : "border-[#e8e0d4] bg-white text-[#6b6b65] hover:border-[#c4622d]/40"}`}>
              {mins} min
            </button>
          ))}
        </div>
      </div>
      <button onClick={onStart} disabled={!canStart}
        className={`w-full rounded-2xl py-4 text-base font-black tracking-tight transition-all ${canStart ? "bg-[#c4622d] text-white hover:opacity-90 hover:-translate-y-0.5 shadow-lg shadow-[#c4622d]/20" : "bg-[#e8e0d4] text-[#9b9b95] cursor-not-allowed"}`}>
        Start dig session 🦕
      </button>
    </div>
  );
}
