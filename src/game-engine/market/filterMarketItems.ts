import type { InventoryItem, MarketFilter } from "../../shared/types";

export function filterMarketItems(items: InventoryItem[], filter: MarketFilter) {
  const search = filter.search?.trim().toLowerCase();

  return items.filter((inventoryItem) => {
    const item = inventoryItem.item;
    const matchesCategory = filter.category === "all" || item.type === filter.category;
    const matchesRarity =
      !filter.rarity || filter.rarity === "all" || item.rarity === filter.rarity;
    const matchesSearch = !search || item.name.toLowerCase().includes(search);

    return matchesCategory && matchesRarity && matchesSearch;
  });
}
