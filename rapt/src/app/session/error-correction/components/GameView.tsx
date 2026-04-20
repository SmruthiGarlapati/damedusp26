"use client";

import { useState } from "react";
import { ErrorGameState } from "../useErrorGameState";
import { ArrowRightIcon, ProofreaderIcon } from "../../components/gameChrome";

interface Props {
  state: ErrorGameState;
  onAddComment: (id: string, text: string, comment: string) => void;
  onRemoveComment: (id: string) => void;
  onSubmit: () => void;
}

export default function GameView({ state, onAddComment, onRemoveComment, onSubmit }: Props) {
  const [activeSentenceId, setActiveSentenceId] = useState<string | null>(null);
  const [draftComment, setDraftComment] = useState("");
  type Sentence = ErrorGameState["sentences"][number];

  const foundCount = Object.keys(state.userComments).length;

  function handleSaveComment(sentence: Sentence) {
    if (!draftComment.trim()) return;
    onAddComment(sentence.id, sentence.text, draftComment);
    setActiveSentenceId(null);
    setDraftComment("");
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      
      {/* LEFT: The Interactive Text */}
      {/* Notice the pb-24 here! This gives extra scrolling room at the bottom */}
      <div className="flex-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-8 pb-24 shadow-sm">
        <div className="mb-6 border-b border-[var(--color-border)] pb-4 flex justify-between items-center">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              <ProofreaderIcon className="h-3.5 w-3.5" />
              Investigation workspace
            </div>
            <h2 className="text-xl font-black text-[var(--color-text-base)]">Inspect the passage</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">Click any sentence that feels off, then log why it needs a correction.</p>
          </div>
          <div className="rounded-full bg-[var(--color-primary-light)] px-4 py-1.5 text-sm font-bold text-[var(--color-primary)] border border-[var(--color-primary-muted)]">
            Errors flagged: {foundCount} / {state.totalErrors}
          </div>
        </div>

        <div className="text-[15px] leading-loose text-[var(--color-text-base)]">
          {state.sentences.map((sentence, index) => {
            const isSelected = !!state.userComments[sentence.id];
            const isActive = activeSentenceId === sentence.id;
            
            // SMART POSITIONING: If it's in the bottom 30% of sentences, popup goes UP.
            const isNearBottom = index > state.sentences.length * 0.7;

            return (
              <span key={sentence.id} className="relative inline">
                <span
                  onClick={() => {
                    if (!isSelected) {
                      setActiveSentenceId(sentence.id);
                      setDraftComment("");
                    }
                  }}
                  className={`inline px-1 py-0.5 rounded transition-colors cursor-pointer ${
                    isSelected 
                      ? "bg-red-100 text-red-900 border-b-2 border-red-400" 
                      : isActive 
                      ? "bg-[var(--color-primary-light)] ring-2 ring-[var(--color-primary)]" 
                      : "hover:bg-white/10"
                  }`}
                >
                  {sentence.text}
                </span>
                {" "}

                {/* Inline Comment Box */}
                {isActive && (
                  <div 
                    className={`absolute z-50 w-72 rounded-xl border border-[var(--color-border)] bg-white p-3 shadow-2xl ${
                      isNearBottom ? "bottom-full mb-2" : "top-full mt-2"
                    } left-0`}
                  >
                    <p className="text-xs font-bold text-[var(--color-text-muted)] mb-2 uppercase tracking-wide">Why is this wrong?</p>
                    <textarea
                      autoFocus
                      value={draftComment}
                      onChange={(e) => setDraftComment(e.target.value)}
                      className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-sm outline-none focus:border-[var(--color-primary)] text-[var(--color-text-base)]"
                      rows={3}
                      placeholder="e.g. This actually happens in O(n) time, not O(1)..."
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button onClick={() => setActiveSentenceId(null)} className="text-xs font-semibold text-[var(--color-text-muted)] hover:text-red-500 transition-colors">Cancel</button>
                      <button onClick={() => handleSaveComment(sentence)} className="rounded-md bg-[var(--color-action-bg)] px-3 py-1 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90">Save</button>
                    </div>
                  </div>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* RIGHT: The Sidebar Log */}
      <div className="w-full md:w-80 shrink-0 flex flex-col gap-4 sticky top-6">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-5 min-h-[300px] shadow-sm">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Your Investigation Log</h3>
          
          {foundCount === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)] italic text-center mt-10">No errors flagged yet. Start reading!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.values(state.userComments).map((comment) => (
                <div key={comment.sentenceId} className="relative rounded-xl border border-red-200 bg-red-50 p-3 shadow-sm">
                  <button onClick={() => onRemoveComment(comment.sentenceId)} className="absolute top-2 right-2 text-red-400 hover:text-red-700 transition-colors">✕</button>
                  <p className="mb-2 text-xs font-semibold italic text-red-900">
                    <q>{comment.originalText}</q>
                  </p>
                  <p className="text-sm text-red-800"><strong>Reason:</strong> {comment.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onSubmit}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-action-bg)] py-4 text-[15px] font-black text-white shadow-lg transition-transform hover:-translate-y-0.5"
        >
          Submit for grading
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
