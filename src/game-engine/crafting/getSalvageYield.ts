import type { InventoryItem, SalvageMaterialResult } from "../../shared/types";

export function getSalvageYield(inventoryItem: InventoryItem): SalvageMaterialResult[] {
  const item = inventoryItem.item;
  if (item.type !== "equipment" || item.rarity === "legendary" || item.equipmentFamily === "artifact") return [];

  const primaryItemId = usesMetal(item) ? "iron-ore" : "old-cloth";
  const primaryQuantity = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 0 }[item.rarity];
  const dustQuantity = item.rarity === "rare" ? 1 : item.rarity === "epic" ? 2 : 0;
  const recovered: SalvageMaterialResult[] = [{ itemId: primaryItemId, quantity: primaryQuantity }];
  if (dustQuantity > 0) recovered.push({ itemId: "enchanted-dust", quantity: dustQuantity });
  return recovered.filter((entry) => entry.quantity > 0);
}

function usesMetal(item: InventoryItem["item"]) {
  if (item.equipmentFamily === "vanguard") return true;
  if (item.offhandType === "shield") return true;
  if ((item.armor ?? 0) >= 5) return true;
  return false;
}
