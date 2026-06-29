import type { InventoryItem } from "../../shared/types";

export function getSellableItems(sourceItems: InventoryItem[]) {
  return sourceItems.filter(isSellableItem);
}

export function isSellableItem(inventoryItem: InventoryItem) {
  const item = inventoryItem.item;

  if (inventoryItem.locked) return false;
  if (item.type === "quest") return false;
  if (item.value <= 0) return false;

  return true;
}
