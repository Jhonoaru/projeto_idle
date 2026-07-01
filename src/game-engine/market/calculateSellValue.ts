import type { InventoryItem, Item, MarketPriceMode } from "../../shared/types";

export function calculateSellValue(
  item: Item,
  quantity: number,
  mode: MarketPriceMode = "npc_fixed",
) {
  const multiplier = mode === "simulated_market" ? getStableMarketMultiplier(item.id) : 1;
  const unitValue = Math.max(0, Math.round(item.value * multiplier));

  return {
    unitValue,
    totalValue: unitValue * quantity,
  };
}

export function calculateInventoryItemSellValue(
  inventoryItem: InventoryItem,
  mode: MarketPriceMode = "npc_fixed",
) {
  const base = calculateSellValue(inventoryItem.item, inventoryItem.quantity, mode);
  const multiplier = 1 + (inventoryItem.upgradeLevel ?? 0) * 0.05 + (inventoryItem.tier ?? 0) * 0.2;
  const unitValue = Math.max(0, Math.round(base.unitValue * multiplier));

  return {
    unitValue,
    totalValue: unitValue * inventoryItem.quantity,
  };
}

function getStableMarketMultiplier(itemId: string) {
  const seed = itemId.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return 0.8 + (seed % 41) / 100;
}
