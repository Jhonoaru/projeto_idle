import { equipmentSetOrder, equipmentSets, type EquipmentSetStatBonus } from "../../data/equipmentSets";
import type { EquipmentSetId, EquippedItems, InventoryItem, Item } from "../../shared/types";

export interface EquipmentSetProgress {
  definition: (typeof equipmentSets)[EquipmentSetId];
  equippedPieces: number;
  totalPieces: number;
  matchedGroupIds: string[];
  activeThresholds: number[];
  nextThreshold?: number;
}

export function getEquipmentSetForItem(item?: Item) {
  const explicitId = normalizeEquipmentSetId(item?.equipmentSetId);
  if (explicitId) return equipmentSets[explicitId];
  return equipmentSetOrder
    .map((setId) => equipmentSets[setId])
    .find((definition) => definition.pieceGroups.some((group) => group.itemIds.includes(item?.id ?? "")));
}

export function getEquipmentSetProgress(equipment: EquippedItems = {}): EquipmentSetProgress[] {
  const equippedItems = Object.values(equipment).filter(Boolean) as InventoryItem[];
  const equippedItemIds = new Set(equippedItems.map((entry) => entry.itemId));

  return equipmentSetOrder.map((setId) => {
    const definition = equipmentSets[setId];
    const matchedGroupIds = definition.pieceGroups
      .filter((group) => group.itemIds.some((itemId) => equippedItemIds.has(itemId)))
      .map((group) => group.id);
    const equippedPieces = matchedGroupIds.length;
    const activeThresholds = definition.thresholds
      .filter((threshold) => equippedPieces >= threshold.pieces)
      .map((threshold) => threshold.pieces);

    return {
      definition,
      equippedPieces,
      totalPieces: definition.pieceGroups.length,
      matchedGroupIds,
      activeThresholds,
      nextThreshold: definition.thresholds.find((threshold) => equippedPieces < threshold.pieces)?.pieces,
    };
  });
}

export function calculateEquipmentSetBonuses(equipment: EquippedItems = {}): Required<EquipmentSetStatBonus> {
  const totals: Required<EquipmentSetStatBonus> = {
    attackPowerPercent: 0,
    defensePowerPercent: 0,
    maxHealthFlat: 0,
    maxManaFlat: 0,
    capacityFlat: 0,
    speedFlat: 0,
    critChancePercent: 0,
  };

  for (const progress of getEquipmentSetProgress(equipment)) {
    for (const threshold of progress.definition.thresholds) {
      if (progress.equippedPieces < threshold.pieces) continue;
      for (const key of Object.keys(totals) as Array<keyof typeof totals>) {
        totals[key] += normalizeBonus(threshold.bonuses[key]);
      }
    }
  }

  return totals;
}

export function formatEquipmentSetBonus(bonus: EquipmentSetStatBonus) {
  return [
    bonus.attackPowerPercent ? `Attack +${bonus.attackPowerPercent}%` : undefined,
    bonus.defensePowerPercent ? `Defense +${bonus.defensePowerPercent}%` : undefined,
    bonus.maxHealthFlat ? `Health +${bonus.maxHealthFlat}` : undefined,
    bonus.maxManaFlat ? `Mana +${bonus.maxManaFlat}` : undefined,
    bonus.capacityFlat ? `Capacity +${bonus.capacityFlat}` : undefined,
    bonus.speedFlat ? `Speed +${bonus.speedFlat}` : undefined,
    bonus.critChancePercent ? `Crit +${bonus.critChancePercent}%` : undefined,
  ].filter(Boolean).join(" / ");
}

function normalizeEquipmentSetId(value: unknown): EquipmentSetId | undefined {
  return typeof value === "string" && value in equipmentSets ? value as EquipmentSetId : undefined;
}

function normalizeBonus(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}
