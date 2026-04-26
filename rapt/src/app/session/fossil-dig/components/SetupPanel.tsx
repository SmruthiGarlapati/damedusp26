"use client";

import { GameState, PlayerRole } from "../useGameState";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  FossilDigIcon,
  ListenerIcon,
  PlayerAvatar,
  PresenterIcon,
  UploadIcon,
} from "../../components/gameChrome";

interface Props {
  state: GameState;
  partnerName: string;
  setRole: (role: PlayerRole) => void;
  setTopic: (topic: string) => void;
  setPresenterNotes: (notes: string) => void;
  setPresentationMinutes: (mins: number) => void;
  onStart: () => void;
}

export default function SetupPanel({ state, partnerName, setRole, setTopic, setPresenterNotes, setPresentationMinutes, onStart }: Props) {
  const partnerFirst = partnerName.split(" ")[0];
  const lockedRole = partnerFirst === "Tani" ? "scribe" : partnerFirst === "Sid" ? "presenter" : null;
  const activeRole = lockedRole ?? state.role;
  const isTaniSidDemo = lockedRole !== null;
  const canStart = state.topic.trim().length > 0 && (activeRole === "scribe" || state.presenterNotes.trim().length > 0);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setPresenterNotes(text);
  }

  const youRole = activeRole === "presenter" ? "Lead Presenter" : "Field Scribe";
  const partnerRole = activeRole === "presenter" ? "Field Scribe" : "Lead Presenter";

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
          Session setup
        </span>
        <h2 className="rapt-display text-3xl tracking-tight text-[var(--color-text-base)]">Configure your Fossil Dig</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">One of you teaches, the other reconstructs from memory — then both get a sharp breakdown of what was transferred.</p>
      </div>

      {/* Playing Together strip */}
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-primary-muted)] bg-[var(--color-primary-light)] px-5 py-4">
        <div className="flex flex-col items-center gap-1">
          <PlayerAvatar name="You" you size="md" />
          <span className="text-[10px] font-bold text-[var(--color-primary)]">{youRole}</span>
        </div>
        <div className="flex flex-1 flex-col items-center gap-1">
          <div className="flex w-full items-center gap-1">
            <div className="h-px flex-1 border-t-2 border-dashed border-[var(--color-primary-muted)]" />
            <FossilDigIcon className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
            <div className="h-px flex-1 border-t-2 border-dashed border-[var(--color-primary-muted)]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary)]">Playing together</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <PlayerAvatar name={partnerName} size="md" />
          <span className="text-[10px] font-bold text-[var(--color-text-muted)]">{partnerRole}</span>
        </div>
      </div>

      <div>
        <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Your role</label>
        {isTaniSidDemo ? (
          <div className="rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-primary-light)] p-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[var(--color-text-base)]">
              <PresenterIcon className="h-5 w-5" />
            </div>
            <div className="mb-1 text-sm font-bold text-[var(--color-text-base)]">Tani presents, Sid listens</div>
            <div className="text-xs leading-relaxed text-[var(--color-text-muted)]">
              Tani teaches the topic. Sid listens closely, then reconstructs the lesson from memory.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {[
              { role: "presenter" as PlayerRole, Icon: PresenterIcon, title: "Lead Presenter", desc: `You teach the topic. ${partnerFirst} listens, then recalls from memory.` },
              { role: "scribe" as PlayerRole, Icon: ListenerIcon, title: "Field Scribe", desc: `${partnerFirst} teaches. You listen closely, then reconstruct the lesson.` },
            ].map((r) => (
              <button key={r.role} onClick={() => setRole(r.role)}
                className={`text-left rounded-2xl border-2 p-5 transition-all ${state.role === r.role ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]" : "border-[var(--color-border)] bg-[var(--color-surface-strong)] hover:border-[var(--color-primary-muted)]"}`}>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[var(--color-text-base)]">
                  <r.Icon className="h-5 w-5" />
                </div>
                <div className="mb-1 text-sm font-bold text-[var(--color-text-base)]">{r.title}</div>
                <div className="text-xs leading-relaxed text-[var(--color-text-muted)]">{r.desc}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Topic / Course</label>
        <input type="text" value={state.topic} onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. MIS 333K — Database Normalization"
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm text-[var(--color-text-base)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"/>
      </div>
      {activeRole === "presenter" && (
        <div>
          <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Your notes</label>
          <div className="rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface-strong)] p-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                state.presenterNotes
                  ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                  : "border-white/10 bg-white/5 text-[var(--color-text-secondary)]"
              }`}>
                {state.presenterNotes ? <CheckCircleIcon className="h-6 w-6" /> : <UploadIcon className="h-6 w-6" />}
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-base)]">
                  {state.presenterNotes ? "Notes ready" : "Upload your notes"}
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {state.presenterNotes ? `${state.presenterNotes.length} characters` : "TXT, PDF, or DOCX · max 10MB"}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <label className="cursor-pointer rounded-lg bg-[var(--color-action-bg)] px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90">
                  Choose file
                  <input type="file" accept=".txt,.pdf,.docx" className="hidden" onChange={handleFileUpload}/>
                </label>
                {state.presenterNotes && (
                  <button onClick={() => setPresenterNotes("")} className="text-xs text-[var(--color-primary)] underline">
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">or paste below</p>
              <textarea
                value={state.presenterNotes}
                placeholder="...paste your notes directly here"
                className="min-h-[120px] w-full resize-y rounded-lg border border-[var(--color-border)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-xs text-[var(--color-text-base)] outline-none focus:border-[var(--color-primary)]"
                onChange={(e) => setPresenterNotes(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
      <div>
        <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Presentation time</label>
        <div className="flex gap-3">
          {[5, 10, 15].map((mins) => (
            <button key={mins} onClick={() => setPresentationMinutes(mins)}
              className={`flex-1 rounded-xl border-2 py-3 text-sm font-bold transition-all ${state.presentationMinutes === mins ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]" : "border-[var(--color-border)] bg-[var(--color-surface-strong)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary-muted)]"}`}>
              <span className="inline-flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                {mins} min
              </span>
            </button>
          ))}
        </div>
      </div>
      <button onClick={onStart} disabled={!canStart}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black tracking-tight transition-all ${canStart ? "bg-[var(--color-action-bg)] text-white shadow-lg shadow-black/20 hover:-translate-y-0.5 hover:opacity-90" : "cursor-not-allowed bg-white/8 text-[var(--color-text-muted)]"}`}>
        <FossilDigIcon className="h-5 w-5" />
        Start Fossil Dig
        <ArrowRightIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
