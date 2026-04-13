"use client";

import { ErrorGameState } from "../useErrorGameState";

interface Props {
  state: ErrorGameState;
  setTopic: (topic: string) => void;
  setNotes: (notes: string) => void;
  onStart: () => void;
}

export default function SetupPanel({ state, setTopic, setNotes, onStart }: Props) {
  const canStart = state.topic.trim().length > 0 && state.notes.trim().length > 0;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setNotes(text);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="rapt-display mb-1 text-3xl tracking-tight text-[var(--color-text-base)]">Set up your document 📝</h1>
        <p className="text-[var(--color-text-secondary)] text-sm">Upload your notes and let the AI plant some hidden errors for you to find.</p>
      </div>

      <div>
        <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Topic / Course</label>
        <input 
          type="text" 
          value={state.topic} 
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. MIS 333K — Database Normalization"
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm text-[var(--color-text-base)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
        />
      </div>

      <div>
        <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Your notes</label>
        <div className="rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface-strong)] p-6 text-center">
          {state.notes ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">✅</span>
              <span className="text-sm font-semibold text-[var(--color-text-base)]">Notes loaded</span>
              <span className="text-xs text-[var(--color-text-muted)]">{state.notes.length} characters</span>
              <button onClick={() => setNotes("")} className="mt-1 text-xs text-[var(--color-primary)] underline">Remove</button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <span className="text-3xl">📄</span>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-base)]">Upload your notes</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">TXT, PDF, or DOCX</p>
              </div>
              <label className="cursor-pointer rounded-lg bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90">
                Choose file
                <input type="file" accept=".txt,.pdf,.docx" className="hidden" onChange={handleFileUpload}/>
              </label>
              <p className="text-xs text-[var(--color-text-muted)]">or paste below</p>
              <textarea 
                placeholder="...paste your notes directly here"
                className="min-h-[120px] w-full resize-none rounded-lg border border-[var(--color-border)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-sm text-[var(--color-text-base)] outline-none focus:border-[var(--color-primary)]"
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={onStart} 
        disabled={!canStart}
        className={`w-full rounded-2xl py-4 text-base font-black tracking-tight transition-all ${
          canStart 
            ? "bg-[var(--color-primary)] text-white shadow-lg transition-transform hover:-translate-y-0.5" 
            : "cursor-not-allowed bg-white/8 text-[var(--color-text-muted)]"
        }`}
      >
        Generate Game 🧠
      </button>
    </div>
  );
}