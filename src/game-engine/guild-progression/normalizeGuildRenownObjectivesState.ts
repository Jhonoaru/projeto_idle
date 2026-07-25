import { guildRenownObjectives } from "../../data/guildRenownObjectives";
import type { GuildRenownObjectiveClaim, GuildRenownObjectivesState } from "../../shared/types";

const objectivesById = new Map(guildRenownObjectives.map((objective) => [objective.id, objective]));

export function normalizeGuildRenownObjectivesState(state: GuildRenownObjectivesState | null | undefined): GuildRenownObjectivesState {
  const claimedObjectiveIds = [...new Set(
    (Array.isArray(state?.claimedObjectiveIds) ? state.claimedObjectiveIds : [])
      .filter((objectiveId): objectiveId is string => typeof objectiveId === "string" && objectivesById.has(objectiveId)),
  )];
  const claimedSet = new Set(claimedObjectiveIds);
  const historyByObjective = new Map<string, GuildRenownObjectiveClaim>();

  for (const entry of Array.isArray(state?.claimHistory) ? state.claimHistory : []) {
    if (!entry || typeof entry.objectiveId !== "string" || !claimedSet.has(entry.objectiveId)) continue;
    const definition = objectivesById.get(entry.objectiveId);
    if (!definition || typeof entry.claimedAt !== "string") continue;
    const timestamp = new Date(entry.claimedAt);
    if (!Number.isFinite(timestamp.getTime())) continue;
    historyByObjective.set(entry.objectiveId, {
      objectiveId: entry.objectiveId,
      renownGained: definition.rewardRenown,
      claimedAt: timestamp.toISOString(),
    });
  }

  return {
    claimedObjectiveIds: guildRenownObjectives
      .map((objective) => objective.id)
      .filter((objectiveId) => claimedSet.has(objectiveId)),
    claimHistory: guildRenownObjectives
      .flatMap((objective) => historyByObjective.get(objective.id) ?? []),
  };
}
