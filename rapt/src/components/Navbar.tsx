"use client";

import Link from "next/link";
import { RaptLogo } from "@/components/RaptLogo";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { clearDemoAdminSession, isDemoAdminUser, isSupabaseAuthConfigured } from "@/lib/demoAdmin";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/lib/useCurrentUser";

const navLinks = [
  { label: "Schedule", href: "/schedule" },
  { label: "Matches", href: "/matches" },
  { label: "Sessions", href: "/sessions" },
];

const navLinkClass = (active: boolean) =>
  `inline-flex min-h-9 items-center rounded-lg px-3 text-[15px] font-semibold leading-none tracking-tight transition-all sm:min-h-9 sm:px-3.5 sm:text-[16px] ${
    active ? "text-[#c8e898]" : "text-white/55 hover:bg-white/[0.06] hover:text-white/90"
  }`;

interface NavbarProps {
  /** Peer search field in nav (default: true) */
  showSearch?: boolean;
}

function NavbarInner({ showSearch = true }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
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

  useEffect(() => {
    if (!pathname.startsWith("/matches")) return;
    const q = searchParams.get("q") ?? "";
    setSearch(q);
  }, [pathname, searchParams]);

  async function handleSignOut() {
    clearDemoAdminSession();

    if (isSupabaseAuthConfigured() && !isDemoUser) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }

    setMenuOpen(false);
    router.push("/");
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    if (q) {
      router.push(`/matches?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/matches");
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0c180c]/90 font-sans backdrop-blur-xl supports-[backdrop-filter]:bg-[#0c180c]/78">
      <nav
        className="mx-auto flex min-h-[3.75rem] max-w-6xl items-center justify-between gap-2 px-4 py-1 sm:gap-3 sm:px-6"
        aria-label="Main"
        style={{ fontFamily: "var(--font-baloo), system-ui, -apple-system" }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-4">
          <Link
            href="/"
            className="inline-flex shrink-0 translate-y-0.5 items-center justify-center opacity-95 transition-opacity hover:opacity-100 sm:translate-y-1"
            aria-label="RAPT home"
          >
            <RaptLogo className="h-11 w-auto max-h-12 object-contain object-left sm:h-12 sm:max-h-[3.25rem]" />
          </Link>

          <div className="hidden h-7 w-px shrink-0 bg-white/15 sm:block" aria-hidden />

          <div className="flex min-w-0 flex-wrap items-center gap-0.5 sm:gap-1">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link key={link.label} href={link.href} className={navLinkClass(isActive)}>
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {showSearch && (
            <form
              onSubmit={handleSearchSubmit}
              className="hidden min-w-0 md:flex md:max-w-[min(22rem,40vw)] md:flex-1 lg:max-w-md"
            >
              <div className="relative w-full">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-white/35">
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <circle cx="8" cy="8" r="6" />
                    <line x1="13" y1="13" x2="17" y2="17" />
                  </svg>
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search peers..."
                  className="h-9 w-full rounded-md border border-white/15 bg-white/[0.06] py-1.5 pl-8 pr-2.5 text-[14px] text-white outline-none placeholder:text-white/35 focus:border-white/25 focus:ring-1 focus:ring-white/10 sm:h-10 sm:text-[15px]"
                  aria-label="Search peers"
                />
              </div>
            </form>
          )}

          <div className="relative flex items-center" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e85a0a] text-[11px] font-bold text-white shadow-md transition-all hover:scale-[1.03] hover:bg-[#ff7c38] sm:h-10 sm:w-10 sm:text-[12px]"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label="Account menu"
            >
              {loading ? "…" : initials}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#1e3d1e] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="border-b border-white/10 bg-[#152b15] px-5 py-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e85a0a] text-[14px] font-bold text-white">
                      {initials}
                    </div>
                    <div>
                      <div className="text-[16px] font-bold text-white">
                        {loading ? "Loading…" : (user?.full_name ?? "Guest")}
                      </div>
                      <div className="text-[13px] text-[#72b84a]">{user?.email ?? ""}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: user ? user.overall_rating.toFixed(1) : "—", lbl: "Rating" },
                      { val: user ? user.sessionsCompleted : "—", lbl: "Sessions" },
                      { val: yearShort, lbl: "Year" },
                    ].map((s) => (
                      <div key={s.lbl} className="rounded-lg bg-white/5 px-2 py-1.5 text-center">
                        <div className="rapt-display text-[17px] font-bold text-[#ff7c38]">{s.val}</div>
                        <div className="text-[11px] font-medium text-white/40">{s.lbl}</div>
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
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        router.push(item.href);
                      }}
                      className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-white/5"
                    >
                      <div>
                        <div className="text-[15px] font-semibold text-white">{item.label}</div>
                        <div className="text-[13px] text-white/40">{item.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="border-t border-white/10 px-5 py-3">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-[15px] font-semibold text-[#e85a0a] transition-colors hover:text-[#ff7c38]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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

      {showSearch && (
        <form
          onSubmit={handleSearchSubmit}
          className="mx-auto flex w-full max-w-6xl items-center border-t border-white/[0.06] px-4 py-2 md:hidden"
        >
          <div className="relative w-full">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-white/35">
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <circle cx="8" cy="8" r="6" />
                <line x1="13" y1="13" x2="17" y2="17" />
              </svg>
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search peers..."
              className="h-9 w-full rounded-md border border-white/15 bg-white/[0.06] py-1.5 pl-8 pr-2.5 text-[14px] text-white outline-none placeholder:text-white/35 focus:border-white/25 focus:ring-1 focus:ring-white/10"
              aria-label="Search peers"
            />
          </div>
        </form>
      )}
    </header>
  );
}

function NavbarFallback() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0c180c]/90 font-sans backdrop-blur-xl supports-[backdrop-filter]:bg-[#0c180c]/78">
      <div className="mx-auto min-h-[3.75rem] max-w-6xl px-4 py-1 sm:px-6" aria-hidden />
    </header>
  );
}

export default function Navbar(props: NavbarProps) {
  return (
    <Suspense fallback={<NavbarFallback />}>
      <NavbarInner {...props} />
    </Suspense>
  );
}
