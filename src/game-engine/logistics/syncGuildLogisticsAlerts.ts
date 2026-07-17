import type { Guild } from "../../shared/types";
import type { GuildLogisticsObjective } from "./buildGuildLogisticsPlan";
import { normalizeGuildLogisticsState } from "./normalizeGuildLogisticsState";

export interface GuildLogisticsAlertSyncResult {
  changed: boolean;
  guild: Guild;
  newlyReadyObjectives: GuildLogisticsObjective[];
}

export function syncGuildLogisticsAlerts(guild: Guild, objectives: GuildLogisticsObjective[]): GuildLogisticsAlertSyncResult {
  const state = normalizeGuildLogisticsState(guild.logistics);
  const activePinned = objectives.filter((objective) => objective.isPinned);
  const activeKeys = activePinned.map(getGuildLogisticsObjectiveAlertKey);
  const readyObjectives = activePinned.filter((objective) => objective.status === "ready");
  const readyKeys = readyObjectives.map(getGuildLogisticsObjectiveAlertKey);
  const notifiedReadyKeys = state.notifiedReadyKeys.filter((key) => activeKeys.includes(key) && readyKeys.includes(key));
  const newlyReadyObjectives = readyObjectives.filter((objective) => !notifiedReadyKeys.includes(getGuildLogisticsObjectiveAlertKey(objective)));
  const nextNotified = [...notifiedReadyKeys, ...newlyReadyObjectives.map(getGuildLogisticsObjectiveAlertKey)];
  const nextUnread = [
    ...state.unreadReadyKeys.filter((key) => readyKeys.includes(key) && nextNotified.includes(key)),
    ...newlyReadyObjectives.map(getGuildLogisticsObjectiveAlertKey),
  ].filter((key, index, keys) => keys.indexOf(key) === index);
  const nextState = {
    pinnedObjectiveIds: state.pinnedObjectiveIds,
    notifiedReadyKeys: nextNotified,
    unreadReadyKeys: nextUnread,
  };
  const changed = JSON.stringify(state) !== JSON.stringify(nextState);
  return { changed, guild: changed ? { ...guild, logistics: nextState } : guild, newlyReadyObjectives };
}

export function acknowledgeGuildLogisticsAlerts(guild: Guild): Guild {
  const state = normalizeGuildLogisticsState(guild.logistics);
  if (state.unreadReadyKeys.length === 0) return guild;
  return { ...guild, logistics: { ...state, unreadReadyKeys: [] } };
}

export function getGuildLogisticsUnreadCount(guild: Guild) {
  return normalizeGuildLogisticsState(guild.logistics).unreadReadyKeys.length;
}

export function getGuildLogisticsObjectiveAlertKey(objective: Pick<GuildLogisticsObjective, "id" | "targetLabel">) {
  return `${objective.id}::${objective.targetLabel}`;
}
