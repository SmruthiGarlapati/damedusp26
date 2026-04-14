import { Suspense } from "react";
import { FlipMatchIcon } from "../components/gameChrome";
import { GeneratedGamePage } from "../components/generatedGamePage";

export default function FlipMatchPage() {
  return (
    <Suspense fallback={null}>
      <GeneratedGamePage
        gameId="match"
        title="Flip Match"
        description="Lock terms and definitions together before the board closes and the round is done."
        Icon={FlipMatchIcon}
      />
    </Suspense>
  );
}
