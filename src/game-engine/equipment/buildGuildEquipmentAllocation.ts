import type { Character, EquipmentSlot, GuildDepot, InventoryItem } from "../../shared/types";
import { items } from "../../data/items";
import { calculateCapacityUsed } from "../inventory/calculateCapacityUsed";
import { canEquipItem } from "./canEquipItem";
import { armoryEquipmentSlots, scoreEquipmentItem } from "./buildGuildArmoryAudit";

export interface GuildEquipmentAllocation {
  id: string;
  characterId: string;
  characterName: string;
  vocation: Character["vocation"];
  level: number;
  slot: EquipmentSlot;
  inventoryItem: InventoryItem;
  currentItem?: InventoryItem;
  currentScore: number;
  targetScore: number;
  delta: number;
  canCarry: boolean;
  freeCapacity: number;
}

export interface UnassignedDepotEquipment {
  inventoryItem: InventoryItem;
  quantity: number;
}

interface AllocationTarget {
  character: Character;
  slot: EquipmentSlot;
  currentItem?: InventoryItem;
  currentScore: number;
}

interface EquipmentUnit {
  id: string;
  sourceKey: string;
  inventoryItem: InventoryItem;
}

export function buildGuildEquipmentAllocation(characters: Character[], depot: GuildDepot) {
  const safeCharacters = (Array.isArray(characters) ? characters : []).filter(Boolean);
  const safeDepotItems = Array.isArray(depot?.items) ? depot.items : [];
  const targets = safeCharacters.flatMap((character) => {
    const level = normalizeInteger(character.level);
    const safeCharacter = level === character.level ? character : { ...character, level };
    return armoryEquipmentSlots.map((slot): AllocationTarget => ({
      character: safeCharacter,
      slot,
      currentItem: character.equipment?.[slot],
      currentScore: scoreEquipmentItem(character, character.equipment?.[slot]),
    }));
  });
  const equipmentEntries = safeDepotItems.flatMap((entry, index) => {
    const quantity = normalizeQuantity(entry?.quantity);
    const definition = entry ? items[entry.itemId] : undefined;
    return entry?.item
      && entry.item.id === entry.itemId
      && definition?.type === "equipment"
      && definition.equipmentSlot
      && quantity > 0
      ? [{ sourceKey: `${entry.id || entry.itemId}:${index}`, inventoryItem: entry, quantity }]
      : [];
  }).sort((left, right) =>
    left.inventoryItem.item.name.localeCompare(right.inventoryItem.item.name)
    || left.inventoryItem.itemId.localeCompare(right.inventoryItem.itemId)
    || left.inventoryItem.id.localeCompare(right.inventoryItem.id)
    || left.sourceKey.localeCompare(right.sourceKey));
  const units: EquipmentUnit[] = equipmentEntries.flatMap((entry) =>
    Array.from({ length: Math.min(entry.quantity, targets.length) }, (_, unitIndex) => ({
      id: `${entry.sourceKey}:${unitIndex}`,
      sourceKey: entry.sourceKey,
      inventoryItem: entry.inventoryItem,
    })),
  );
  const rawDeltas = units.map((unit) => targets.map((target) => getAllocationDelta(unit.inventoryItem, target)));
  const cardinalityScale = Math.max(units.length, targets.length) + 1;
  const weightedDeltas = rawDeltas.map((row) => row.map((delta) => delta > 0 ? delta * cardinalityScale + 1 : 0));
  const assignment = maximumWeightAssignment(weightedDeltas);
  const allocatedBySource = new Map<string, number>();
  const allocations = assignment.flatMap((targetIndex, unitIndex) => {
    const delta = targetIndex >= 0 ? rawDeltas[unitIndex]?.[targetIndex] ?? 0 : 0;
    if (targetIndex < 0 || delta <= 0) return [];
    const unit = units[unitIndex];
    const target = targets[targetIndex];
    const targetScore = target.currentScore + delta;
    const freeCapacity = getFreeCapacity(target.character);
    allocatedBySource.set(unit.sourceKey, (allocatedBySource.get(unit.sourceKey) ?? 0) + 1);
    return [{
      id: `${unit.id}:${target.character.id}:${target.slot}`,
      characterId: target.character.id,
      characterName: target.character.name,
      vocation: target.character.vocation,
      level: normalizeInteger(target.character.level),
      slot: target.slot,
      inventoryItem: unit.inventoryItem,
      currentItem: target.currentItem,
      currentScore: target.currentScore,
      targetScore,
      delta,
      canCarry: normalizeNumber(unit.inventoryItem.item.weight) <= freeCapacity,
      freeCapacity,
    } satisfies GuildEquipmentAllocation];
  }).sort((left, right) =>
    safeCharacters.findIndex((character) => character.id === left.characterId)
      - safeCharacters.findIndex((character) => character.id === right.characterId)
    || armoryEquipmentSlots.indexOf(left.slot) - armoryEquipmentSlots.indexOf(right.slot)
    || left.inventoryItem.item.name.localeCompare(right.inventoryItem.item.name)
    || left.inventoryItem.id.localeCompare(right.inventoryItem.id));
  const unassignedEquipment = equipmentEntries.flatMap((entry) => {
    const quantity = Math.max(0, entry.quantity - (allocatedBySource.get(entry.sourceKey) ?? 0));
    return quantity > 0 ? [{ inventoryItem: entry.inventoryItem, quantity }] : [];
  });
  const roster = safeCharacters.map((character) => {
    const characterAllocations = allocations.filter((allocation) => allocation.characterId === character.id);
    return {
      characterId: character.id,
      name: character.name,
      vocation: character.vocation,
      level: normalizeInteger(character.level),
      status: character.status,
      allocations: characterAllocations,
      totalGain: characterAllocations.reduce((total, allocation) => total + allocation.delta, 0),
      readyTransfers: characterAllocations.filter((allocation) => allocation.canCarry).length,
    };
  });
  const contestedEntries = equipmentEntries.filter((entry) => {
    const representativeIndex = units.findIndex((unit) => unit.sourceKey === entry.sourceKey);
    if (representativeIndex < 0) return false;
    return rawDeltas[representativeIndex].filter((delta) => delta > 0).length > entry.quantity;
  }).length;

  return {
    allocations,
    roster,
    unassignedEquipment,
    summary: {
      depotEquipment: equipmentEntries.reduce((total, entry) => safeAdd(total, entry.quantity), 0),
      allocations: allocations.length,
      charactersUpgraded: roster.filter((entry) => entry.allocations.length > 0).length,
      totalGain: allocations.reduce((total, allocation) => safeAdd(total, allocation.delta), 0),
      readyTransfers: allocations.filter((allocation) => allocation.canCarry).length,
      contestedEntries,
      unassignedEquipment: unassignedEquipment.reduce((total, entry) => safeAdd(total, entry.quantity), 0),
    },
  };
}

export type GuildEquipmentAllocationPlan = ReturnType<typeof buildGuildEquipmentAllocation>;

function getAllocationDelta(inventoryItem: InventoryItem, target: AllocationTarget) {
  if (inventoryItem.item.equipmentSlot !== target.slot) return 0;
  if (!canEquipItem(target.character, inventoryItem).canEquip) return 0;
  const score = scoreEquipmentItem(target.character, inventoryItem);
  return Number.isFinite(score) ? Math.max(0, score - target.currentScore) : 0;
}

function getFreeCapacity(character: Character) {
  const capacityMax = normalizeNumber(character.capacityMax);
  const inventory = Array.isArray(character.inventory) ? character.inventory : [];
  const validInventory = inventory.filter((entry) =>
    Number.isFinite(entry?.item?.weight)
    && entry.item.weight >= 0
    && Number.isFinite(entry.quantity)
    && entry.quantity > 0);
  return Math.max(0, capacityMax - calculateCapacityUsed(validInventory));
}

function maximumWeightAssignment(weights: number[][]) {
  const rowCount = weights.length;
  const columnCount = weights[0]?.length ?? 0;
  if (rowCount === 0 || columnCount === 0) return Array(rowCount).fill(-1) as number[];
  const size = Math.max(rowCount, columnCount);
  const maxWeight = weights.reduce((maximum, row) => Math.max(maximum, ...row), 0);
  const costs = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => maxWeight - (weights[row]?.[column] ?? 0)),
  );
  const rowPotentials = Array(size + 1).fill(0);
  const columnPotentials = Array(size + 1).fill(0);
  const matchedRowByColumn = Array(size + 1).fill(0);
  const previousColumn = Array(size + 1).fill(0);

  for (let row = 1; row <= size; row += 1) {
    matchedRowByColumn[0] = row;
    let column = 0;
    const minimum = Array(size + 1).fill(Number.POSITIVE_INFINITY);
    const used = Array(size + 1).fill(false);
    do {
      used[column] = true;
      const matchedRow = matchedRowByColumn[column];
      let delta = Number.POSITIVE_INFINITY;
      let nextColumn = 0;
      for (let candidateColumn = 1; candidateColumn <= size; candidateColumn += 1) {
        if (used[candidateColumn]) continue;
        const reducedCost = costs[matchedRow - 1][candidateColumn - 1]
          - rowPotentials[matchedRow]
          - columnPotentials[candidateColumn];
        if (reducedCost < minimum[candidateColumn]) {
          minimum[candidateColumn] = reducedCost;
          previousColumn[candidateColumn] = column;
        }
        if (minimum[candidateColumn] < delta) {
          delta = minimum[candidateColumn];
          nextColumn = candidateColumn;
        }
      }
      for (let candidateColumn = 0; candidateColumn <= size; candidateColumn += 1) {
        if (used[candidateColumn]) {
          rowPotentials[matchedRowByColumn[candidateColumn]] += delta;
          columnPotentials[candidateColumn] -= delta;
        } else {
          minimum[candidateColumn] -= delta;
        }
      }
      column = nextColumn;
    } while (matchedRowByColumn[column] !== 0);

    do {
      const nextColumn = previousColumn[column];
      matchedRowByColumn[column] = matchedRowByColumn[nextColumn];
      column = nextColumn;
    } while (column !== 0);
  }

  const assignment = Array(rowCount).fill(-1);
  for (let column = 1; column <= size; column += 1) {
    const row = matchedRowByColumn[column] - 1;
    if (row >= 0 && row < rowCount && column <= columnCount) assignment[row] = column - 1;
  }
  return assignment;
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(parsed))) : 0;
}

function normalizeQuantity(value: unknown) {
  return normalizeInteger(value);
}

function normalizeNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function safeAdd(left: number, right: number) {
  return Math.min(Number.MAX_SAFE_INTEGER, left + right);
}
