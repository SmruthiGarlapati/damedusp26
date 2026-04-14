import { Suspense } from "react";
import { WordSniperIcon } from "../components/gameChrome";
import { GeneratedGamePage } from "../components/generatedGamePage";

export default function WordSniperPage() {
  return (
    <Suspense fallback={null}>
      <GeneratedGamePage
        gameId="fill"
        title="Word Sniper"
        description="Snap to the missing term fast and prove you can spot the exact language from your study notes."
        Icon={WordSniperIcon}
      />
    </Suspense>
  );
}
