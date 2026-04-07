import type { Metadata } from "next";
import Script from "next/script";
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
    <html lang="en">
      <body suppressHydrationWarning className="min-h-screen text-[var(--color-text-base)] antialiased">
        {children}
        <Script src="https://mcp.figma.com/mcp/html-to-design/capture.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
