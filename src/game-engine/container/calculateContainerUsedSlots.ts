import type { InventoryItem } from "../../shared/types";
import { getContainerContents } from "./getContainerContents";

export function calculateContainerUsedSlots(
  allItems: InventoryItem[],
  containerInventoryItemId: string,
) {
  return getContainerContents(allItems, containerInventoryItemId).length;
}
