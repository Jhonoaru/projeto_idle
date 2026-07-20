import { guildRenownObjectives } from "../../data/guildRenownObjectives";
import type { GuildRenownObjectiveClaim, GuildRenownObjectivesState } from "../../shared/types";

const validObjectiveIds = new Set(guildRenownObjectives.map((objective) => objective.id));

export function normalizeGuildRenownObjectivesState(state: GuildRenownObjectivesState | null | undefined): GuildRenownObjectivesState {
  const claimedObjectiveIds = [...new Set(
    (Array.isArray(state?.claimedObjectiveIds) ? state.claimedObjectiveIds : [])
      .filter((objectiveId): objectiveId is string => typeof objectiveId === "string" && validObjectiveIds.has(objectiveId)),
  )];
  const claimedSet = new Set(claimedObjectiveIds);
  const historyByObjective = new Map<string, GuildRenownObjectiveClaim>();

  for (const entry of Array.isArray(state?.claimHistory) ? state.claimHistory : []) {
    if (!entry || typeof entry.objectiveId !== "string" || !claimedSet.has(entry.objectiveId)) continue;
    if (!validObjectiveIds.has(entry.objectiveId) || typeof entry.claimedAt !== "string") continue;
    const timestamp = new Date(entry.claimedAt);
    if (!Number.isFinite(timestamp.getTime())) continue;
    const renownGained = normalizePositiveInteger(entry.renownGained);
    if (renownGained <= 0) continue;
    historyByObjective.set(entry.objectiveId, {
      objectiveId: entry.objectiveId,
      renownGained,
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

function normalizePositiveInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}
