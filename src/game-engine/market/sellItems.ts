import { calculateSellValue } from "./calculateSellValue";
import { isSellableItem } from "./getSellableItems";
import type {
  InventoryItem,
  MarketPriceMode,
  MarketSellEntry,
  MarketSellResult,
  SellSource,
} from "../../shared/types";

interface SellItemsInput {
  sourceItems: InventoryItem[];
  inventoryItemIds: string[];
  source: SellSource;
  mode?: MarketPriceMode;
}

export function sellItems({
  sourceItems,
  inventoryItemIds,
  source,
  mode = "npc_fixed",
}: SellItemsInput): { remainingItems: InventoryItem[]; result: MarketSellResult } {
  const idsToSell = new Set(inventoryItemIds);
  const soldItems: MarketSellEntry[] = [];
  const logs: string[] = [];
  const remainingItems: InventoryItem[] = [];

  for (const inventoryItem of sourceItems) {
    if (!idsToSell.has(inventoryItem.id)) {
      remainingItems.push(inventoryItem);
      continue;
    }

    if (!isSellableItem(inventoryItem)) {
      logs.push(`${inventoryItem.item.name} esta travado ou nao pode ser vendido.`);
      remainingItems.push(inventoryItem);
      continue;
    }

    const quantity = inventoryItem.quantity;
    const value = calculateSellValue(inventoryItem.item, quantity, mode);
    soldItems.push({
      inventoryItemId: inventoryItem.id,
      itemId: inventoryItem.itemId,
      itemName: inventoryItem.item.name,
      quantity,
      unitValue: value.unitValue,
      totalValue: value.totalValue,
      source,
    });
    logs.push(
      `${inventoryItem.item.name} x${quantity} vendido por ${value.totalValue.toLocaleString("en-US")} gold.`,
    );
  }

  const totalGold = soldItems.reduce((total, entry) => total + entry.totalValue, 0);

  return {
    remainingItems,
    result: {
      success: soldItems.length > 0,
      soldItems,
      totalGold,
      destination: "guild_gold",
      logs,
    },
  };
}
