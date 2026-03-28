// Simple in-memory store shared across the app via module-level state.
// In production this would be replaced with Supabase real-time subscriptions.

export type SessionStatus = "pending" | "accepted" | "declined" | "live" | "completed";

export interface StudySession {
  id: string;
  partnerName: string;
  partnerInitials: string;
  course: string;
  location: string;
  scheduledAt: Date; // the agreed time
  duration: number;  // minutes
  status: SessionStatus;
  requestedByMe: boolean;
  studyMethods: string[];
  notes?: string;
}

// Pre-seeded demo sessions so the dashboard is never empty
const now = new Date();

function minutesFromNow(m: number): Date {
  return new Date(now.getTime() + m * 60 * 1000);
}

const DEMO: StudySession[] = [
  {
    id: "1",
    partnerName: "Elena Chen",
    partnerInitials: "EC",
    course: "CS 3450",
    location: "PCL Level 3",
    scheduledAt: minutesFromNow(2),   // starts in 2 min → shows "Start Session"
    duration: 90,
    status: "accepted",
    requestedByMe: true,
    studyMethods: ["Pomodoro", "Flashcards"],
    notes: "Focusing on Assignment 4: Design Patterns",
  },
  {
    id: "2",
    partnerName: "Marcus Thorne",
    partnerInitials: "MT",
    course: "MATH 2210",
    location: "Starbucks on Guadalupe",
    scheduledAt: minutesFromNow(90),
    duration: 60,
    status: "accepted",
    requestedByMe: false,
    studyMethods: ["Discussion", "Practice Problems"],
  },
  {
    id: "3",
    partnerName: "Rhea Patel",
    partnerInitials: "RP",
    course: "CS 312",
    location: "FAC 214",
    scheduledAt: minutesFromNow(5),
    duration: 120,
    status: "pending",   // waiting for Rhea to accept
    requestedByMe: true,
    studyMethods: ["Whiteboard"],
  },
  {
    id: "4",
    partnerName: "Jason Yao",
    partnerInitials: "JY",
    course: "PHYS 201",
    location: "Union Building",
    scheduledAt: minutesFromNow(-10), // sent 10 min ago, waiting on me to accept
    duration: 60,
    status: "pending",
    requestedByMe: false,
    studyMethods: ["Cliff Notes"],
  },
];

let _sessions: StudySession[] = [...DEMO];
const _listeners: Array<() => void> = [];

export function getSessions(): StudySession[] {
  return _sessions;
}

export function addSession(s: StudySession) {
  _sessions = [s, ..._sessions];
  _notify();
}

export function updateSession(id: string, patch: Partial<StudySession>) {
  _sessions = _sessions.map((s) => (s.id === id ? { ...s, ...patch } : s));
  _notify();
}

export function removeSession(id: string) {
  _sessions = _sessions.filter((s) => s.id !== id);
  _notify();
}

export function subscribe(fn: () => void) {
  _listeners.push(fn);
  return () => {
    const idx = _listeners.indexOf(fn);
    if (idx > -1) _listeners.splice(idx, 1);
  };
}

function _notify() {
  _listeners.forEach((fn) => fn());
}
