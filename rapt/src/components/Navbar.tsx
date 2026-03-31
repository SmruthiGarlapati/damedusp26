"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/lib/useCurrentUser";

const navLinks = [
  { label: "Schedule", href: "/schedule" },
  { label: "Matches", href: "/matches" },
  { label: "Sessions", href: "/sessions" },
];

interface NavbarProps {
  showSearch?: boolean;
}

export default function Navbar({ showSearch = false }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useCurrentUser();

  const initials = user
    ? user.full_name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  const prefs = user?.preferences ?? {};
  const major = (prefs.major as string) ?? "";
  const year = (prefs.year as string) ?? "";
  const yearShort = year ? year.slice(0, 2) : "—";

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
  }

  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center border-b border-[var(--color-border)] bg-white px-8 shadow-[var(--shadow-sm)]">
      {/* Logo */}
      <Link
        href="/"
        className="mr-6 shrink-0 text-[22px] font-extrabold tracking-tight text-[var(--color-primary)]"
      >
        RAPT
      </Link>

      {/* Divider */}
      <div className="mr-6 h-6 w-px shrink-0 bg-[var(--color-border)]" />

      {/* Nav links */}
      <div className="flex flex-1 items-center gap-1">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                isActive
                  ? "font-semibold text-[var(--color-primary)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-base)]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {showSearch && (
          <div className="relative w-52">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search peers..."
              className="h-9 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 text-[13px] text-[var(--color-text-base)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:bg-white"
            />
          </div>
        )}

        {/* Account avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-[13px] font-bold text-white transition-all hover:opacity-90 hover:ring-2 hover:ring-[var(--color-primary)] hover:ring-offset-2"
          >
            {loading ? "…" : initials}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 w-64 rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-lg)] overflow-hidden">
              {/* Profile header */}
              <div className="bg-[var(--color-primary)] px-5 py-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-[15px] font-bold">
                    {initials}
                  </div>
                  <div>
                    <div className="text-[14px] font-bold">
                      {loading ? "Loading…" : (user?.full_name ?? "Guest")}
                    </div>
                    <div className="text-[11px] text-white/70">
                      {user?.email ?? ""}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-center">
                    <div className="text-[16px] font-extrabold">
                      {user ? user.overall_rating.toFixed(1) : "—"}
                    </div>
                    <div className="text-[10px] text-white/60">Rating</div>
                  </div>
                  <div className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-center">
                    <div className="text-[16px] font-extrabold">
                      {user ? user.sessionsCompleted : "—"}
                    </div>
                    <div className="text-[10px] text-white/60">Sessions</div>
                  </div>
                  <div className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-center">
                    <div className="text-[14px] font-extrabold">{yearShort}</div>
                    <div className="text-[10px] text-white/60">Year</div>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-2">
                {[
                  {
                    icon: <UserMenuIcon />,
                    label: "Profile & Settings",
                    sub: major && year ? `${major} · ${year}` : "Edit your profile",
                    onClick: () => { setMenuOpen(false); router.push("/settings"); },
                  },
                  {
                    icon: <CalMenuIcon />,
                    label: "My Schedule",
                    sub: "Edit courses & availability",
                    onClick: () => { setMenuOpen(false); router.push("/schedule"); },
                  },
                  {
                    icon: <SessionMenuIcon />,
                    label: "My Sessions",
                    sub: user ? `${user.sessionsCompleted} completed` : "View sessions",
                    onClick: () => { setMenuOpen(false); router.push("/sessions"); },
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-[var(--color-surface)]"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface)] text-[var(--color-text-secondary)]">
                      {item.icon}
                    </span>
                    <div>
                      <div className="text-[13px] font-semibold text-[var(--color-text-base)]">{item.label}</div>
                      <div className="text-[11px] text-[var(--color-text-muted)]">{item.sub}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Sign out */}
              <div className="border-t border-[var(--color-border)] px-5 py-3">
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 text-[13px] font-semibold text-red-500 hover:text-red-600"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ── Icons ── */
function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="8" cy="8" r="6" /><line x1="13" y1="13" x2="17" y2="17" />
    </svg>
  );
}
function UserMenuIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function CalMenuIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function SessionMenuIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}
