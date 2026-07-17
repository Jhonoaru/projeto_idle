import type { GuildLogisticsState } from "../../shared/types";

export const MAX_GUILD_LOGISTICS_PINS = 3;

export function createDefaultGuildLogisticsState(): GuildLogisticsState {
  return { pinnedObjectiveIds: [], notifiedReadyKeys: [], unreadReadyKeys: [] };
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
  const notifiedReadyKeys = normalizeKeys((value as Partial<GuildLogisticsState>).notifiedReadyKeys, 20);
  const unreadReadyKeys = normalizeKeys((value as Partial<GuildLogisticsState>).unreadReadyKeys, MAX_GUILD_LOGISTICS_PINS)
    .filter((key) => notifiedReadyKeys.includes(key));
  return { pinnedObjectiveIds, notifiedReadyKeys, unreadReadyKeys };
}

function normalizeKeys(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];
  const keys: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string") continue;
    const key = entry.trim();
    if (!key || key.length > 240 || keys.includes(key)) continue;
    keys.push(key);
    if (keys.length === limit) break;
  }
  return keys;
}
