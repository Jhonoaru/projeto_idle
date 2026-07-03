import { getCollectionItemById } from "../../data/collections";
import type { Character, Guild } from "../../shared/types";
import { isCollectionItemUnlocked } from "./isCollectionItemUnlocked";
import { normalizeCharacterCosmetics } from "./normalizeCharacterCosmetics";

export function equipCollectionItem(character: Character, guild: Guild, itemId: string): Character {
  const item = getCollectionItemById(itemId);
  if (!item) throw new Error("Collection item not found.");
  if (!isCollectionItemUnlocked(guild.collections, item.id)) throw new Error("Collection item is locked.");
  if (item.allowedVocations && !item.allowedVocations.includes(character.vocation)) {
    throw new Error("This cosmetic is not available for this vocation.");
  }

  const cosmetics = normalizeCharacterCosmetics(character, guild.collections);
  const updatedCosmetics = {
    ...cosmetics,
    ...(item.category === "outfit" ? { activeOutfitId: item.id } : {}),
    ...(item.category === "mount" ? { activeMountId: item.id } : {}),
    ...(item.category === "avatar" ? { activeAvatarId: item.id } : {}),
  };

  return {
    ...character,
    cosmetics: normalizeCharacterCosmetics(
      { ...character, cosmetics: updatedCosmetics },
      guild.collections,
    ),
  };
}
