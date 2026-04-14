import { Baloo_Bhaijaan_2 } from "next/font/google";

/**
 * App-wide font — [Baloo Bhaijaan 2](https://fonts.google.com/specimen/Baloo+Bhaijaan+2?preview.lang=en_Latn)
 * Used for body, UI, and headings (via `--font-sans` + `--font-display`).
 */
export const fontBaloo = Baloo_Bhaijaan_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-baloo",
});
