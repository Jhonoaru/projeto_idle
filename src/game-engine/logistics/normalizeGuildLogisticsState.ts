import type { GuildLogisticsState } from "../../shared/types";

export const MAX_GUILD_LOGISTICS_PINS = 3;

export function createDefaultGuildLogisticsState(): GuildLogisticsState {
  return { pinnedObjectiveIds: [] };
}

export function normalizeGuildLogisticsState(value: unknown): GuildLogisticsState {
  if (!value || typeof value !== "object") return createDefaultGuildLogisticsState();
  const source = (value as Partial<GuildLogisticsState>).pinnedObjectiveIds;
  if (!Array.isArray(source)) return createDefaultGuildLogisticsState();

  const pinnedObjectiveIds: string[] = [];
  for (const entry of source) {
    if (typeof entry !== "string") continue;
    const id = entry.trim();
    if (!id || id.length > 120 || pinnedObjectiveIds.includes(id)) continue;
    pinnedObjectiveIds.push(id);
    if (pinnedObjectiveIds.length === MAX_GUILD_LOGISTICS_PINS) break;
  }
  return { pinnedObjectiveIds };
}
