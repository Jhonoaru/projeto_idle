import type { Character, Guild, GuildDepot } from "../../shared/types";
import {
  buildGuildLoadoutProcurementOrderTracker,
  type GuildLoadoutProcurementOrderTrackingEntry,
} from "./buildGuildLoadoutProcurementOrderTracker";

export function syncGuildLoadoutProcurementAlerts(
  guild: Guild,
  characters: Character[],
  depot: GuildDepot,
) {
  const tracker = buildGuildLoadoutProcurementOrderTracker(guild, characters, depot);
  const readyEntries = tracker.entries.filter((entry) =>
    entry.status === "available" || entry.status === "fulfilled");
  const readyKeys = readyEntries.map((entry) => entry.key);
  const retainedNotified = tracker.state.procurementAlerts.notifiedReadyKeys
    .filter((key) => readyKeys.includes(key));
  const newlyReadyEntries = readyEntries.filter((entry) => !retainedNotified.includes(entry.key));
  const notifiedReadyKeys = [
    ...retainedNotified,
    ...newlyReadyEntries.map((entry) => entry.key),
  ];
  const unreadReadyKeys = [
    ...tracker.state.procurementAlerts.unreadReadyKeys.filter((key) => readyKeys.includes(key)),
    ...newlyReadyEntries.map((entry) => entry.key),
  ].filter((key, index, keys) => keys.indexOf(key) === index);
  const procurementAlerts = { notifiedReadyKeys, unreadReadyKeys };
  const changed = JSON.stringify(tracker.state.procurementAlerts) !== JSON.stringify(procurementAlerts);
  return {
    changed,
    guild: changed
      ? { ...guild, loadoutTemplates: { ...tracker.state, procurementAlerts } }
      : guild,
    newlyReadyEntries,
  };
}

export function acknowledgeGuildLoadoutProcurementAlerts(guild: Guild) {
  const loadoutTemplates = guild.loadoutTemplates;
  if (!loadoutTemplates?.procurementAlerts?.unreadReadyKeys?.length) return guild;
  return {
    ...guild,
    loadoutTemplates: {
      ...loadoutTemplates,
      procurementAlerts: {
        ...loadoutTemplates.procurementAlerts,
        unreadReadyKeys: [],
      },
    },
  };
}

export function getGuildLoadoutProcurementUnreadCount(guild: Guild) {
  return guild.loadoutTemplates?.procurementAlerts?.unreadReadyKeys?.length ?? 0;
}

export function describeProcurementAlerts(entries: GuildLoadoutProcurementOrderTrackingEntry[]) {
  return entries.map((entry) =>
    `${entry.itemName} for ${entry.characterName} is ${entry.status === "fulfilled" ? "fulfilled" : "ready for review"}`);
}
