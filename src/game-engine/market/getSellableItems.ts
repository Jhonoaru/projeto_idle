import type { InventoryItem } from "../../shared/types";
import { canSellItem } from "./canSellItem";

export function getSellableItems(sourceItems: InventoryItem[]) {
  return sourceItems.filter((inventoryItem) => isSellableItem(inventoryItem, sourceItems));
}

export function isSellableItem(inventoryItem: InventoryItem, sourceItems: InventoryItem[] = []) {
  return canSellItem(inventoryItem, sourceItems).canSell;
}
