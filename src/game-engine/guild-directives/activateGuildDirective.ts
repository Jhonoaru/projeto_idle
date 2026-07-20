import { getGuildDirective } from "../../data/guildDirectives";
import type { Character, Guild } from "../../shared/types";
import { getGuildDirectiveStatus } from "./getGuildDirectiveStatus";
import { normalizeGuildDirectivesState } from "./normalizeGuildDirectivesState";

export function activateGuildDirective(guild: Guild, characters: Character[], directiveId: string, now = new Date()) {
  const definition = getGuildDirective(directiveId);
  const status = getGuildDirectiveStatus(guild, characters);
  if (!definition) return blocked(guild, status.state, "Guild directive not found.");
  if (!Number.isFinite(now.getTime())) return blocked(guild, status.state, "Directive timestamp is invalid.");
  if (!status.canChange) return blocked(guild, status.state, status.lockReason ?? "Guild operations must finish first.");
  if (status.progression.level < definition.minimumGuildLevel) {
    return blocked(guild, status.state, `${definition.name} requires Guild Level ${definition.minimumGuildLevel}.`);
  }
  if (status.activeDirective?.id === definition.id) return blocked(guild, status.state, `${definition.name} is already active.`);

  const directives = normalizeGuildDirectivesState({
    activeDirectiveId: definition.id,
    activationHistory: [
      { directiveId: definition.id, activatedAt: now.toISOString() },
      ...status.state.activationHistory,
    ],
  });
  return {
    success: true,
    guild: { ...guild, directives },
    definition,
    message: `${definition.name} activated: ${definition.bonusLabel}.`,
  };
}

function blocked(guild: Guild, directives: ReturnType<typeof normalizeGuildDirectivesState>, message: string) {
  return { success: false, guild: { ...guild, directives }, definition: undefined, message };
}
