import type { Guild, GuildLogisticsState } from "../../shared/types";
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
  const state = normalizeGuildLogisticsState(guild.logistics);
  const current = state.pinnedObjectiveIds.filter((id) => activeIds.has(id));
  const index = current.indexOf(objectiveId);

  if (!activeIds.has(objectiveId)) return blocked(guild, state, current, "This campaign order is no longer active.");

  if (action === "pin") {
    if (index >= 0) return blocked(guild, state, current, "This campaign order is already pinned.");
    if (current.length >= MAX_GUILD_LOGISTICS_PINS) return blocked(guild, state, current, `The pinboard is full (${MAX_GUILD_LOGISTICS_PINS}/${MAX_GUILD_LOGISTICS_PINS}).`);
    return changed(guild, state, [...current, objectiveId], "Campaign order pinned.");
  }

  if (action === "unpin") {
    if (index < 0) return blocked(guild, state, current, "This campaign order is not pinned.");
    return changed(guild, state, current.filter((id) => id !== objectiveId), "Campaign order removed from the pinboard.");
  }

  if (index < 0) return blocked(guild, state, current, "Pin this campaign order before changing its priority.");
  const target = action === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= current.length) return blocked(guild, state, current, "This campaign order is already at that priority limit.");
  const reordered = [...current];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
  return changed(guild, state, reordered, `Campaign priority changed to ${target + 1}.`);
}

function changed(guild: Guild, state: GuildLogisticsState, pinnedObjectiveIds: string[], message: string): GuildLogisticsPinResult {
  return { changed: true, guild: { ...guild, logistics: withPins(state, pinnedObjectiveIds) }, message };
}

function blocked(guild: Guild, state: GuildLogisticsState, pinnedObjectiveIds: string[], message: string): GuildLogisticsPinResult {
  const nextState = withPins(state, pinnedObjectiveIds);
  const normalizedGuild = statesEqual(state, nextState)
    ? guild
    : { ...guild, logistics: nextState };
  return { changed: normalizedGuild !== guild, guild: normalizedGuild, message };
}

function withPins(state: GuildLogisticsState, pinnedObjectiveIds: string[]): GuildLogisticsState {
  const belongsToActivePin = (key: string) => pinnedObjectiveIds.some((id) => key.startsWith(`${id}::`));
  const notifiedReadyKeys = state.notifiedReadyKeys.filter(belongsToActivePin);
  return {
    pinnedObjectiveIds,
    notifiedReadyKeys,
    unreadReadyKeys: state.unreadReadyKeys.filter((key) => notifiedReadyKeys.includes(key)),
  };
}

function statesEqual(left: GuildLogisticsState, right: GuildLogisticsState) {
  return arraysEqual(left.pinnedObjectiveIds, right.pinnedObjectiveIds)
    && arraysEqual(left.notifiedReadyKeys, right.notifiedReadyKeys)
    && arraysEqual(left.unreadReadyKeys, right.unreadReadyKeys);
}

function arraysEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((entry, index) => entry === right[index]);
}
