import { getItemById } from "./items";
import type { InventoryItem } from "../shared/types";

let inventorySequence = 0;

export function createInventoryItem(
  itemId: string,
  quantity: number,
  location: InventoryItem["location"],
  ownerCharacterId?: string,
): InventoryItem {
  inventorySequence += 1;

  return {
    id: `inventory-${itemId}-${Date.now()}-${inventorySequence}`,
    itemId,
    item: getItemById(itemId),
    quantity,
    ownerCharacterId,
    location,
  };
}
