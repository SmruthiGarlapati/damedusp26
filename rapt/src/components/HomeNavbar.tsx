"use client";

import Link from "next/link";
import { RaptLogo } from "@/components/RaptLogo";

const ANCHORS = [
  { label: "Features", hash: "features" },
  { label: "How it works", hash: "how-it-works" },
] as const;

const linkClass =
  "inline-flex min-h-9 items-center rounded-lg px-3 text-[15px] font-semibold leading-none tracking-tight text-white/66 hover:bg-white/[0.06] hover:text-white sm:min-h-9 sm:px-3.5";

export default function HomeNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0c180c]/85 font-sans backdrop-blur-xl supports-[backdrop-filter]:bg-[#0c180c]/72">
      <nav
        className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:gap-6 sm:px-6"
        aria-label="Primary"
        style={{ fontFamily: "var(--font-baloo), system-ui, -apple-system" }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-8">
          <Link
            href="/"
            className="inline-flex shrink-0 translate-y-0.5 items-center justify-center opacity-95 hover:opacity-100 sm:translate-y-1"
            aria-label="RAPT home"
          >
            <RaptLogo
              priority
              className="h-9 w-auto max-h-10 object-contain object-left sm:h-10"
            />
          </Link>
          <ul className="flex min-w-0 flex-wrap items-center gap-0.5 sm:gap-1.5">
            {ANCHORS.map(({ label, hash }) => (
              <li key={hash} className="flex items-center">
                <a href={`#${hash}`} className={linkClass}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link href="/login?next=/matches" className={linkClass}>
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 text-[15px] font-bold leading-none tracking-tight text-white shadow-[var(--shadow-primary)] hover:bg-[var(--color-primary-hover)] sm:min-h-9 sm:px-5"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
