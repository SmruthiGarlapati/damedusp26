import { Suspense } from "react";
import { BrainBlastIcon } from "../components/gameChrome";
import { GeneratedGamePage } from "../components/generatedGamePage";

export default function BrainBlastPage() {
  return (
    <Suspense fallback={null}>
      <GeneratedGamePage
        gameId="logic"
        title="Brain Blast"
        description="Reason through tricky scenarios pulled from your notes and choose the sharpest explanation."
        Icon={BrainBlastIcon}
      />
    </Suspense>
  );
}
