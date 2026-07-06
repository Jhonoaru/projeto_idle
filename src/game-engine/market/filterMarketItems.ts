import type { InventoryItem, MarketFilter } from "../../shared/types";

export function filterMarketItems(items: InventoryItem[], filter: MarketFilter) {
  const search = filter.search?.trim().toLowerCase();

  return items.filter((inventoryItem) => {
    const item = inventoryItem.item;
    if (!item) return false;

    const matchesCategory = filter.category === "all" || item.type === filter.category;
    const matchesRarity =
      !filter.rarity || filter.rarity === "all" || item.rarity === filter.rarity;
    const itemName = item.name ?? "Unknown Item";
    const matchesSearch = !search || itemName.toLowerCase().includes(search);

    return matchesCategory && matchesRarity && matchesSearch;
  });
}
