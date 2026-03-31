"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/lib/useCurrentUser";

const TABS = ["Profile", "Study Preferences", "Notifications", "Account"] as const;
type Tab = (typeof TABS)[number];

const STUDY_METHODS = ["Pomodoro", "Flashcards", "Discussion", "Cliff Notes", "Practice Problems", "Whiteboard"];

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<Tab>("Profile");

  // Profile state
  const [name,  setName]  = useState("");
  const [major, setMajor] = useState("");
  const [year,  setYear]  = useState("Junior");
  const [bio,   setBio]   = useState("");

  // Study prefs state
  const [studyMethods, setStudyMethods] = useState<string[]>(["Pomodoro", "Flashcards"]);
  const [groupSize,    setGroupSize]    = useState("Small (2-3)");
  const [environment,  setEnvironment]  = useState("Silent (Library Level 5)");
  const [studySpot,    setStudySpot]    = useState("PCL (Library)");

  // Notification state
  const [notifs, setNotifs] = useState({
    sessionRequests: true,
    sessionAccepted: true,
    sessionReminders: true,
    messages:         true,
    weeklyDigest:     false,
    marketingEmails:  false,
  });

  const [saved,   setSaved]   = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saveErr, setSaveErr] = useState("");

  // Populate form fields once the user profile loads
  useEffect(() => {
    if (!user) return;
    const p = user.preferences;

    setName(user.full_name ?? "");
    setMajor((p.major  as string) ?? "");
    setYear ((p.year   as string) ?? "Junior");
    setBio  ((p.bio    as string) ?? "");

    setStudyMethods((p.techniques as string[]) ?? ["Pomodoro", "Flashcards"]);
    setGroupSize   ((p.group_size           as string)   ?? "Small (2-3)");
    setEnvironment ((p.environment_type     as string)   ?? "Silent (Library Level 5)");
    setStudySpot   ((p.preferred_study_spot as string)   ?? "PCL (Library)");

    if (p.notifications) {
      setNotifs((prev) => ({ ...prev, ...(p.notifications as typeof prev) }));
    }
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaveErr("");

    const supabase = createClient();

    const updatedPrefs = {
      // Profile extras
      major,
      year,
      bio,
      // Study prefs
      techniques:           studyMethods,
      group_size:           groupSize,
      environment_type:     environment,
      preferred_study_spot: studySpot,
      // Notifications
      notifications: notifs,
    };

    const { error } = await supabase
      .from("users")
      .update({
        full_name:   name,
        preferences: updatedPrefs,
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      setSaveErr(error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  function toggleMethod(m: string) {
    setStudyMethods((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  }

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  const rating           = user?.overall_rating ?? 0;
  const sessionsCompleted = user?.sessionsCompleted ?? 0;
  const email            = user?.email ?? "";

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <Navbar />

      <main className="flex flex-1 gap-0">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 border-r border-[var(--color-border)] bg-white px-6 py-8">
          {/* Avatar */}
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)] text-[24px] font-extrabold text-white">
              {loading ? "…" : initials}
            </div>
            <div>
              <p className="text-[15px] font-bold text-[var(--color-text-base)]">
                {loading ? "Loading…" : name || "Your Name"}
              </p>
              <p className="text-[12px] text-[var(--color-text-muted)]">{email}</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-[var(--color-text-muted)]">
              <span className="flex flex-col items-center">
                <span className="text-[16px] font-extrabold text-[var(--color-text-base)]">
                  {rating > 0 ? rating.toFixed(1) : "—"}
                </span>
                Rating
              </span>
              <div className="h-6 w-px bg-[var(--color-border)]" />
              <span className="flex flex-col items-center">
                <span className="text-[16px] font-extrabold text-[var(--color-text-base)]">
                  {sessionsCompleted}
                </span>
                Sessions
              </span>
              <div className="h-6 w-px bg-[var(--color-border)]" />
              <span className="flex flex-col items-center">
                <span className="text-[16px] font-extrabold text-[var(--color-text-base)]">
                  {year ? year.slice(0, 2) : "—"}
                </span>
                Year
              </span>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex flex-col gap-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-left transition-all ${
                  activeTab === t
                    ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
                }`}
              >
                <TabIcon tab={t} active={activeTab === t} />
                {t}
              </button>
            ))}
          </nav>

          <button
            onClick={handleSignOut}
            className="mt-8 flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-red-500 transition-colors hover:bg-red-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </aside>

        {/* Content */}
        <div className="flex-1 px-10 py-10 max-w-2xl">
          {/* Save banner */}
          {saved && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[13px] font-semibold text-green-700">
              <svg width="14" height="14" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="1,5 4.5,8.5 13,1" />
              </svg>
              Changes saved successfully.
            </div>
          )}
          {saveErr && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-600">
              {saveErr}
            </div>
          )}

          {/* ── Profile Tab ── */}
          {activeTab === "Profile" && (
            <section>
              <h2 className="mb-1 text-[22px] font-extrabold tracking-tight">Profile</h2>
              <p className="mb-8 text-[14px] text-[var(--color-text-secondary)]">
                This is how other students see you on RAPT.
              </p>

              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Full name">
                    <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT_CLS} />
                  </Field>
                  <Field label="Email">
                    <input value={email} readOnly className={`${INPUT_CLS} cursor-not-allowed opacity-60`} />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Major">
                    <input value={major} onChange={(e) => setMajor(e.target.value)} className={INPUT_CLS} />
                  </Field>
                  <Field label="Year">
                    <select value={year} onChange={(e) => setYear(e.target.value)} className={INPUT_CLS}>
                      {["Freshman", "Sophomore", "Junior", "Senior", "Grad"].map((y) => (
                        <option key={y}>{y}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Bio">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className={`${INPUT_CLS} resize-none`}
                    placeholder="Tell other students about yourself..."
                  />
                </Field>
              </div>
            </section>
          )}

          {/* ── Study Preferences Tab ── */}
          {activeTab === "Study Preferences" && (
            <section>
              <h2 className="mb-1 text-[22px] font-extrabold tracking-tight">Study Preferences</h2>
              <p className="mb-8 text-[14px] text-[var(--color-text-secondary)]">
                These are used to find your best matches.
              </p>

              <div className="flex flex-col gap-6">

                {/* Study methods */}
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Study methods</p>
                  <div className="flex flex-wrap gap-2">
                    {STUDY_METHODS.map((m) => (
                      <button
                        key={m}
                        onClick={() => toggleMethod(m)}
                        className={`rounded-full border-[1.5px] px-4 py-2 text-[13px] font-semibold transition-all ${
                          studyMethods.includes(m)
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                            : "border-[var(--color-border)] hover:border-[var(--color-primary-muted)]"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Group size + environment */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Group size">
                    <select value={groupSize} onChange={(e) => setGroupSize(e.target.value)} className={INPUT_CLS}>
                      {["1-on-1", "Small (2-3)", "Any"].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Environment">
                    <select value={environment} onChange={(e) => setEnvironment(e.target.value)} className={INPUT_CLS}>
                      <option>Silent (Library Level 5)</option>
                      <option>Quiet (Library Level 3)</option>
                      <option>Collaborative (Study Room)</option>
                      <option>Cafe Environment</option>
                    </select>
                  </Field>
                </div>

                <Field label="Preferred study spot">
                  <select value={studySpot} onChange={(e) => setStudySpot(e.target.value)} className={INPUT_CLS}>
                    {["PCL (Library)", "FAC", "Union", "Starbucks", "My Apartment", "Other"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
            </section>
          )}

          {/* ── Notifications Tab ── */}
          {activeTab === "Notifications" && (
            <section>
              <h2 className="mb-1 text-[22px] font-extrabold tracking-tight">Notifications</h2>
              <p className="mb-8 text-[14px] text-[var(--color-text-secondary)]">Choose what you get notified about.</p>
              <div className="flex flex-col divide-y divide-[var(--color-border-light)] rounded-2xl border border-[var(--color-border)] bg-white overflow-hidden">
                {(Object.entries(notifs) as [keyof typeof notifs, boolean][]).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-[13px] font-semibold text-[var(--color-text-base)]">{NOTIF_LABELS[key]}</p>
                      <p className="text-[11px] text-[var(--color-text-muted)]">{NOTIF_DESC[key]}</p>
                    </div>
                    <Toggle on={val} onToggle={() => setNotifs((prev) => ({ ...prev, [key]: !val }))} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Account Tab ── */}
          {activeTab === "Account" && (
            <section>
              <h2 className="mb-1 text-[22px] font-extrabold tracking-tight">Account</h2>
              <p className="mb-8 text-[14px] text-[var(--color-text-secondary)]">Manage your account and connected integrations.</p>

              <div className="flex flex-col gap-5">
                {/* Connected integrations */}
                <div className="rounded-2xl border border-[var(--color-border)] bg-white overflow-hidden">
                  <div className="border-b border-[var(--color-border-light)] px-5 py-4">
                    <p className="text-[13px] font-bold">Connected Integrations</p>
                  </div>
                  <div className="divide-y divide-[var(--color-border-light)]">
                    {[
                      { name: "myUT Portal",      connected: true,  sub: "Schedule imported" },
                      { name: "Google Calendar",  connected: false, sub: "Not connected" },
                      { name: "Canvas LMS",       connected: false, sub: "Not connected" },
                      { name: "Notion",           connected: false, sub: "Not connected" },
                      { name: "Google Drive",     connected: false, sub: "Not connected" },
                    ].map((int) => (
                      <div key={int.name} className="flex items-center justify-between px-5 py-3.5">
                        <div>
                          <p className="text-[13px] font-semibold">{int.name}</p>
                          <p className="text-[11px] text-[var(--color-text-muted)]">{int.sub}</p>
                        </div>
                        <button
                          className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all ${
                            int.connected
                              ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                              : "border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-primary-muted)] hover:text-[var(--color-primary)]"
                          }`}
                        >
                          {int.connected ? "Disconnect" : "Connect"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger zone */}
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                  <p className="mb-1 text-[13px] font-bold text-red-700">Danger Zone</p>
                  <p className="mb-4 text-[12px] text-red-500">These actions are permanent and cannot be undone.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        if (!user) return;
                        const supabase = createClient();
                        await supabase.from("users").update({
                          preferences: {},
                          availability: {},
                        }).eq("id", user.id);
                        window.location.reload();
                      }}
                      className="rounded-xl border border-red-300 bg-white px-4 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Reset Preferences
                    </button>
                    <button
                      onClick={async () => {
                        if (!user) return;
                        if (!confirm("Delete your account? This cannot be undone.")) return;
                        const supabase = createClient();
                        // Delete auth user — cascade wipes all public.users data
                        await supabase.auth.admin?.deleteUser(user.id);
                        await supabase.auth.signOut();
                        router.push("/");
                      }}
                      className="rounded-xl bg-red-600 px-4 py-2 text-[13px] font-bold text-white hover:bg-red-700 transition-colors"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Save button */}
          {activeTab !== "Account" && (
            <div className="mt-8">
              <button
                onClick={handleSave}
                disabled={saving || !user}
                className="rounded-xl bg-[var(--color-primary)] px-8 py-3 text-[14px] font-bold text-white shadow-[var(--shadow-primary)] transition-all hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Sub-components ── */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        on ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
          on ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

const INPUT_CLS = "h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm text-[var(--color-text-base)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">{label}</label>
      {children}
    </div>
  );
}

const NOTIF_LABELS: Record<string, string> = {
  sessionRequests: "Session Requests",
  sessionAccepted: "Session Accepted",
  sessionReminders: "Session Reminders",
  messages:         "Messages",
  weeklyDigest:     "Weekly Digest",
  marketingEmails:  "Marketing Emails",
};
const NOTIF_DESC: Record<string, string> = {
  sessionRequests:  "When someone requests a study session with you",
  sessionAccepted:  "When your request is accepted by a partner",
  sessionReminders: "15-minute reminder before a session starts",
  messages:         "Direct messages from study partners",
  weeklyDigest:     "Summary of your activity and new matches",
  marketingEmails:  "Product updates and feature announcements",
};

function TabIcon({ tab, active }: { tab: Tab; active: boolean }) {
  const stroke = active ? "white" : "currentColor";
  const w = 14;
  switch (tab) {
    case "Profile":
      return <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case "Study Preferences":
      return <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
    case "Notifications":
      return <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
    case "Account":
      return <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    default:
      return null;
  }
}
