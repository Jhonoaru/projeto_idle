import { useState } from "react";
import { getCharacterSprite } from "../../data/characterSprites";
import { getCollectionSprite, getMountSprite, getOutfitSprite } from "../../data/collectionSprites";
import { getItemSprite } from "../../data/itemSprites";
import { getItemVisualIdentity } from "../../game-engine/items/getItemVisualIdentity";
import { CollectionPreview } from "../collections/CollectionPreview";
import type { Character, CollectionItem, EquipmentSlot, InventoryItem } from "../../shared/types";

type CharacterSpriteSize = "small" | "medium" | "large" | "scene";

interface CharacterSpriteProps {
  character: Pick<Character, "id" | "name" | "cosmetics"> & { equipment?: Character["equipment"] };
  className?: string;
  fallbackSymbol?: string;
  avatar?: CollectionItem;
  size?: CharacterSpriteSize;
  showLoadout?: boolean;
}

export function CharacterSprite({
  character,
  className = "",
  fallbackSymbol,
  avatar,
  size = "medium",
  showLoadout = false,
}: CharacterSpriteProps) {
  const baseSprite = getCharacterSprite(character.id);
  const outfit = getOutfitSprite(character.cosmetics?.activeOutfitId);
  const mount = getMountSprite(character.cosmetics?.activeMountId);
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const outfitVisible = outfit && !failedSources.includes(outfit.src);
  const mountVisible = mount && !failedSources.includes(mount.src);
  const sprite = outfitVisible ? outfit : baseSprite && !failedSources.includes(baseSprite.src) ? baseSprite : undefined;
  const loadoutItems = getVisibleLoadoutItems(character.equipment, failedSources);
  const loadoutSummary = loadoutItems.map(({ item }) => item.item.name).join(", ");
  const initials = fallbackSymbol ?? character.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      aria-label={`${character.name} character portrait${outfitVisible ? ` / ${outfit.name}` : ""}${mountVisible ? ` / ${mount.name}` : ""}${avatar ? ` / ${avatar.name}` : ""}${showLoadout && loadoutSummary ? ` / Equipped: ${loadoutSummary}` : ""}`}
      className={`character-sprite character-sprite-${size} ${outfitVisible ? "is-outfit" : ""} ${mountVisible ? "is-mounted" : ""} ${showLoadout ? "has-loadout" : ""} ${className}`.trim()}
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
      {showLoadout ? (
        <span aria-hidden="true" className="character-loadout-visual">
          {loadoutItems.map(({ slot, item, sprite: itemSprite }) => {
            const identity = getItemVisualIdentity(item.item, item);
            return (
              <span className={`character-loadout-item loadout-${slot} ${identity.className}`} key={slot}>
                {itemSprite ? (
                  <img
                    alt=""
                    decoding="async"
                    draggable={false}
                    onError={() => setFailedSources((current) => current.includes(itemSprite.src) ? current : [...current, itemSprite.src])}
                    src={itemSprite.src}
                  />
                ) : <b>{loadoutFallback(slot)}</b>}
                {identity.tier > 0 ? <em>T{identity.tier}</em> : null}
              </span>
            );
          })}
        </span>
      ) : null}
      {avatar && getCollectionSprite(avatar.id) ? (
        <span className="character-avatar-emblem" title={avatar.name}>
          <CollectionPreview item={avatar} priority />
        </span>
      ) : null}
    </span>
  );
}

function getVisibleLoadoutItems(equipment: Character["equipment"] | undefined, failedSources: string[]) {
  return (["weapon", "offhand", "armor"] as EquipmentSlot[])
    .map((slot) => {
      const item = equipment?.[slot];
      const sprite = getItemSprite(item?.item.id);
      return item ? { slot, item, sprite: sprite && !failedSources.includes(sprite.src) ? sprite : undefined } : undefined;
    })
    .filter((entry): entry is { slot: EquipmentSlot; item: InventoryItem; sprite: ReturnType<typeof getItemSprite> } => Boolean(entry));
}

function loadoutFallback(slot: EquipmentSlot) {
  return slot === "weapon" ? "W" : slot === "offhand" ? "O" : "A";
}
