"use client";

import AppStatusScreen from "@/components/AppStatusScreen";

type AppErrorPageProps = {
  error?: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
};

export default function ErrorPage({ reset, unstable_retry }: AppErrorPageProps) {
  return (
    <AppStatusScreen
      title="Something went wrong"
      message="We hit an unexpected problem and replaced the default Next.js error screen with this fallback. Try reloading this view or head back home."
      actionLabel="Reload this view"
      onAction={unstable_retry ?? reset}
    />
  );
}
