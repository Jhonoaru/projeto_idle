import { guildSquadSlots } from "../../data/guildSquads";
import type { Character, Guild } from "../../shared/types";
import { getGuildProgression } from "../guild-progression/getGuildProgression";
import { normalizeGuildSquadsState } from "./normalizeGuildSquadsState";

export function getGuildSquadStatus(guild: Guild, characters: Character[]) {
  const progression = getGuildProgression(guild);
  const state = normalizeGuildSquadsState(guild.squads, progression.level, characters.map((character) => character.id));
  const slots = guildSquadSlots.map((definition) => ({
    definition,
    unlocked: progression.level >= definition.minimumGuildLevel,
    squad: state.squads.find((squad) => squad.id === definition.id),
  }));
  return {
    progression,
    state,
    slots,
    unlockedCount: slots.filter((slot) => slot.unlocked).length,
    configuredCount: slots.filter((slot) => slot.squad && slot.squad.members.length > 0).length,
  };
}
