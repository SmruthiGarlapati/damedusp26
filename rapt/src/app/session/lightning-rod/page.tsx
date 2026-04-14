import { Suspense } from "react";
import { LightningRodIcon } from "../components/gameChrome";
import { GeneratedGamePage } from "../components/generatedGamePage";

export default function LightningRodPage() {
  return (
    <Suspense fallback={null}>
      <GeneratedGamePage
        gameId="speed"
        title="Lightning Rod"
        description="Rip through a timed true-or-false round built from the exact ideas you just studied."
        Icon={LightningRodIcon}
      />
    </Suspense>
  );
}
