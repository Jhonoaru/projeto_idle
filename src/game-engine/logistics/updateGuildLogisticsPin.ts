import type { Guild } from "../../shared/types";
import { MAX_GUILD_LOGISTICS_PINS, normalizeGuildLogisticsState } from "./normalizeGuildLogisticsState";

export type GuildLogisticsPinAction = "pin" | "unpin" | "up" | "down";

export interface GuildLogisticsPinResult {
  changed: boolean;
  guild: Guild;
  message: string;
}

export function updateGuildLogisticsPin(
  guild: Guild,
  objectiveId: string,
  action: GuildLogisticsPinAction,
  activeObjectiveIds: string[],
): GuildLogisticsPinResult {
  const activeIds = new Set(activeObjectiveIds.filter((id) => typeof id === "string" && id.length > 0));
  const current = normalizeGuildLogisticsState(guild.logistics).pinnedObjectiveIds.filter((id) => activeIds.has(id));
  const index = current.indexOf(objectiveId);

  if (!activeIds.has(objectiveId)) return blocked(guild, current, "This campaign order is no longer active.");

  if (action === "pin") {
    if (index >= 0) return blocked(guild, current, "This campaign order is already pinned.");
    if (current.length >= MAX_GUILD_LOGISTICS_PINS) return blocked(guild, current, `The pinboard is full (${MAX_GUILD_LOGISTICS_PINS}/${MAX_GUILD_LOGISTICS_PINS}).`);
    return changed(guild, [...current, objectiveId], "Campaign order pinned.");
  }

  if (action === "unpin") {
    if (index < 0) return blocked(guild, current, "This campaign order is not pinned.");
    return changed(guild, current.filter((id) => id !== objectiveId), "Campaign order removed from the pinboard.");
  }

  if (index < 0) return blocked(guild, current, "Pin this campaign order before changing its priority.");
  const target = action === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= current.length) return blocked(guild, current, "This campaign order is already at that priority limit.");
  const reordered = [...current];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
  return changed(guild, reordered, `Campaign priority changed to ${target + 1}.`);
}

function changed(guild: Guild, pinnedObjectiveIds: string[], message: string): GuildLogisticsPinResult {
  return { changed: true, guild: { ...guild, logistics: { pinnedObjectiveIds } }, message };
}

function blocked(guild: Guild, pinnedObjectiveIds: string[], message: string): GuildLogisticsPinResult {
  const persistedIds = normalizeGuildLogisticsState(guild.logistics).pinnedObjectiveIds;
  const normalizedGuild = arraysEqual(persistedIds, pinnedObjectiveIds)
    ? guild
    : { ...guild, logistics: { pinnedObjectiveIds } };
  return { changed: normalizedGuild !== guild, guild: normalizedGuild, message };
}

function arraysEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((entry, index) => entry === right[index]);
}
