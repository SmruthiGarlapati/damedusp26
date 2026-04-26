"use client";

import type { CSSProperties } from "react";

const SRC = "/rapt-logo.png";
const INTRINSIC_W = 386;
const INTRINSIC_H = 220;
const BASE_MASK_STYLE: CSSProperties = {
  aspectRatio: `${INTRINSIC_W} / ${INTRINSIC_H}`,
  WebkitMaskImage: `url(${SRC})`,
  maskImage: `url(${SRC})`,
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskSize: "contain",
  maskSize: "contain",
};
const BRANDED_FILL_STYLE: CSSProperties = {
  background:
    "linear-gradient(120deg, rgba(45, 38, 31, 0.96) 8%, rgba(67, 100, 133, 0.96) 56%, rgba(122, 162, 198, 0.92) 100%)",
  filter:
    "drop-shadow(0 4px 14px rgba(67, 100, 133, 0.18)) drop-shadow(0 0 10px rgba(255, 255, 255, 0.22))",
};

type RaptLogoProps = {
  className?: string;
  priority?: boolean;
};

/**
 * Official wordmark, recolored via a mask so it stays legible on the light RAPT shell.
 */
export function RaptLogo({
  className = "h-12 w-auto max-h-14 object-contain object-center sm:h-[3.5rem] sm:max-h-[3.75rem] md:h-[3.75rem] md:max-h-16",
}: RaptLogoProps) {
  return (
    <span
      aria-hidden
      className={className}
      style={{ ...BASE_MASK_STYLE, ...BRANDED_FILL_STYLE }}
    />
  );
}

/** Login / signup marketing column: large wordmark; parent may use `lg:fixed` for a pinned header logo. */
export function RaptLogoAuthHero({
  className = "",
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={`h-16 w-auto max-h-none object-contain object-center sm:h-20 lg:h-[6.5rem] lg:max-h-[7rem] lg:object-left ${className}`}
      style={{ ...BASE_MASK_STYLE, ...BRANDED_FILL_STYLE }}
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
    <span
      aria-hidden
      className={className}
      style={{ ...BASE_MASK_STYLE, ...BRANDED_FILL_STYLE }}
    />
  );
}
