import type { InventoryItem } from "../../shared/types";

export function mergeStackableItems(items: InventoryItem[]) {
  const merged = new Map<string, InventoryItem>();
  const result: InventoryItem[] = [];

  for (const inventoryItem of items) {
    if (!inventoryItem.item.stackable) {
      result.push(inventoryItem);
      continue;
    }

    const key = `${inventoryItem.location}-${inventoryItem.ownerCharacterId ?? "depot"}-${inventoryItem.itemId}`;
    const existing = merged.get(key);

    if (!existing) {
      const copy = { ...inventoryItem };
      merged.set(key, copy);
      result.push(copy);
      continue;
    }

    existing.quantity += inventoryItem.quantity;
  }

  return result;
}
