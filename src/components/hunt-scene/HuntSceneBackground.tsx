import { useEffect, useState } from "react";
import { getHuntSceneBackgroundMeta } from "../../game-engine/hunt-scene/getHuntSceneBackgroundMeta";
import type { HuntArea } from "../../shared/types";

interface HuntSceneBackgroundProps {
  hunt?: HuntArea;
}

export function HuntSceneBackground({ hunt }: HuntSceneBackgroundProps) {
  const background = getHuntSceneBackgroundMeta(hunt);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [background.src]);

  return (
    <div
      className={`hunt-scene-background ${background.className} ${background.src && !imageFailed ? "has-scene-art" : "uses-scene-fallback"}`}
      aria-hidden="true"
    >
      {background.src && !imageFailed ? (
        <img alt="" draggable={false} onError={() => setImageFailed(true)} src={background.src} />
      ) : null}
      <span>{background.label}</span>
    </div>
  );
}
