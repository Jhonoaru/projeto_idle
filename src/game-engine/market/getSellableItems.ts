import type { InventoryItem } from "../../shared/types";

export function getSellableItems(sourceItems: InventoryItem[]) {
  return sourceItems.filter((inventoryItem) => isSellableItem(inventoryItem, sourceItems));
}

export function isSellableItem(inventoryItem: InventoryItem, sourceItems: InventoryItem[] = []) {
  const item = inventoryItem.item;

  if (inventoryItem.locked) return false;
  if ((inventoryItem.imbuements ?? []).length > 0) return false;
  if (inventoryItem.parentContainerId) return false;
  if (
    item.isContainer &&
    sourceItems.some((entry) => entry.parentContainerId === inventoryItem.id)
  ) {
    return false;
  }
  if (item.type === "quest") return false;
  if (item.value <= 0) return false;

  return true;
}
