import { calculateCapacityUsed } from "../game-engine/inventory/calculateCapacityUsed";
import { createInventoryItem } from "../data/inventoryFactory";
import { getItemById } from "../data/items";
import { mergeStackableItems } from "../game-engine/inventory/mergeStackableItems";
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
  const item = getItemById(itemId);
  const totalCost = unitPrice * quantity;

  if (guild.gold < totalCost) {
    return {
      character,
      guild,
      guildDepot,
      success: false,
      logs: [`Compra bloqueada: gold insuficiente para ${item.name}.`],
    };
  }

  const inventoryItem = createInventoryItem(
    itemId,
    quantity,
    deliveryTarget === "guild_depot" ? "guildDepot" : "character",
    deliveryTarget === "guild_depot" ? undefined : character.id,
  );

  if (deliveryTarget === "character_inventory") {
    const inventory = mergeStackableItems([...character.inventory, inventoryItem]);
    const capacityUsed = calculateCapacityUsed(inventory);

    if (capacityUsed > character.capacityMax) {
      return {
        character,
        guild,
        guildDepot,
        success: false,
        logs: [`Compra bloqueada: ${character.name} nao tem capacity para ${item.name}.`],
      };
    }

    return {
      character: {
        ...character,
        inventory,
        capacityUsed,
      },
      guild: { ...guild, gold: guild.gold - totalCost },
      guildDepot,
      success: true,
      logs: [`Guilda ${guild.name} comprou ${item.name} x${quantity} por ${totalCost.toLocaleString("en-US")}g para ${character.name}.`],
    };
  }

  if (deliveryTarget === "character_depot") {
    return {
      character: {
        ...character,
        characterDepot: mergeStackableItems([...character.characterDepot, inventoryItem]),
      },
      guild: { ...guild, gold: guild.gold - totalCost },
      guildDepot,
      success: true,
      logs: [`Guilda ${guild.name} comprou ${item.name} x${quantity} por ${totalCost.toLocaleString("en-US")}g para o Depot de ${character.name}.`],
    };
  }

  const depotItems = mergeStackableItems([...guildDepot.items, inventoryItem]);

  return {
    character,
    guild: { ...guild, gold: guild.gold - totalCost },
    guildDepot: {
      ...guildDepot,
      items: depotItems,
      capacityUsed: calculateCapacityUsed(depotItems),
    },
    success: true,
    logs: [`Guilda ${guild.name} comprou ${item.name} x${quantity} por ${totalCost.toLocaleString("en-US")}g para o Guild Depot.`],
  };
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
