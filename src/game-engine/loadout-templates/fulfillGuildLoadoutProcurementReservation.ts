import type {
  Character,
  EquipmentSlot,
  Guild,
  GuildDepot,
  GuildLoadoutTemplateSlotId,
} from "../../shared/types";
import { equipItem } from "../equipment/equipItem";
import { transferItem } from "../inventory/transferItem";
import { normalizeItemTier, normalizeItemUpgradeLevel } from "../items/getItemVisualIdentity";
import { normalizeGuildLoadoutTemplatesState } from "./normalizeGuildLoadoutTemplatesState";

export interface GuildLoadoutProcurementFulfillmentRequest {
  characterId: string;
  templateId: GuildLoadoutTemplateSlotId;
  slot: EquipmentSlot;
  itemId: string;
  inventoryItemId: string;
}

export interface GuildLoadoutProcurementFulfillmentResult {
  success: boolean;
  guild: Guild;
  characters: Character[];
  depot: GuildDepot;
  message: string;
  characterName?: string;
  itemName?: string;
  previousItemName?: string;
}

export function fulfillGuildLoadoutProcurementReservation(
  guild: Guild,
  characters: Character[],
  depot: GuildDepot,
  request: GuildLoadoutProcurementFulfillmentRequest,
  now = new Date(),
): GuildLoadoutProcurementFulfillmentResult {
  if (!isValidRequest(request)) {
    return blocked(guild, characters, depot, "The reserved gear request is invalid.");
  }
  if (!Number.isFinite(now.getTime())) {
    return blocked(guild, characters, depot, "The fulfillment timestamp is invalid.");
  }

  const characterMatches = characters
    .map((character, index) => ({ character, index }))
    .filter((entry) => entry.character?.id === request.characterId);
  if (characterMatches.length !== 1) {
    return blocked(guild, characters, depot, "The assigned adventurer is missing or duplicated.");
  }

  const characterIds = [...new Set(characters.map((character) => character.id))];
  const current = normalizeGuildLoadoutTemplatesState(guild.loadoutTemplates, characterIds);
  const order = current.procurementOrders.find((entry) => matchesRequest(entry, request));
  const reservation = current.procurementReservations.find((entry) => matchesRequest(entry, request));
  if (!order || !reservation || reservation.inventoryItemId !== request.inventoryItemId) {
    return blocked(guild, characters, depot, "This exact reserved procurement order is no longer active.");
  }

  const template = current.templates.find((entry) =>
    entry.characterId === request.characterId && entry.id === request.templateId);
  const target = template?.targets.find((entry) =>
    entry.slot === request.slot && entry.itemId === request.itemId);
  if (!template || !target) {
    return blocked(guild, characters, depot, "The active loadout target no longer matches this reservation.");
  }

  const depotMatches = depot.items.filter((entry) => entry.id === request.inventoryItemId);
  if (depotMatches.length !== 1) {
    return blocked(guild, characters, depot, "The reserved Guild Depot copy is missing or duplicated.");
  }
  const reservedItem = depotMatches[0];
  if (
    reservedItem.itemId !== request.itemId
    || reservedItem.item?.id !== request.itemId
    || reservedItem.item.type !== "equipment"
    || reservedItem.item.equipmentSlot !== request.slot
    || reservedItem.location !== "guildDepot"
    || reservedItem.ownerCharacterId
    || reservedItem.parentContainerId
    || !reservedItem.locked
    || !Number.isSafeInteger(reservedItem.quantity)
    || reservedItem.quantity !== 1
    || normalizeItemTier(reservedItem.tier) < target.minimumTier
    || normalizeItemUpgradeLevel(reservedItem.upgradeLevel) < target.minimumUpgradeLevel
  ) {
    return blocked(guild, characters, depot, "The reserved Guild Depot copy is invalid or no longer meets the loadout target.");
  }

  const { character, index } = characterMatches[0];
  if (!hasValidCharacterEquipmentData(character)) {
    return blocked(guild, characters, depot, `${character.name} has invalid inventory or capacity data.`);
  }
  if (!Number.isFinite(reservedItem.item.weight) || reservedItem.item.weight < 0) {
    return blocked(guild, characters, depot, "The reserved equipment has invalid transfer data.");
  }
  const previousItem = character.equipment[request.slot];
  const previousItemName = previousItem?.item.name;
  const existingOwnedItemIds = new Set([
    ...character.inventory.map((entry) => entry.id),
    ...character.characterDepot.map((entry) => entry.id),
    ...Object.values(character.equipment).flatMap((entry) => entry ? [entry.id] : []),
  ]);
  const workingDepot = {
    ...depot,
    items: depot.items.map((entry) =>
      entry.id === reservedItem.id ? { ...entry, locked: false } : entry),
  };
  const transfer = transferItem(character, workingDepot, reservedItem.id, 1, "depotToCharacter");
  if (transfer.movedQuantity !== 1) {
    return blocked(
      guild,
      characters,
      depot,
      transfer.rejectedReason ?? "The reserved equipment could not be transferred.",
    );
  }

  const transferredMatches = transfer.character.inventory.filter((entry) =>
    !existingOwnedItemIds.has(entry.id)
    && entry.itemId === request.itemId
    && entry.item.equipmentSlot === request.slot
    && entry.quantity === 1);
  if (transferredMatches.length !== 1) {
    return blocked(guild, characters, depot, "The transferred reserved equipment could not be verified.");
  }
  const transferredItem = transferredMatches[0];
  const equipped = equipItem(transfer.character, transferredItem);
  if (!equipped.equipped) {
    return blocked(
      guild,
      characters,
      depot,
      equipped.reason ?? "The reserved equipment could not be equipped.",
    );
  }

  const nextState = normalizeGuildLoadoutTemplatesState({
    ...current,
    procurementOrders: current.procurementOrders.filter((entry) => !matchesRequest(entry, request)),
    procurementReservations: current.procurementReservations.filter((entry) =>
      entry.inventoryItemId !== request.inventoryItemId),
    fulfillmentHistory: [
      ...current.fulfillmentHistory,
      {
        id: `fulfillment-${now.getTime()}-${request.inventoryItemId}`,
        characterId: character.id,
        characterName: character.name,
        templateId: template.id,
        templateName: template.name,
        slot: request.slot,
        itemId: reservedItem.itemId,
        itemName: reservedItem.item.name,
        inventoryItemId: reservedItem.id,
        previousItemId: previousItem?.itemId,
        previousItemName,
        fulfilledAt: now.toISOString(),
      },
    ],
  }, characterIds);
  const nextCharacters = characters.map((entry, entryIndex) =>
    entryIndex === index ? equipped.character : entry);
  return {
    success: true,
    guild: { ...guild, loadoutTemplates: nextState },
    characters: nextCharacters,
    depot: transfer.depot,
    message: `${reservedItem.item.name} was issued to ${character.name} and equipped.`,
    characterName: character.name,
    itemName: reservedItem.item.name,
    previousItemName,
  };
}

function isValidRequest(request: GuildLoadoutProcurementFulfillmentRequest) {
  return Boolean(
    request
    && typeof request.characterId === "string"
    && request.characterId
    && typeof request.templateId === "string"
    && request.templateId
    && typeof request.slot === "string"
    && request.slot
    && typeof request.itemId === "string"
    && request.itemId
    && typeof request.inventoryItemId === "string"
    && request.inventoryItemId
  );
}

function matchesRequest(
  entry: Pick<GuildLoadoutProcurementFulfillmentRequest, "characterId" | "templateId" | "slot" | "itemId">,
  request: GuildLoadoutProcurementFulfillmentRequest,
) {
  return entry.characterId === request.characterId
    && entry.templateId === request.templateId
    && entry.slot === request.slot
    && entry.itemId === request.itemId;
}

function hasValidCharacterEquipmentData(character: Character) {
  if (
    !Array.isArray(character.inventory)
    || !Array.isArray(character.characterDepot)
    || !character.equipment
    || typeof character.equipment !== "object"
    || !Number.isFinite(character.capacityMax)
    || character.capacityMax < 0
  ) return false;

  const ownedItems = [
    ...character.inventory,
    ...character.characterDepot,
    ...Object.values(character.equipment).flatMap((entry) => entry ? [entry] : []),
  ];
  const itemIds = new Set<string>();
  return ownedItems.every((entry) => {
    if (
      !entry
      || typeof entry.id !== "string"
      || !entry.id
      || itemIds.has(entry.id)
      || !entry.item
      || !Number.isFinite(entry.item.weight)
      || entry.item.weight < 0
      || !Number.isSafeInteger(entry.quantity)
      || entry.quantity < 1
    ) return false;
    itemIds.add(entry.id);
    return true;
  }) && Object.values(character.equipment).every((entry) => !entry || entry.quantity === 1);
}

function blocked(
  guild: Guild,
  characters: Character[],
  depot: GuildDepot,
  message: string,
): GuildLoadoutProcurementFulfillmentResult {
  return { success: false, guild, characters, depot, message };
}
