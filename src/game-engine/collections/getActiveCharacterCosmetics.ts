import { getCollectionItemById } from "../../data/collections";
import type { Character, GuildCollectionsState } from "../../shared/types";
import { normalizeCharacterCosmetics } from "./normalizeCharacterCosmetics";

export function getActiveCharacterCosmetics(
  character: Character,
  collections?: GuildCollectionsState,
) {
  const cosmetics = normalizeCharacterCosmetics(character, collections);

  return {
    cosmetics,
    outfit: getCollectionItemById(cosmetics.activeOutfitId),
    mount: getCollectionItemById(cosmetics.activeMountId),
    avatar: getCollectionItemById(cosmetics.activeAvatarId),
  };
}
