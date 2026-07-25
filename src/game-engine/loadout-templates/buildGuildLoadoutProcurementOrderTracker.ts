import { items } from "../../data/items";
import type {
  Character,
  Guild,
  GuildDepot,
  GuildLoadoutProcurementOrder,
} from "../../shared/types";
import { buildGuildActiveLoadoutDashboard } from "./buildGuildActiveLoadoutDashboard";
import { normalizeGuildLoadoutTemplatesState } from "./normalizeGuildLoadoutTemplatesState";

export type GuildLoadoutProcurementOrderStatus =
  | "fulfilled"
  | "available"
  | "sourcing"
  | "blocked";

export interface GuildLoadoutProcurementOrderTrackingEntry {
  key: string;
  order: GuildLoadoutProcurementOrder;
  characterName: string;
  itemName: string;
  status: GuildLoadoutProcurementOrderStatus;
  statusLabel: string;
  detail: string;
}

export function buildGuildLoadoutProcurementOrderTracker(
  guild: Guild,
  characters: Character[],
  depot: GuildDepot,
) {
  const safeCharacters = uniqueCharacters(characters);
  const state = normalizeGuildLoadoutTemplatesState(
    guild.loadoutTemplates,
    safeCharacters.map((character) => character.id),
  );
  const dashboard = buildGuildActiveLoadoutDashboard(
    { ...guild, loadoutTemplates: state },
    safeCharacters,
    depot,
  );
  const entries = state.procurementOrders.map((order): GuildLoadoutProcurementOrderTrackingEntry => {
    const dashboardEntry = dashboard.entries.find((entry) => entry.character.id === order.characterId);
    const review = dashboardEntry?.review.reviews.find((entry) =>
      entry.slot === order.slot && entry.target?.itemId === order.itemId);
    const status = getTrackingStatus(review?.status);
    return {
      key: getGuildLoadoutProcurementOrderAlertKey(order),
      order,
      characterName: dashboardEntry?.character.name ?? "Unknown adventurer",
      itemName: items[order.itemId]?.name ?? order.itemId,
      status,
      statusLabel: getStatusLabel(status),
      detail: getStatusDetail(status, review?.sourceCharacterName),
    };
  });
  return {
    state,
    entries,
    summary: {
      total: entries.length,
      fulfilled: entries.filter((entry) => entry.status === "fulfilled").length,
      available: entries.filter((entry) => entry.status === "available").length,
      sourcing: entries.filter((entry) => entry.status === "sourcing").length,
      blocked: entries.filter((entry) => entry.status === "blocked").length,
      unread: state.procurementAlerts.unreadReadyKeys.length,
    },
  };
}

export function getGuildLoadoutProcurementOrderAlertKey(
  order: Pick<GuildLoadoutProcurementOrder, "characterId" | "templateId" | "slot" | "itemId">,
) {
  return `${order.characterId}:${order.templateId}:${order.slot}:${order.itemId}`;
}

function uniqueCharacters(characters: Character[]) {
  const seen = new Set<string>();
  return (Array.isArray(characters) ? characters : []).filter((character) => {
    if (
      !character
      || typeof character.id !== "string"
      || !character.id
      || seen.has(character.id)
    ) return false;
    seen.add(character.id);
    return true;
  });
}

function getTrackingStatus(status: string | undefined): GuildLoadoutProcurementOrderStatus {
  if (status === "equipped") return "fulfilled";
  if (status === "guild-depot" || status === "personal" || status === "roster") return "available";
  if (status === "missing") return "sourcing";
  return "blocked";
}

function getStatusLabel(status: GuildLoadoutProcurementOrderStatus) {
  if (status === "fulfilled") return "Target fulfilled";
  if (status === "available") return "Ready for review";
  if (status === "sourcing") return "Acquisition required";
  return "Plan blocked";
}

function getStatusDetail(status: GuildLoadoutProcurementOrderStatus, sourceName?: string) {
  if (status === "fulfilled") return "The exact target is currently equipped.";
  if (status === "available") {
    return sourceName
      ? `An exact copy is held by ${sourceName}.`
      : "An exact copy is available in guild holdings.";
  }
  if (status === "sourcing") return "Continue through the registered acquisition route.";
  return "Review the active template before continuing.";
}
