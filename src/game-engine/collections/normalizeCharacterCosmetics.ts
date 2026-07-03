import { getCollectionItemById } from "../../data/collections";
import type { Character, CharacterCosmetics, GuildCollectionsState } from "../../shared/types";
import { createDefaultCharacterCosmetics } from "./createDefaultCharacterCosmetics";
import { normalizeCollectionsState } from "./normalizeCollectionsState";

export function normalizeCharacterCosmetics(
  character: Pick<Character, "vocation"> & { cosmetics?: Partial<CharacterCosmetics> | null },
  collections?: GuildCollectionsState,
): CharacterCosmetics {
  const state = normalizeCollectionsState(collections);
  const unlocked = new Set(state.unlockedCollectionItemIds);
  const defaults = createDefaultCharacterCosmetics(character, state);

  return {
    activeOutfitId: normalizeSlot(character.cosmetics?.activeOutfitId, "outfit", unlocked, character.vocation) ?? defaults.activeOutfitId,
    activeMountId: normalizeSlot(character.cosmetics?.activeMountId, "mount", unlocked, character.vocation) ?? defaults.activeMountId,
    activeAvatarId: normalizeSlot(character.cosmetics?.activeAvatarId, "avatar", unlocked, character.vocation) ?? defaults.activeAvatarId,
  };
}

function normalizeSlot(
  itemId: string | undefined,
  category: "outfit" | "mount" | "avatar",
  unlocked: Set<string>,
  vocation: Character["vocation"],
) {
  const item = getCollectionItemById(itemId);
  if (!item || item.category !== category || !unlocked.has(item.id)) return undefined;
  if (item.allowedVocations && !item.allowedVocations.includes(vocation)) return undefined;

  return item.id;
}
