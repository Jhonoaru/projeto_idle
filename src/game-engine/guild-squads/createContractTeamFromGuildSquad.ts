import type { Character, Guild } from "../../shared/types";
import { getGuildSquadStatus } from "./getGuildSquadStatus";

export function createContractTeamFromGuildSquad(
  guild: Guild,
  characters: Character[],
  maximumTeamSize: number,
  slotId: string,
) {
  const slot = getGuildSquadStatus(guild, characters).slots.find((entry) => entry.definition.id === slotId);
  if (!slot?.unlocked) return blocked("Guild Squad slot is locked.");
  if (!slot.squad || slot.squad.members.length === 0) return blocked("Guild Squad has no adventurers.");
  const limit = Number.isFinite(maximumTeamSize) ? Math.max(0, Math.floor(maximumTeamSize)) : 0;
  const characterIds = slot.squad.members
    .map((member) => member.characterId)
    .filter((characterId) => characters.some((character) => character.id === characterId && character.status !== "dead"))
    .slice(0, limit);
  return {
    success: true,
    characterIds,
    squad: slot.squad,
    message: characterIds.length > 0
      ? `${slot.squad.name} prepared ${characterIds.length} support adventurer${characterIds.length === 1 ? "" : "s"}.`
      : `${slot.squad.name} has no available support adventurers.`,
  };
}

function blocked(message: string) {
  return { success: false, characterIds: [] as string[], squad: undefined, message };
}
