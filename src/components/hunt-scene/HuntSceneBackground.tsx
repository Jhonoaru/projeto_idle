import { getHuntSceneBackgroundMeta } from "../../game-engine/hunt-scene/getHuntSceneBackgroundMeta";
import type { HuntArea } from "../../shared/types";

interface HuntSceneBackgroundProps {
  hunt?: HuntArea;
}

export function HuntSceneBackground({ hunt }: HuntSceneBackgroundProps) {
  const background = getHuntSceneBackgroundMeta(hunt);

  return (
    <div className={`hunt-scene-background ${background.className}`} aria-hidden="true">
      <span>{background.label}</span>
    </div>
  );
}
