import type {
  Character,
  EquipmentSlot,
  Guild,
  GuildLoadoutProcurementOrder,
  GuildLoadoutTemplateSlotId,
} from "../../shared/types";
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
  request: GuildLoadoutProcurementOrderRequest,
  now = new Date(),
) {
  const characterIds = (Array.isArray(characters) ? characters : [])
    .filter((entry) => entry && typeof entry.id === "string" && entry.id.length > 0)
    .map((entry) => entry.id);
  const current = normalizeGuildLoadoutTemplatesState(guild.loadoutTemplates, characterIds);
  const key = requestKey(request);
  const index = current.procurementOrders.findIndex((order) => orderKey(order) === key);
  if (request.action === "add") {
    if (!Number.isFinite(now.getTime())) return blocked(guild, current, "Procurement timestamp is invalid.");
    if (index >= 0) return blocked(guild, current, "This loadout target is already queued.");
    if (current.procurementOrders.length >= 5) return blocked(guild, current, "The procurement queue already has five priorities.");
    const template = current.templates.find((entry) =>
      entry.characterId === request.characterId
      && entry.id === request.templateId
      && entry.targets.some((target) =>
        target.slot === request.slot && target.itemId === request.itemId));
    const active = current.activeAssignments.some((entry) =>
      entry.characterId === request.characterId && entry.templateId === request.templateId);
    if (!template || !active) return blocked(guild, current, "Only a target from an active loadout can be queued.");
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

function requestKey(request: GuildLoadoutProcurementOrderRequest) {
  return `${request.characterId}:${request.templateId}:${request.slot}`;
}

function orderKey(order: GuildLoadoutProcurementOrder) {
  return `${order.characterId}:${order.templateId}:${order.slot}`;
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
