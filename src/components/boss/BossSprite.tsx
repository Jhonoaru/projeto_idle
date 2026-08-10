import { useEffect, useState } from "react";
import { getBossSprite } from "../../data/bossSprites";
import type { Boss } from "../../shared/types";

interface BossSpriteProps {
  boss?: Boss;
  fallbackSymbol?: string;
  size?: "small" | "medium" | "large" | "scene";
  className?: string;
}

function getFallbackSymbol(boss?: Boss, fallbackSymbol?: string): string {
  if (fallbackSymbol) return fallbackSymbol;
  if (!boss) return "?";

  return boss.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function BossSprite({ boss, fallbackSymbol, size = "medium", className = "" }: BossSpriteProps) {
  const sprite = getBossSprite(boss?.id);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [sprite?.src]);

  return (
    <span
      aria-label={boss?.name ?? "Unknown boss"}
      className={`boss-sprite boss-sprite-${size} ${className}`.trim()}
      role="img"
    >
      {sprite && !imageFailed ? (
        <img alt="" aria-hidden="true" decoding="async" onError={() => setImageFailed(true)} src={sprite.src} />
      ) : (
        <span aria-hidden="true">{getFallbackSymbol(boss, fallbackSymbol)}</span>
      )}
    </span>
  );
}
