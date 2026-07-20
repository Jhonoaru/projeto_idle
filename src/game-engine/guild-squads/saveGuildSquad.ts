import { getGuildSquadSlot } from "../../data/guildSquads";
import type { Character, Guild, GuildSquadMember } from "../../shared/types";
import { getGuildProgression } from "../guild-progression/getGuildProgression";
import { normalizeGuildSquadsState } from "./normalizeGuildSquadsState";

export function saveGuildSquad(
  guild: Guild,
  characters: Character[],
  slotId: string,
  name: string,
  members: GuildSquadMember[],
  now = new Date(),
) {
  const slot = getGuildSquadSlot(slotId);
  const progression = getGuildProgression(guild);
  const current = normalizeGuildSquadsState(guild.squads, progression.level, characters.map((character) => character.id));
  if (!slot) return blocked(guild, current, "Guild Squad slot not found.");
  if (slot.minimumGuildLevel > progression.level) return blocked(guild, current, `${slot.defaultName} requires Guild Level ${slot.minimumGuildLevel}.`);
  if (!Number.isFinite(now.getTime())) return blocked(guild, current, "Squad timestamp is invalid.");

  const squads = normalizeGuildSquadsState({
    squads: [
      { id: slot.id, name, members, updatedAt: now.toISOString() },
      ...current.squads.filter((squad) => squad.id !== slot.id),
    ],
  }, progression.level, characters.map((character) => character.id));
  const squad = squads.squads.find((entry) => entry.id === slot.id)!;
  return {
    success: true,
    guild: { ...guild, squads },
    squad,
    message: `${squad.name} saved with ${squad.members.length} adventurer${squad.members.length === 1 ? "" : "s"}.`,
  };
}

function blocked(guild: Guild, squads: ReturnType<typeof normalizeGuildSquadsState>, message: string) {
  return { success: false, guild: { ...guild, squads }, squad: undefined, message };
}
