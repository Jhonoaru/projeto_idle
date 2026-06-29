import type { Character } from "../../shared/types";

export function getAvailableSupplies(character: Character) {
  const available = new Map<string, number>();

  for (const inventoryItem of character.inventory) {
    available.set(
      inventoryItem.itemId,
      (available.get(inventoryItem.itemId) ?? 0) + inventoryItem.quantity,
    );
  }

  return available;
}
