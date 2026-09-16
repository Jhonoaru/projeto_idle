import { guildRecruitCandidates } from "../../data/guildRecruitCandidates";
import { mockGuild } from "../../data/mockGuild";
import { createRecruitedCharacter } from "../recruitment/recruitGuildCandidate";
import { normalizeGuildBazaarState } from "../bazaar/normalizeGuildBazaarState";
import type { GameStateSnapshot } from "../../database/saveGameRepository";

export const starterChoices = guildRecruitCandidates.slice(0, 5);

export function createNewGame(guildName: string, heroName: string, candidateId: string, now = new Date()): GameStateSnapshot {
  const name = guildName.trim();
  const hero = heroName.trim();
  if (name.length < 2 || name.length > 32 || hero.length < 2 || hero.length > 24) throw new Error("Confira os nomes da guilda e do personagem.");
  const template = starterChoices.find(candidate => candidate.id === candidateId);
  if (!template || !Number.isFinite(now.getTime())) throw new Error("Personagem inicial invalido.");
  const id = `guild-new-${crypto.randomUUID()}`;
  const character = createRecruitedCharacter({ ...template, characterId: `founder-${crypto.randomUUID()}`, name: hero,
    level: 1, city: "Thaeron", skills: { sword: 10, axe: 10, club: 10, distance: 10, fist: 10, shielding: 10, magic: 1 },
    equipment: { weapon: template.vocation === "Guardian" ? "worn-sword" : template.vocation === "Ranger" ? "simple-bow" : template.vocation === "Monk" ? "monk-wraps" : "novice-wand" },
    inventory: [{ itemId: "minor-health-potion", quantity: 5 }, { itemId: "mana-potion", quantity: 5 }],
  }, now);
  character.cosmetics = { activeOutfitId: "outfit-wanderer", activeMountId: "mount-none", activeAvatarId: "avatar-recruit-emblem" };
  const guild = { ...structuredClone(mockGuild), id, name, gold: 150, renown: 0, level: 1,
    collections: { unlockedCollectionItemIds: ["outfit-wanderer", "mount-none", "avatar-recruit-emblem"], newlyUnlockedCollectionItemIds: [] },
    bazaar: normalizeGuildBazaarState(undefined, id),
  };
  return { guild, characters: [character], depot: { goldStored: 0, items: [] }, logs: [] };
}
