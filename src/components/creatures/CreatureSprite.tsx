import { useEffect, useState } from "react";
import { getCreatureSprite } from "../../data/creatureSprites";
import type { Monster } from "../../shared/types";

interface CreatureSpriteProps {
  monster?: Monster;
  fallbackSymbol?: string;
  size?: "small" | "medium" | "large";
  className?: string;
}

function getFallbackSymbol(monster?: Monster, fallbackSymbol?: string): string {
  if (fallbackSymbol) return fallbackSymbol;
  if (!monster) return "?";

  return monster.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CreatureSprite({
  monster,
  fallbackSymbol,
  size = "medium",
  className = "",
}: CreatureSpriteProps) {
  const sprite = getCreatureSprite(monster?.id);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [sprite?.src]);

  return (
    <span
      aria-label={monster?.name ?? "Unknown creature"}
      className={`creature-sprite creature-sprite-${size} ${className}`.trim()}
      role="img"
    >
      {sprite && !imageFailed ? (
        <img
          alt=""
          aria-hidden="true"
          decoding="async"
          onError={() => setImageFailed(true)}
          src={sprite.src}
        />
      ) : (
        <span aria-hidden="true">{getFallbackSymbol(monster, fallbackSymbol)}</span>
      )}
    </span>
  );
}
