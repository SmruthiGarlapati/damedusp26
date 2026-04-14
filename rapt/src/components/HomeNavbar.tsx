"use client";

import Link from "next/link";
import { RaptLogo } from "@/components/RaptLogo";

const ANCHORS = [
  { label: "Features", hash: "features" },
  { label: "How it works", hash: "how-it-works" },
] as const;

const linkClass =
  "inline-flex min-h-[2.75rem] items-center rounded-lg px-3.5 text-[17px] font-semibold leading-none tracking-tight text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white sm:min-h-[3rem] sm:px-4 sm:text-[18px]";

export default function HomeNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0c180c]/85 font-sans backdrop-blur-xl supports-[backdrop-filter]:bg-[#0c180c]/72">
      <nav
        className="mx-auto flex min-h-[5rem] max-w-6xl items-center justify-between gap-4 px-4 sm:min-h-[5.25rem] sm:gap-8 sm:px-6"
        aria-label="Primary"
        style={{ fontFamily: "var(--font-baloo), system-ui, -apple-system" }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-5 sm:gap-10">
          <Link
            href="/"
            className="inline-flex shrink-0 translate-y-1.5 items-center justify-center opacity-95 transition-opacity hover:opacity-100 sm:translate-y-2"
            aria-label="RAPT home"
          >
            <RaptLogo
              priority
              className="h-11 w-auto max-h-12 object-contain object-left sm:h-12 sm:max-h-[3.25rem] md:h-[3.35rem]"
            />
          </Link>
          <ul className="flex min-w-0 flex-wrap items-center gap-0.5 sm:gap-1">
            {ANCHORS.map(({ label, hash }) => (
              <li key={hash} className="flex items-center">
                <a href={`#${hash}`} className={linkClass}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <Link href="/login" className={linkClass}>
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex min-h-[2.75rem] items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-[17px] font-bold leading-none tracking-tight text-white shadow-[var(--shadow-primary)] transition-all hover:bg-[var(--color-primary-hover)] hover:-translate-y-px sm:min-h-[3rem] sm:px-6 sm:text-[18px]"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
