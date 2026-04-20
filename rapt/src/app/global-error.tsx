"use client";

import AppStatusScreen from "@/components/AppStatusScreen";
import { fontBaloo } from "./fonts";
import "./globals.css";

type AppGlobalErrorPageProps = {
  error?: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
};

export default function GlobalError({ reset, unstable_retry }: AppGlobalErrorPageProps) {
  return (
    <html lang="en" className={fontBaloo.variable}>
      <head>
        <title>RAPT | Something went wrong</title>
      </head>
      <body className="min-h-screen font-sans text-[var(--color-text-base)] antialiased">
        <AppStatusScreen
          title="We couldn't load this page"
          message="A root-level failure was caught before Next.js could show its built-in global error UI. Try reloading the page or return to the homepage."
          actionLabel="Reload page"
          onAction={unstable_retry ?? reset}
        />
      </body>
    </html>
  );
}
