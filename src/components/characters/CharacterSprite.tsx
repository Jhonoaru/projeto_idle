import { useState } from "react";
import { getCharacterSprite } from "../../data/characterSprites";
import { getCollectionSprite, getOutfitSprite } from "../../data/collectionSprites";
import { CollectionPreview } from "../collections/CollectionPreview";
import type { Character, CollectionItem } from "../../shared/types";

type CharacterSpriteSize = "small" | "medium" | "large" | "scene";

interface CharacterSpriteProps {
  character: Pick<Character, "id" | "name" | "cosmetics">;
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
  const baseSprite = getCharacterSprite(character.id);
  const outfit = getOutfitSprite(character.cosmetics?.activeOutfitId);
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const outfitVisible = outfit && !failedSources.includes(outfit.src);
  const sprite = outfitVisible ? outfit : baseSprite && !failedSources.includes(baseSprite.src) ? baseSprite : undefined;
  const initials = fallbackSymbol ?? character.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      aria-label={`${character.name} character portrait${outfitVisible ? ` / ${outfit.name}` : ""}${avatar ? ` / ${avatar.name}` : ""}`}
      className={`character-sprite character-sprite-${size} ${outfitVisible ? "is-outfit" : ""} ${className}`.trim()}
      role="img"
    >
      {sprite ? (
        <img
          alt=""
          aria-hidden="true"
          decoding="async"
          key={sprite.src}
          onError={() => setFailedSources((current) => current.includes(sprite.src) ? current : [...current, sprite.src])}
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
