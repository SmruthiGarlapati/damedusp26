"use client";

import Image from "next/image";

const SRC = "/rapt-logo.png";
const INTRINSIC_W = 386;
const INTRINSIC_H = 220;

type RaptLogoProps = {
  className?: string;
  priority?: boolean;
};

/**
 * Official wordmark (PNG). Use instead of plain-text “RAPT” for branding.
 */
export function RaptLogo({
  className = "h-12 w-auto max-h-14 object-contain object-center sm:h-[3.5rem] sm:max-h-[3.75rem] md:h-[3.75rem] md:max-h-16",
  priority = false,
}: RaptLogoProps) {
  return (
    <Image
      src={SRC}
      alt=""
      width={INTRINSIC_W}
      height={INTRINSIC_H}
      priority={priority}
      sizes="(max-width: 640px) 240px, 280px"
      className={className}
    />
  );
}

/** Login / signup marketing column: large wordmark; parent may use `lg:fixed` for a pinned header logo. */
export function RaptLogoAuthHero({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={SRC}
      alt=""
      width={INTRINSIC_W}
      height={INTRINSIC_H}
      priority={priority}
      sizes="(max-width: 1024px) 280px, 360px"
      className={`h-16 w-auto max-h-none object-contain object-center sm:h-20 lg:h-[6.5rem] lg:max-h-[7rem] lg:object-left ${className}`}
    />
  );
}

/** Smaller lockup for footer or compact layouts. */
export function RaptLogoSm({
  className = "h-9 w-auto max-h-10 object-contain object-center sm:h-10 sm:max-h-11",
}: {
  className?: string;
}) {
  return (
    <Image
      src={SRC}
      alt=""
      width={INTRINSIC_W}
      height={INTRINSIC_H}
      sizes="160px"
      className={className}
    />
  );
}
