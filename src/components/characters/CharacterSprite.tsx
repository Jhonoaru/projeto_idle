import { useEffect, useState } from "react";
import { getCharacterSprite } from "../../data/characterSprites";
import { getCollectionSprite } from "../../data/collectionSprites";
import { CollectionPreview } from "../collections/CollectionPreview";
import type { Character, CollectionItem } from "../../shared/types";

type CharacterSpriteSize = "small" | "medium" | "large" | "scene";

interface CharacterSpriteProps {
  character: Pick<Character, "id" | "name">;
  className?: string;
  fallbackSymbol?: string;
  avatar?: CollectionItem;
  size?: CharacterSpriteSize;
}

export function CharacterSprite({
  character,
  className = "",
  fallbackSymbol,
  avatar,
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
      aria-label={`${character.name} character portrait${avatar ? ` / ${avatar.name}` : ""}`}
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
      {avatar && getCollectionSprite(avatar.id) ? (
        <span className="character-avatar-emblem" title={avatar.name}>
          <CollectionPreview item={avatar} />
        </span>
      ) : null}
    </span>
  );
}
