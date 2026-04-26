import type { Metadata } from "next";
import NextErrorSuppressor from "@/components/NextErrorSuppressor";
import { fontBaloo } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAPT — Study Partner Matching",
  description:
    "Sync your academic life. Find the perfect study partners and blocks in your week.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontBaloo.variable}>
      <body suppressHydrationWarning className="min-h-screen font-sans text-[var(--color-text-base)] antialiased">
        <NextErrorSuppressor />
        {children}
      </body>
    </html>
  );
}
