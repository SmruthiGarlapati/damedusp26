"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clearDemoAdminSession, isDemoAdminUser, isSupabaseAuthConfigured } from "@/lib/demoAdmin";
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
  const [search, setSearch] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useCurrentUser();
  const isDemoUser = isDemoAdminUser(user);

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
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
    clearDemoAdminSession();

    if (isSupabaseAuthConfigured() && !isDemoUser) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }

    setMenuOpen(false);
    router.push("/");
  }

  return (
    <nav
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-white/10 bg-[#0f1f0f]/95 px-6 backdrop-blur-sm"
    >
      <Link
        href="/"
        style={{ fontFamily: "'Fraunces', serif" }}
        className="shrink-0 text-[22px] font-black tracking-tight text-white transition-colors hover:text-[#c8e898]"
      >
        RAPT
      </Link>

      <div className="h-5 w-px shrink-0 bg-white/15" />

      <div className="flex flex-1 items-center gap-1">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-all ${
                isActive
                  ? "bg-[#1e3d1e] text-[#c8e898]"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-3">
        {showSearch && (
          <div className="relative w-48">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
              <svg
                width="14"
                height="14"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="8" cy="8" r="6" />
                <line x1="13" y1="13" x2="17" y2="17" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search peers..."
              className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 text-[13px] text-white outline-none transition-all placeholder:text-white/30 focus:border-[#72b84a] focus:bg-white/10"
            />
          </div>
        )}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e85a0a] text-[12px] font-bold text-white transition-all hover:scale-105 hover:bg-[#ff7c38]"
          >
            {loading ? "…" : initials}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#1e3d1e] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <div className="border-b border-white/10 bg-[#152b15] px-5 py-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e85a0a] text-[13px] font-bold text-white">
                    {initials}
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-white">
                      {loading ? "Loading…" : (user?.full_name ?? "Guest")}
                    </div>
                    <div className="text-[11px] text-[#72b84a]">{user?.email ?? ""}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: user ? user.overall_rating.toFixed(1) : "—", lbl: "Rating" },
                    { val: user ? user.sessionsCompleted : "—", lbl: "Sessions" },
                    { val: yearShort, lbl: "Year" },
                  ].map((s) => (
                    <div key={s.lbl} className="rounded-lg bg-white/5 px-2 py-1.5 text-center">
                      <div
                        style={{ fontFamily: "'Fraunces', serif" }}
                        className="text-[15px] font-black text-[#ff7c38]"
                      >
                        {s.val}
                      </div>
                      <div className="text-[10px] font-medium text-white/40">{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="py-2">
                {[
                  {
                    label: "Profile & Settings",
                    sub: major && year ? `${major} · ${year}` : "Edit your profile",
                    href: "/settings",
                  },
                  { label: "My Schedule", sub: "Edit courses & availability", href: "/schedule" },
                  {
                    label: "My Sessions",
                    sub: user ? `${user.sessionsCompleted} completed` : "View sessions",
                    href: "/sessions",
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setMenuOpen(false);
                      router.push(item.href);
                    }}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-white/5"
                  >
                    <div>
                      <div className="text-[13px] font-semibold text-white">{item.label}</div>
                      <div className="text-[11px] text-white/40">{item.sub}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t border-white/10 px-5 py-3">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-[13px] font-semibold text-[#e85a0a] transition-colors hover:text-[#ff7c38]"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
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
