import { getItemById } from "../../data/items";
import { createSeededRandom, randomInt } from "./random";
import type { HuntLootResult, Monster } from "../../shared/types";

export function rollLoot(
  monster: Monster,
  kills: number,
  seed = `${monster.id}-${kills}`,
): HuntLootResult[] {
  const random = createSeededRandom(seed);
  const lootByItem = new Map<string, HuntLootResult>();

  for (const item of monster.lootTable) {
    let quantity = 0;

    for (let kill = 0; kill < kills; kill += 1) {
      if (random() <= item.chance) {
        quantity += randomInt(random, item.minQuantity, item.maxQuantity);
      }
    }

    if (quantity > 0) {
      const catalogItem = getItemById(item.itemId);
      lootByItem.set(item.itemId, {
        itemId: item.itemId,
        itemName: catalogItem.name,
        quantity,
        totalValue: quantity * catalogItem.value,
        rarity: catalogItem.rarity,
        weightTotal: Number((quantity * catalogItem.weight).toFixed(2)),
        item: catalogItem,
      });
    }
  }

  return [...lootByItem.values()];
}
