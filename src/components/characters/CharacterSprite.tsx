import { useState } from "react";
import { getCharacterSprite } from "../../data/characterSprites";
import { getCollectionSprite, getMountSprite, getOutfitSprite } from "../../data/collectionSprites";
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
  const mount = getMountSprite(character.cosmetics?.activeMountId);
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const outfitVisible = outfit && !failedSources.includes(outfit.src);
  const mountVisible = mount && !failedSources.includes(mount.src);
  const sprite = outfitVisible ? outfit : baseSprite && !failedSources.includes(baseSprite.src) ? baseSprite : undefined;
  const initials = fallbackSymbol ?? character.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      aria-label={`${character.name} character portrait${outfitVisible ? ` / ${outfit.name}` : ""}${mountVisible ? ` / ${mount.name}` : ""}${avatar ? ` / ${avatar.name}` : ""}`}
      className={`character-sprite character-sprite-${size} ${outfitVisible ? "is-outfit" : ""} ${mountVisible ? "is-mounted" : ""} ${className}`.trim()}
      role="img"
    >
      {mountVisible ? (
        <img
          alt=""
          aria-hidden="true"
          className="character-mount-sprite"
          decoding="async"
          key={mount.src}
          onError={() => setFailedSources((current) => current.includes(mount.src) ? current : [...current, mount.src])}
          src={mount.src}
        />
      ) : null}
      {sprite ? (
        <img
          alt=""
          aria-hidden="true"
          className="character-hero-sprite"
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
