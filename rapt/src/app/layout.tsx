import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" className={inter.className}>
        <body suppressHydrationWarning className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-base)] antialiased">
        {children}
      </body>
    </html>
  );
}
