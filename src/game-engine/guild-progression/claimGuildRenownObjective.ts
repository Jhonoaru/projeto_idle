import { getGuildRenownObjective } from "../../data/guildRenownObjectives";
import type { Character, Guild } from "../../shared/types";
import { getGuildRenownObjectiveStatus } from "./getGuildRenownObjectiveStatus";
import { normalizeGuildRenownObjectivesState } from "./normalizeGuildRenownObjectivesState";

export function claimGuildRenownObjective(guild: Guild, characters: Character[], objectiveId: string, now = new Date()) {
  const definition = getGuildRenownObjective(objectiveId);
  const status = getGuildRenownObjectiveStatus(guild, characters);
  const objective = status.objectives.find((entry) => entry.definition.id === objectiveId);

  if (!definition || !objective) return blocked(guild, status.state, "Renown objective not found.");
  if (!Number.isFinite(now.getTime())) return blocked(guild, status.state, "Objective timestamp is invalid.");
  if (objective.claimed) return blocked(guild, status.state, `${definition.title} was already claimed.`);
  if (!objective.completed) return blocked(guild, status.state, `${definition.title} is not complete.`);

  const currentRenown = normalizeInteger(guild.renown);
  const claimedAt = now.toISOString();
  const renownObjectives = normalizeGuildRenownObjectivesState({
    claimedObjectiveIds: [...status.state.claimedObjectiveIds, definition.id],
    claimHistory: [
      ...status.state.claimHistory,
      { objectiveId: definition.id, renownGained: definition.rewardRenown, claimedAt },
    ],
  });

  return {
    success: true,
    guild: { ...guild, renown: safeAdd(currentRenown, definition.rewardRenown), renownObjectives },
    definition,
    renownGained: definition.rewardRenown,
    message: `${definition.title} completed: +${definition.rewardRenown} renown.`,
  };
}

function blocked(guild: Guild, state: ReturnType<typeof normalizeGuildRenownObjectivesState>, message: string) {
  return { success: false, guild: { ...guild, renownObjectives: state }, definition: undefined, renownGained: 0, message };
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

function safeAdd(left: number, right: number) {
  return Math.min(Number.MAX_SAFE_INTEGER, left + right);
}
