import type {
  Character,
  EquipmentSlot,
  Guild,
  GuildDepot,
  GuildLoadoutProcurementOrder,
  GuildLoadoutTemplateSlotId,
} from "../../shared/types";
import { buildGuildLoadoutTemplateReview } from "./buildGuildLoadoutTemplateReview";
import { normalizeGuildLoadoutTemplatesState } from "./normalizeGuildLoadoutTemplatesState";

export type GuildLoadoutProcurementOrderAction = "add" | "remove" | "move-up" | "move-down";

export interface GuildLoadoutProcurementOrderRequest {
  action: GuildLoadoutProcurementOrderAction;
  characterId: string;
  templateId: GuildLoadoutTemplateSlotId;
  slot: EquipmentSlot;
  itemId: string;
}

export function updateGuildLoadoutProcurementOrder(
  guild: Guild,
  characters: Character[],
  depot: GuildDepot,
  request: GuildLoadoutProcurementOrderRequest,
  now = new Date(),
) {
  const safeCharacters = (Array.isArray(characters) ? characters : [])
    .filter((entry) => entry && typeof entry.id === "string" && entry.id.length > 0);
  const characterIds = safeCharacters.map((entry) => entry.id);
  const current = normalizeGuildLoadoutTemplatesState(guild.loadoutTemplates, characterIds);
  const index = current.procurementOrders.findIndex((order) => orderMatchesRequest(order, request));
  if (request.action === "add") {
    if (!Number.isFinite(now.getTime())) return blocked(guild, current, "Procurement timestamp is invalid.");
    if (current.procurementOrders.some((order) => orderSlotKey(order) === requestSlotKey(request))) {
      return blocked(guild, current, "This loadout target is already queued.");
    }
    if (current.procurementOrders.length >= 5) return blocked(guild, current, "The procurement queue already has five priorities.");
    const template = current.templates.find((entry) =>
      entry.characterId === request.characterId
      && entry.id === request.templateId
      && entry.targets.some((target) =>
        target.slot === request.slot && target.itemId === request.itemId));
    const active = current.activeAssignments.some((entry) =>
      entry.characterId === request.characterId && entry.templateId === request.templateId);
    if (!template || !active) return blocked(guild, current, "Only a target from an active loadout can be queued.");
    const character = safeCharacters.find((entry) => entry.id === request.characterId);
    const targetReview = buildGuildLoadoutTemplateReview(
      template,
      character,
      safeCharacters,
      depot,
    ).reviews.find((entry) => entry.slot === request.slot);
    if (targetReview?.status === "equipped" || targetReview?.status === "unassigned") {
      return blocked(guild, current, "Only a pending target from an active loadout can be queued.");
    }
    const order: GuildLoadoutProcurementOrder = {
      characterId: request.characterId,
      templateId: request.templateId,
      slot: request.slot,
      itemId: request.itemId,
      queuedAt: now.toISOString(),
    };
    return changed(guild, { ...current, procurementOrders: [...current.procurementOrders, order] }, "Loadout target added to the procurement queue.");
  }
  if (index < 0) return blocked(guild, current, "This loadout target is not queued.");
  if (request.action === "remove") {
    return changed(guild, {
      ...current,
      procurementOrders: current.procurementOrders.filter((_, orderIndex) => orderIndex !== index),
    }, "Loadout target removed from the procurement queue.");
  }
  const nextIndex = request.action === "move-up" ? index - 1 : index + 1;
  if (nextIndex < 0 || nextIndex >= current.procurementOrders.length) {
    return blocked(guild, current, "This procurement priority is already at the queue boundary.");
  }
  const procurementOrders = [...current.procurementOrders];
  [procurementOrders[index], procurementOrders[nextIndex]] = [procurementOrders[nextIndex], procurementOrders[index]];
  return changed(guild, { ...current, procurementOrders }, "Procurement priority order updated.");
}

function requestSlotKey(request: GuildLoadoutProcurementOrderRequest) {
  return `${request.characterId}:${request.templateId}:${request.slot}`;
}

function orderSlotKey(order: GuildLoadoutProcurementOrder) {
  return `${order.characterId}:${order.templateId}:${order.slot}`;
}

function orderMatchesRequest(
  order: GuildLoadoutProcurementOrder,
  request: GuildLoadoutProcurementOrderRequest,
) {
  return orderSlotKey(order) === requestSlotKey(request) && order.itemId === request.itemId;
}

function changed(guild: Guild, loadoutTemplates: Guild["loadoutTemplates"], message: string) {
  return { changed: true, guild: { ...guild, loadoutTemplates }, message };
}

function blocked(
  guild: Guild,
  loadoutTemplates: NonNullable<Guild["loadoutTemplates"]>,
  message: string,
) {
  return { changed: false, guild: { ...guild, loadoutTemplates }, message };
}
