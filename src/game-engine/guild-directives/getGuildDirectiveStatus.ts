import { createEmptyGuildDirectiveBonuses, getGuildDirective, guildDirectives } from "../../data/guildDirectives";
import type { Character, Guild } from "../../shared/types";
import { getGuildProgression } from "../guild-progression/getGuildProgression";
import { normalizeGuildDirectivesState } from "./normalizeGuildDirectivesState";

export function getGuildDirectiveStatus(guild: Guild, characters: Character[] = []) {
  const state = normalizeGuildDirectivesState(guild.directives);
  const progression = getGuildProgression(guild);
  const configuredActive = getGuildDirective(state.activeDirectiveId);
  const activeDirective = configuredActive && configuredActive.minimumGuildLevel <= progression.level
    ? configuredActive
    : undefined;
  const directives = guildDirectives.map((definition) => ({
    definition,
    unlocked: progression.level >= definition.minimumGuildLevel,
    active: definition.id === activeDirective?.id,
  }));
  return {
    state,
    progression,
    directives,
    activeDirective,
    unlockedCount: directives.filter((entry) => entry.unlocked).length,
    canChange: true,
    lockReason: undefined,
  };
}

export function getGuildDirectiveBonuses(guild: Guild) {
  return getGuildDirectiveStatus(guild).activeDirective?.bonuses ?? createEmptyGuildDirectiveBonuses();
}
