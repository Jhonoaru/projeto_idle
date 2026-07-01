import { createInventoryItem } from "../../data/inventoryFactory";
import { getItemById } from "../../data/items";
import { shopItems } from "../../data/shopItems";
import { calculateCapacityUsed } from "../inventory/calculateCapacityUsed";
import { mergeStackableItems } from "../inventory/mergeStackableItems";
import { calculateMissingSuppliesForPreset } from "./calculateMissingSuppliesForPreset";
import { findBestContainerForSupply } from "./findBestContainerForSupply";
import type { Character, Guild, GuildDepot, HuntSupplyPreset } from "../../shared/types";

export function buyMissingSupplies(
  guild: Guild,
  character: Character,
  guildDepot: GuildDepot,
  preset: HuntSupplyPreset,
) {
  let gold = guild.gold;
  let inventory = character.inventory;
  const boughtItems: Array<{ itemId: string; itemName: string; quantity: number; totalCost: number }> = [];
  const missingItems: Array<{ itemId: string; itemName: string; quantity: number }> = [];
  const warnings: string[] = [];

  for (const missing of calculateMissingSuppliesForPreset({ ...character, inventory }, guildDepot, preset)) {
    if (missing.missingQuantity <= 0) continue;

    const shopItem = shopItems.find((item) => item.itemId === missing.itemId);
    const item = getItemById(missing.itemId);
    if (!shopItem) {
      warnings.push(`${item.name} nao esta disponivel no Market NPC.`);
      missingItems.push({ itemId: item.id, itemName: item.name, quantity: missing.missingQuantity });
      continue;
    }

    const totalCost = shopItem.buyPrice * missing.missingQuantity;
    if (gold < totalCost) {
      warnings.push("Preparacao falhou: gold insuficiente.");
      missingItems.push({ itemId: item.id, itemName: item.name, quantity: missing.missingQuantity });
      continue;
    }

    gold -= totalCost;
    const bought = createInventoryItem(item.id, missing.missingQuantity, "character", character.id);
    const presetItem = preset.items.find((entry) => entry.itemId === item.id);
    const container = findBestContainerForSupply(inventory, bought, presetItem?.targetContainerType);
    inventory = mergeStackableItems([...inventory, container ? { ...bought, parentContainerId: container.id } : bought]);
    boughtItems.push({ itemId: item.id, itemName: item.name, quantity: missing.missingQuantity, totalCost });
  }

  const capacityUsed = calculateCapacityUsed(inventory);
  if (capacityUsed > character.capacityMax) {
    return {
      guild,
      character,
      boughtItems: [],
      missingItems,
      warnings: [...warnings, "Preparacao falhou: capacity insuficiente."],
    };
  }

  return {
    guild: { ...guild, gold },
    character: { ...character, inventory, capacityUsed },
    boughtItems,
    missingItems,
    warnings,
  };
}
