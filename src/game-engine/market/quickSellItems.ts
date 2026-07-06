import { calculateInventoryItemSellValue } from "./calculateSellValue";
import { canSellItem } from "./canSellItem";
import type { InventoryItem, SellSource } from "../../shared/types";

export interface QuickSellCandidate {
  inventoryItem: InventoryItem;
  source: SellSource;
  totalGold: number;
  selectedByDefault: boolean;
  canQuickSell: boolean;
  reason?: string;
}

export function getQuickSellCandidates(
  sourceItems: InventoryItem[],
  source: SellSource,
): QuickSellCandidate[] {
  return sourceItems.map((inventoryItem) => {
    const status = canSellItem(inventoryItem, sourceItems);
    const value = calculateInventoryItemSellValue(inventoryItem);
    const selectedByDefault =
      status.warningLevel === "none" &&
      (inventoryItem.item.type === "creature_product" || inventoryItem.item.type === "material" || inventoryItem.item.type === "misc");

    return {
      inventoryItem,
      source,
      totalGold: value.totalValue,
      selectedByDefault,
      canQuickSell: status.canSell && status.warningLevel === "none",
      reason: status.reason,
    };
  });
}

export function summarizeQuickSellSelection(candidates: QuickSellCandidate[], selectedIds: string[]) {
  const selected = new Set(selectedIds);
  const selectedCandidates = candidates.filter((candidate) =>
    selected.has(candidate.inventoryItem.id) && candidate.canQuickSell,
  );

  return {
    selectedCount: selectedCandidates.length,
    totalGold: selectedCandidates.reduce((total, candidate) => total + candidate.totalGold, 0),
    selectedIds: selectedCandidates.map((candidate) => candidate.inventoryItem.id),
  };
}
