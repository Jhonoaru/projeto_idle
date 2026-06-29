import type { InventoryItem, Item } from "../../shared/types";

export function isContainerItem(item: Item | InventoryItem) {
  return "item" in item ? item.item.isContainer === true : item.isContainer === true;
}
