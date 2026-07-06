import { calculateCapacityUsed } from "../game-engine/inventory/calculateCapacityUsed";
import { buyMarketItem } from "../game-engine/market/buyMarketItem";
import { canSellItem } from "../game-engine/market/canSellItem";
import { sellItems } from "../game-engine/market/sellItems";
import type {
  Character,
  Guild,
  GuildDepot,
  InventoryItem,
  MarketItemCategory,
  MarketSellResult,
  ShopDeliveryTarget,
} from "../shared/types";

export function sellFromCharacterInventory(
  character: Character,
  guild: Guild,
  inventoryItemIds: string[],
) {
  const sale = sellItems({
    sourceItems: character.inventory,
    inventoryItemIds,
    source: "character_inventory",
  });

  return {
    character: {
      ...character,
      inventory: sale.remainingItems,
      capacityUsed: calculateCapacityUsed(sale.remainingItems),
    },
    guild: { ...guild, gold: guild.gold + sale.result.totalGold },
    result: withDestinationLog(sale.result, character.name, guild.name),
  };
}

export function sellFromCharacterDepot(
  character: Character,
  guild: Guild,
  inventoryItemIds: string[],
) {
  const sale = sellItems({
    sourceItems: character.characterDepot,
    inventoryItemIds,
    source: "character_depot",
  });

  return {
    character: {
      ...character,
      characterDepot: sale.remainingItems,
    },
    guild: { ...guild, gold: guild.gold + sale.result.totalGold },
    result: withDestinationLog(sale.result, character.name, guild.name),
  };
}

export function sellFromGuildDepot(
  guildDepot: GuildDepot,
  guild: Guild,
  inventoryItemIds: string[],
) {
  const sale = sellItems({
    sourceItems: guildDepot.items,
    inventoryItemIds,
    source: "guild_depot",
  });

  return {
    guildDepot: {
      ...guildDepot,
      items: sale.remainingItems,
      capacityUsed: calculateCapacityUsed(sale.remainingItems),
    },
    guild: { ...guild, gold: guild.gold + sale.result.totalGold },
    result: withDestinationLog(sale.result, guild.name),
  };
}

export function sellAllByCategory(
  items: InventoryItem[],
  category: MarketItemCategory,
) {
  return items
    .filter((inventoryItem) => category === "all" || inventoryItem.item.type === category)
    .filter((inventoryItem) => canSellItem(inventoryItem, items).warningLevel === "none")
    .map((inventoryItem) => inventoryItem.id);
}

export function buyFromNpcShop(
  character: Character,
  guild: Guild,
  guildDepot: GuildDepot,
  itemId: string,
  quantity: number,
  unitPrice: number,
  deliveryTarget: ShopDeliveryTarget,
) {
  return buyMarketItem({
    character,
    guild,
    guildDepot,
    itemId,
    quantity,
    unitPrice,
    deliveryTarget,
  });
}

export function toggleInventoryItemLock(items: InventoryItem[], inventoryItemId: string) {
  return items.map((inventoryItem) =>
    inventoryItem.id === inventoryItemId
      ? { ...inventoryItem, locked: !inventoryItem.locked }
      : inventoryItem,
  );
}

function withDestinationLog(
  result: MarketSellResult,
  targetName: string,
  guildName?: string,
): MarketSellResult {
  const destinationName = `Guilda ${guildName ?? targetName}`;

  return {
    ...result,
    logs:
      result.totalGold > 0
        ? [
            ...result.logs,
            `Gold enviado para ${destinationName}: ${result.totalGold.toLocaleString("en-US")}g.`,
          ]
        : result.logs,
  };
}
