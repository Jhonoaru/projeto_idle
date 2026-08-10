import { useEffect, useState } from "react";
import { getBossArenaBackgroundMeta } from "../../game-engine/boss-scene/getBossArenaBackgroundMeta";
import type { Boss } from "../../shared/types";

interface BossArenaBackgroundProps { boss?: Boss; }

export function BossArenaBackground({ boss }: BossArenaBackgroundProps) {
  const arena = getBossArenaBackgroundMeta(boss);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [arena.src]);

  return (
    <div aria-hidden="true" className={`boss-arena-background ${arena.className} ${arena.src && !imageFailed ? "has-arena-art" : "uses-arena-fallback"}`}>
      {arena.src && !imageFailed ? <img alt="" draggable={false} onError={() => setImageFailed(true)} src={arena.src} /> : null}
      <span>{arena.label}</span>
    </div>
  );
}
