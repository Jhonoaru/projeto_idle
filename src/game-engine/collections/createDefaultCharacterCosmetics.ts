import type { Character, CharacterCosmetics, GuildCollectionsState } from "../../shared/types";
import { normalizeCollectionsState } from "./normalizeCollectionsState";

export function createDefaultCharacterCosmetics(
  character: Pick<Character, "vocation">,
  collections?: GuildCollectionsState,
): CharacterCosmetics {
  const state = normalizeCollectionsState(collections);
  const unlocked = new Set(state.unlockedCollectionItemIds);

  return {
    activeOutfitId: pickByVocation(character.vocation, unlocked),
    activeMountId: unlocked.has("mount-none") ? "mount-none" : undefined,
    activeAvatarId: pickAvatarByVocation(character.vocation, unlocked),
  };
}

function pickByVocation(vocation: Character["vocation"], unlocked: Set<string>) {
  const preferred: Partial<Record<Character["vocation"], string>> = {
    Guardian: "outfit-iron-guard",
    Ranger: "outfit-field-hunter",
    Arcanist: "outfit-apprentice-mystic",
    Warden: "outfit-apprentice-mystic",
    Monk: "outfit-road-monk",
  };
  const itemId = preferred[vocation] ?? "outfit-wanderer";

  return unlocked.has(itemId) ? itemId : "outfit-wanderer";
}

function pickAvatarByVocation(vocation: Character["vocation"], unlocked: Set<string>) {
  const preferred: Partial<Record<Character["vocation"], string>> = {
    Guardian: "avatar-shield-emblem",
    Ranger: "avatar-bow-emblem",
    Arcanist: "avatar-arcane-emblem",
    Warden: "avatar-arcane-emblem",
    Monk: "avatar-monk-emblem",
  };
  const itemId = preferred[vocation] ?? "avatar-recruit-emblem";

  return unlocked.has(itemId) ? itemId : "avatar-recruit-emblem";
}
