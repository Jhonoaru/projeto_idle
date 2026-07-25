import type {
  Character,
  EquipmentSlot,
  Guild,
  GuildDepot,
  GuildLoadoutProcurementOrder,
  GuildLoadoutTemplateSlotId,
  InventoryItem,
} from "../../shared/types";
import { normalizeItemTier, normalizeItemUpgradeLevel } from "../items/getItemVisualIdentity";
import { normalizeGuildLoadoutTemplatesState } from "./normalizeGuildLoadoutTemplatesState";

export interface GuildLoadoutProcurementReservationRequest {
  action: "reserve" | "release";
  characterId: string;
  templateId: GuildLoadoutTemplateSlotId;
  slot: EquipmentSlot;
  itemId: string;
  inventoryItemId: string;
}

export function updateGuildLoadoutProcurementReservation(
  guild: Guild,
  characters: Character[],
  depot: GuildDepot,
  request: GuildLoadoutProcurementReservationRequest,
  now = new Date(),
) {
  const characterIds = uniqueCharacterIds(characters);
  const current = normalizeGuildLoadoutTemplatesState(guild.loadoutTemplates, characterIds);
  const order = current.procurementOrders.find((entry) => orderMatches(entry, request));
  const reservationIndex = current.procurementReservations.findIndex((entry) =>
    orderMatches(entry, request));
  if (!order) return blocked(guild, current, depot, "Only an active procurement order can reserve equipment.");

  if (request.action === "release") {
    if (reservationIndex < 0) return blocked(guild, current, depot, "This procurement order has no reserved equipment.");
    const reservation = current.procurementReservations[reservationIndex];
    if (reservation.inventoryItemId !== request.inventoryItemId) {
      return blocked(guild, current, depot, "The reserved equipment identity no longer matches this request.");
    }
    const nextState = normalizeGuildLoadoutTemplatesState({
      ...current,
      procurementReservations: current.procurementReservations.filter((_, index) => index !== reservationIndex),
    }, characterIds);
    const nextDepot = unlockReservedItem(depot, reservation.inventoryItemId, reservation.itemId);
    return changed(guild, nextState, nextDepot, "Procurement reservation released.");
  }

  if (!Number.isFinite(now.getTime())) {
    return blocked(guild, current, depot, "Procurement reservation timestamp is invalid.");
  }
  if (reservationIndex >= 0) {
    return blocked(guild, current, depot, "This procurement order already has reserved equipment.");
  }
  if (current.procurementReservations.some((entry) => entry.inventoryItemId === request.inventoryItemId)) {
    return blocked(guild, current, depot, "This Guild Depot copy is already reserved for another order.");
  }
  const template = current.templates.find((entry) =>
    entry.characterId === order.characterId && entry.id === order.templateId);
  const target = template?.targets.find((entry) =>
    entry.slot === order.slot && entry.itemId === order.itemId);
  const inventoryItem = depot.items.find((entry) => entry.id === request.inventoryItemId);
  if (!target || !isReservable(inventoryItem, target.itemId, target.slot, target.minimumTier, target.minimumUpgradeLevel)) {
    return blocked(guild, current, depot, "Choose an unlocked matching copy from the root of the Guild Depot.");
  }
  const procurementReservations = [
    ...current.procurementReservations,
    {
      characterId: order.characterId,
      templateId: order.templateId,
      slot: order.slot,
      itemId: order.itemId,
      inventoryItemId: inventoryItem.id,
      reservedAt: now.toISOString(),
    },
  ];
  const nextState = normalizeGuildLoadoutTemplatesState({
    ...current,
    procurementReservations,
  }, characterIds);
  const nextDepot = {
    ...depot,
    items: depot.items.map((entry) =>
      entry.id === inventoryItem.id ? { ...entry, locked: true } : entry),
  };
  return changed(guild, nextState, nextDepot, `${inventoryItem.item.name} reserved in the Guild Depot.`);
}

export function releaseRemovedGuildLoadoutProcurementReservations(
  previousGuild: Guild,
  nextGuild: Guild,
  depot: GuildDepot,
) {
  const previous = normalizeGuildLoadoutTemplatesState(previousGuild.loadoutTemplates);
  const next = normalizeGuildLoadoutTemplatesState(nextGuild.loadoutTemplates);
  const retainedIds = new Set(next.procurementReservations.map((entry) => entry.inventoryItemId));
  const removed = previous.procurementReservations.filter((entry) =>
    !retainedIds.has(entry.inventoryItemId));
  if (removed.length === 0) return depot;
  const removedById = new Map(removed.map((entry) => [entry.inventoryItemId, entry.itemId]));
  return {
    ...depot,
    items: depot.items.map((entry) =>
      removedById.get(entry.id) === entry.itemId && entry.locked
        ? { ...entry, locked: false }
        : entry),
  };
}

export function getGuildLoadoutProcurementReservationByInventoryItemId(
  guild: Guild,
  inventoryItemId: string,
) {
  return normalizeGuildLoadoutTemplatesState(guild.loadoutTemplates)
    .procurementReservations.find((entry) => entry.inventoryItemId === inventoryItemId);
}

export function enforceGuildLoadoutProcurementReservationLocks(
  guild: Guild,
  depot: GuildDepot,
) {
  const reservations = normalizeGuildLoadoutTemplatesState(guild.loadoutTemplates)
    .procurementReservations;
  if (reservations.length === 0) return depot;
  let changed = false;
  const items = depot.items.map((entry) => {
    const reservation = reservations.find((candidate) =>
      candidate.inventoryItemId === entry.id && candidate.itemId === entry.itemId);
    if (!reservation || entry.locked) return entry;
    changed = true;
    return { ...entry, locked: true };
  });
  return changed ? { ...depot, items } : depot;
}

function uniqueCharacterIds(characters: Character[]) {
  return [...new Set((Array.isArray(characters) ? characters : [])
    .filter((entry) => entry && typeof entry.id === "string" && entry.id)
    .map((entry) => entry.id))];
}

function orderMatches(
  order: Pick<GuildLoadoutProcurementOrder, "characterId" | "templateId" | "slot" | "itemId">,
  request: Pick<GuildLoadoutProcurementReservationRequest, "characterId" | "templateId" | "slot" | "itemId">,
) {
  return order.characterId === request.characterId
    && order.templateId === request.templateId
    && order.slot === request.slot
    && order.itemId === request.itemId;
}

function isReservable(
  entry: InventoryItem | undefined,
  itemId: string,
  slot: EquipmentSlot,
  minimumTier: number,
  minimumUpgradeLevel: number,
): entry is InventoryItem {
  return Boolean(
    entry
    && entry.itemId === itemId
    && entry.item?.id === itemId
    && entry.item.type === "equipment"
    && entry.item.equipmentSlot === slot
    && entry.location === "guildDepot"
    && !entry.ownerCharacterId
    && !entry.parentContainerId
    && !entry.locked
    && Number.isSafeInteger(entry.quantity)
    && entry.quantity === 1
    && normalizeItemTier(entry.tier) >= minimumTier
    && normalizeItemUpgradeLevel(entry.upgradeLevel) >= minimumUpgradeLevel
  );
}

function unlockReservedItem(depot: GuildDepot, inventoryItemId: string, itemId: string) {
  return {
    ...depot,
    items: depot.items.map((entry) =>
      entry.id === inventoryItemId && entry.itemId === itemId && entry.locked
        ? { ...entry, locked: false }
        : entry),
  };
}

function changed(
  guild: Guild,
  loadoutTemplates: NonNullable<Guild["loadoutTemplates"]>,
  depot: GuildDepot,
  message: string,
) {
  return { changed: true, guild: { ...guild, loadoutTemplates }, depot, message };
}

function blocked(
  guild: Guild,
  loadoutTemplates: NonNullable<Guild["loadoutTemplates"]>,
  depot: GuildDepot,
  message: string,
) {
  return { changed: false, guild: { ...guild, loadoutTemplates }, depot, message };
}
