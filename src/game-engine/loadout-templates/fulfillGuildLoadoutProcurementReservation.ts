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
): GuildLoadoutProcurementFulfillmentResult {
  if (!isValidRequest(request)) {
    return blocked(guild, characters, depot, "The reserved gear request is invalid.");
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
  if (!target) {
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
  const previousItemName = character.equipment[request.slot]?.item.name;
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

  const transferredItem = transfer.character.inventory.at(-1);
  if (
    !transferredItem
    || transferredItem.itemId !== request.itemId
    || transferredItem.item.equipmentSlot !== request.slot
    || transferredItem.quantity !== 1
  ) {
    return blocked(guild, characters, depot, "The transferred reserved equipment could not be verified.");
  }
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

function blocked(
  guild: Guild,
  characters: Character[],
  depot: GuildDepot,
  message: string,
): GuildLoadoutProcurementFulfillmentResult {
  return { success: false, guild, characters, depot, message };
}
