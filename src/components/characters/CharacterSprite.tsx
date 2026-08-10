import { useEffect, useState } from "react";
import { getCharacterSprite } from "../../data/characterSprites";
import type { Character } from "../../shared/types";

type CharacterSpriteSize = "small" | "medium" | "large" | "scene";

interface CharacterSpriteProps {
  character: Pick<Character, "id" | "name">;
  className?: string;
  fallbackSymbol?: string;
  size?: CharacterSpriteSize;
}

export function CharacterSprite({
  character,
  className = "",
  fallbackSymbol,
  size = "medium",
}: CharacterSpriteProps) {
  const sprite = getCharacterSprite(character.id);
  const [failed, setFailed] = useState(false);
  const initials = fallbackSymbol ?? character.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => setFailed(false), [sprite?.src]);

  return (
    <span
      aria-label={`${character.name} character portrait`}
      className={`character-sprite character-sprite-${size} ${className}`.trim()}
      role="img"
    >
      {sprite && !failed ? (
        <img
          alt=""
          aria-hidden="true"
          decoding="async"
          onError={() => setFailed(true)}
          src={sprite.src}
        />
      ) : (
        <strong className="character-sprite-fallback">{initials || "?"}</strong>
      )}
    </span>
  );
}
