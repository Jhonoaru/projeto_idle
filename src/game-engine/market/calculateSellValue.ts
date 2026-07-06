import type { InventoryItem, Item, MarketPriceMode } from "../../shared/types";

export function calculateSellValue(
  item: Item,
  quantity: number,
  mode: MarketPriceMode = "npc_fixed",
) {
  const multiplier = mode === "simulated_market" ? getStableMarketMultiplier(item.id) : 1;
  const unitValue = Math.max(0, Math.round(item.value * multiplier));
  const safeQuantity = normalizeQuantity(quantity);

  return {
    unitValue,
    totalValue: unitValue * safeQuantity,
  };
}

export function calculateInventoryItemSellValue(
  inventoryItem: InventoryItem,
  mode: MarketPriceMode = "npc_fixed",
) {
  const quantity = normalizeQuantity(inventoryItem.quantity);
  const base = calculateSellValue(inventoryItem.item, quantity, mode);
  const multiplier = 1 + (inventoryItem.upgradeLevel ?? 0) * 0.05 + (inventoryItem.tier ?? 0) * 0.2;
  const unitValue = Math.max(0, Math.round(base.unitValue * multiplier));

  return {
    unitValue,
    totalValue: unitValue * quantity,
  };
}

function normalizeQuantity(quantity: number) {
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
}

function getStableMarketMultiplier(itemId: string) {
  const seed = itemId.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return 0.8 + (seed % 41) / 100;
}
