import { createInventoryItem } from "../../data/inventoryFactory";
import { getItemById } from "../../data/items";
import { shopItems } from "../../data/shopItems";
import { calculateCapacityUsed } from "../inventory/calculateCapacityUsed";
import { mergeStackableItems } from "../inventory/mergeStackableItems";
import type { Character, Guild, GuildDepot, ShopDeliveryTarget } from "../../shared/types";

interface BuyMarketItemInput {
  character: Character;
  guild: Guild;
  guildDepot: GuildDepot;
  itemId: string;
  quantity: number;
  unitPrice: number;
  deliveryTarget: ShopDeliveryTarget;
}

export function buyMarketItem({
  character,
  guild,
  guildDepot,
  itemId,
  quantity,
  unitPrice,
  deliveryTarget,
}: BuyMarketItemInput) {
  const normalizedQuantity = Math.floor(Number(quantity));
  const normalizedUnitPrice = Math.floor(Number(unitPrice));
  const currentGold = Number.isFinite(guild.gold) && guild.gold > 0 ? guild.gold : 0;
  const shopItem = shopItems.find((entry) => entry.itemId === itemId);

  if (!shopItem) {
    return blocked(character, guild, guildDepot, "Compra bloqueada: item nao esta disponivel no Market NPC.");
  }

  let item;
  try {
    item = getItemById(itemId);
  } catch {
    return blocked(character, guild, guildDepot, "Compra bloqueada: item invalido no catalogo do Market.");
  }

  if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
    return blocked(character, guild, guildDepot, `Compra bloqueada: quantidade invalida para ${item.name}.`);
  }

  if (!Number.isFinite(normalizedUnitPrice) || normalizedUnitPrice <= 0) {
    return blocked(character, guild, guildDepot, `Compra bloqueada: preco invalido para ${item.name}.`);
  }

  if (normalizedUnitPrice !== shopItem.buyPrice) {
    return blocked(character, guild, guildDepot, `Compra bloqueada: preco de ${item.name} mudou no catalogo.`);
  }

  const totalCost = normalizedUnitPrice * normalizedQuantity;

  if (!Number.isFinite(totalCost) || totalCost <= 0) {
    return blocked(character, guild, guildDepot, `Compra bloqueada: total invalido para ${item.name}.`);
  }

  if (currentGold < totalCost) {
    return blocked(character, guild, guildDepot, `Compra bloqueada: gold insuficiente para ${item.name}.`);
  }

  if (item.levelRequirement && character.level < item.levelRequirement) {
    return blocked(character, guild, guildDepot, `Compra bloqueada: ${item.name} requer level ${item.levelRequirement}.`);
  }

  if (item.vocationRestriction?.length && !item.vocationRestriction.includes(character.vocation)) {
    return blocked(character, guild, guildDepot, `Compra bloqueada: ${item.name} nao serve para ${character.vocation}.`);
  }

  const inventoryItem = createInventoryItem(
    itemId,
    normalizedQuantity,
    deliveryTarget === "guild_depot" ? "guildDepot" : "character",
    deliveryTarget === "guild_depot" ? undefined : character.id,
  );

  if (deliveryTarget === "character_inventory") {
    const inventory = mergeStackableItems([...character.inventory, inventoryItem]);
    const capacityUsed = calculateCapacityUsed(inventory);

    if (capacityUsed > character.capacityMax) {
      return blocked(character, guild, guildDepot, `Compra bloqueada: ${character.name} nao tem capacity para ${item.name}.`);
    }

    return {
      character: { ...character, inventory, capacityUsed },
      guild: { ...guild, gold: Math.max(0, currentGold - totalCost) },
      guildDepot,
      success: true,
      logs: [`Guilda ${guild.name} comprou ${item.name} x${normalizedQuantity} por ${totalCost.toLocaleString("en-US")}g para ${character.name}.`],
    };
  }

  if (deliveryTarget === "character_depot") {
    return {
      character: {
        ...character,
        characterDepot: mergeStackableItems([...character.characterDepot, inventoryItem]),
      },
      guild: { ...guild, gold: Math.max(0, currentGold - totalCost) },
      guildDepot,
      success: true,
      logs: [`Guilda ${guild.name} comprou ${item.name} x${normalizedQuantity} por ${totalCost.toLocaleString("en-US")}g para o Depot de ${character.name}.`],
    };
  }

  const depotItems = mergeStackableItems([...guildDepot.items, inventoryItem]);

  return {
    character,
    guild: { ...guild, gold: Math.max(0, currentGold - totalCost) },
    guildDepot: {
      ...guildDepot,
      items: depotItems,
      capacityUsed: calculateCapacityUsed(depotItems),
    },
    success: true,
    logs: [`Guilda ${guild.name} comprou ${item.name} x${normalizedQuantity} por ${totalCost.toLocaleString("en-US")}g para o Guild Depot.`],
  };
}

function blocked(character: Character, guild: Guild, guildDepot: GuildDepot, message: string) {
  return {
    character,
    guild,
    guildDepot,
    success: false,
    logs: [message],
  };
}
