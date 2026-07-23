import type { Character, EquipmentSlot, GuildDepot } from "../../shared/types";
import { transferItem } from "../inventory/transferItem";
import { buildGuildEquipmentAllocation, type GuildEquipmentAllocation } from "./buildGuildEquipmentAllocation";
import { equipItem } from "./equipItem";

export interface GuildEquipmentOrderRequest {
  characterId: string;
  inventoryItemId: string;
  slot: EquipmentSlot;
}

export interface GuildEquipmentOrderOutcome {
  success: boolean;
  characterId: string;
  characterName?: string;
  itemName?: string;
  previousItemName?: string;
  reason?: string;
}

export interface GuildEquipmentOrderResult {
  characters: Character[];
  depot: GuildDepot;
  success: boolean;
  completed: number;
  failed: number;
  message: string;
  outcomes: GuildEquipmentOrderOutcome[];
}

export function executeGuildEquipmentOrder(
  characters: Character[],
  depot: GuildDepot,
  request: GuildEquipmentOrderRequest,
): GuildEquipmentOrderResult {
  const safeCharacters = Array.isArray(characters) ? characters : [];
  if (!hasValidRosterEntries(safeCharacters)) {
    return blocked(safeCharacters, depot, request?.characterId ?? "", "The guild roster contains invalid character data.");
  }
  if (!request || typeof request !== "object") {
    return blocked(safeCharacters, depot, "", "The quartermaster order request is invalid.");
  }
  const plan = buildGuildEquipmentAllocation(safeCharacters, depot);
  const allocation = plan.allocations.find((entry) =>
    entry.characterId === request.characterId
    && entry.inventoryItem.id === request.inventoryItemId
    && entry.slot === request.slot);

  if (!allocation) {
    return blocked(safeCharacters, depot, request.characterId, "This quartermaster order is no longer available.");
  }

  const execution = executeValidatedOrder(safeCharacters, depot, allocation);
  return {
    characters: execution.characters,
    depot: execution.depot,
    success: execution.outcome.success,
    completed: execution.outcome.success ? 1 : 0,
    failed: execution.outcome.success ? 0 : 1,
    message: execution.outcome.success
      ? `${execution.outcome.characterName} received and equipped ${execution.outcome.itemName}.`
      : execution.outcome.reason ?? "The quartermaster order could not be completed.",
    outcomes: [execution.outcome],
  };
}

export function executeAllReadyGuildEquipmentOrders(
  characters: Character[],
  depot: GuildDepot,
): GuildEquipmentOrderResult {
  const safeCharacters = Array.isArray(characters) ? characters : [];
  if (!hasValidRosterEntries(safeCharacters)) {
    return blocked(safeCharacters, depot, "", "The guild roster contains invalid character data.");
  }
  const plan = buildGuildEquipmentAllocation(safeCharacters, depot);
  const readyOrders = plan.allocations.filter((allocation) => allocation.canCarry);

  if (readyOrders.length === 0) {
    return {
      characters: safeCharacters,
      depot,
      success: false,
      completed: 0,
      failed: plan.allocations.length,
      message: plan.allocations.length > 0
        ? "No allocation is currently ready for transfer."
        : "There are no quartermaster orders to execute.",
      outcomes: [],
    };
  }

  let currentCharacters = safeCharacters;
  let currentDepot = depot;
  const outcomes: GuildEquipmentOrderOutcome[] = [];

  for (const allocation of readyOrders) {
    const execution = executeValidatedOrder(currentCharacters, currentDepot, allocation);
    currentCharacters = execution.characters;
    currentDepot = execution.depot;
    outcomes.push(execution.outcome);
  }

  const completed = outcomes.filter((outcome) => outcome.success).length;
  const failed = plan.allocations.length - completed;
  return {
    characters: currentCharacters,
    depot: currentDepot,
    success: completed > 0,
    completed,
    failed,
    message: completed > 0
      ? `${completed} quartermaster ${completed === 1 ? "order" : "orders"} completed${failed > 0 ? `; ${failed} left pending.` : "."}`
      : "No quartermaster order could be completed.",
    outcomes,
  };
}

function executeValidatedOrder(
  characters: Character[],
  depot: GuildDepot,
  allocation: GuildEquipmentAllocation,
) {
  const characterMatches = characters
    .map((character, index) => ({ character, index }))
    .filter((entry) => entry.character.id === allocation.characterId);
  const depotMatches = (Array.isArray(depot?.items) ? depot.items : [])
    .filter((entry) => entry.id === allocation.inventoryItem.id);

  if (characterMatches.length !== 1) {
    return failedExecution(characters, depot, allocation, "The assigned adventurer is missing or duplicated.");
  }
  if (depotMatches.length !== 1) {
    return failedExecution(characters, depot, allocation, "The assigned Depot item is missing or duplicated.");
  }
  if (!allocation.canCarry) {
    return failedExecution(characters, depot, allocation, `${allocation.characterName} does not have enough free capacity.`);
  }

  const { character, index } = characterMatches[0];
  if (
    !Array.isArray(character.inventory)
    || !character.equipment
    || typeof character.equipment !== "object"
    || !Number.isFinite(character.capacityMax)
    || character.capacityMax < 0
    || character.inventory.some((entry) =>
      !entry?.item
      || !Number.isFinite(entry.item.weight)
      || entry.item.weight < 0
      || !Number.isFinite(entry.quantity)
      || entry.quantity <= 0)
    || Object.values(character.equipment).some((entry) =>
      !entry?.item
      || !Number.isFinite(entry.item.weight)
      || entry.item.weight < 0
      || !Number.isSafeInteger(entry.quantity)
      || entry.quantity !== 1)
  ) {
    return failedExecution(characters, depot, allocation, `${allocation.characterName} has invalid inventory or capacity data.`);
  }
  if (
    !Number.isFinite(depotMatches[0].item.weight)
    || depotMatches[0].item.weight < 0
    || !Number.isSafeInteger(depotMatches[0].quantity)
    || depotMatches[0].quantity < 1
  ) {
    return failedExecution(characters, depot, allocation, "The assigned Depot item has invalid transfer data.");
  }

  const transfer = transferItem(character, depot, depotMatches[0].id, 1, "depotToCharacter");
  if (transfer.movedQuantity !== 1) {
    return failedExecution(
      characters,
      depot,
      allocation,
      transfer.rejectedReason ?? "The item could not be transferred from the Guild Depot.",
    );
  }

  const transferredItem = transfer.character.inventory.at(-1);
  if (
    !transferredItem
    || transferredItem.itemId !== allocation.inventoryItem.itemId
    || transferredItem.item.equipmentSlot !== allocation.slot
    || transferredItem.quantity !== 1
  ) {
    return failedExecution(characters, depot, allocation, "The transferred item could not be verified.");
  }

  const equipped = equipItem(transfer.character, transferredItem);
  if (!equipped.equipped) {
    return failedExecution(
      characters,
      depot,
      allocation,
      equipped.reason ?? "The transferred item could not be equipped.",
    );
  }

  const nextCharacters = characters.map((entry, entryIndex) =>
    entryIndex === index ? equipped.character : entry);
  return {
    characters: nextCharacters,
    depot: transfer.depot,
    outcome: {
      success: true,
      characterId: character.id,
      characterName: character.name,
      itemName: allocation.inventoryItem.item.name,
      previousItemName: allocation.currentItem?.item.name,
    } satisfies GuildEquipmentOrderOutcome,
  };
}

function failedExecution(
  characters: Character[],
  depot: GuildDepot,
  allocation: GuildEquipmentAllocation,
  reason: string,
) {
  return {
    characters,
    depot,
    outcome: {
      success: false,
      characterId: allocation.characterId,
      characterName: allocation.characterName,
      itemName: allocation.inventoryItem.item.name,
      previousItemName: allocation.currentItem?.item.name,
      reason,
    } satisfies GuildEquipmentOrderOutcome,
  };
}

function hasValidRosterEntries(characters: Character[]) {
  return characters.every((character) =>
    Boolean(character)
    && typeof character === "object"
    && typeof character.id === "string"
    && character.id.length > 0);
}

function blocked(
  characters: Character[],
  depot: GuildDepot,
  characterId: string,
  reason: string,
): GuildEquipmentOrderResult {
  return {
    characters,
    depot,
    success: false,
    completed: 0,
    failed: 1,
    message: reason,
    outcomes: [{ success: false, characterId, reason }],
  };
}
