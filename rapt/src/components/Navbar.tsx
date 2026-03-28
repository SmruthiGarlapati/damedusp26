"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Schedule", href: "/schedule" },
  { label: "Matching", href: "/matching" },
  { label: "Browse", href: "/matches" },
  { label: "Sessions", href: "/sessions" },
];

interface NavbarProps {
  showSearch?: boolean;
}

export default function Navbar({ showSearch = false }: NavbarProps) {
  const pathname = usePathname();

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
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-white transition-opacity hover:opacity-90">
          <UserIcon />
        </button>
      </div>
    </nav>
  );
}

function SearchIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="8" cy="8" r="6" />
      <line x1="13" y1="13" x2="17" y2="17" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
