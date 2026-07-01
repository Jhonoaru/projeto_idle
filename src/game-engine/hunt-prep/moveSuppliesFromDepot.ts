import { createInventoryItem } from "../../data/inventoryFactory";
import { calculateCapacityUsed } from "../inventory/calculateCapacityUsed";
import { mergeStackableItems } from "../inventory/mergeStackableItems";
import { calculateMissingSuppliesForPreset } from "./calculateMissingSuppliesForPreset";
import { findBestContainerForSupply } from "./findBestContainerForSupply";
import type { Character, GuildDepot, HuntSupplyPreset, InventoryItem } from "../../shared/types";

export function moveSuppliesFromDepot(
  character: Character,
  guildDepot: GuildDepot,
  preset: HuntSupplyPreset,
) {
  let inventory = character.inventory;
  let characterDepot = character.characterDepot;
  let guildItems = guildDepot.items;
  const movedItems: Array<{ itemId: string; itemName: string; quantity: number; from: string; to: string }> = [];
  const warnings: string[] = [];

  for (const missing of calculateMissingSuppliesForPreset({ ...character, inventory, characterDepot }, { ...guildDepot, items: guildItems }, preset)) {
    let remaining = missing.missingQuantity;
    const presetItem = preset.items.find((item) => item.itemId === missing.itemId);
    if (remaining <= 0) continue;

    [characterDepot, inventory, remaining] = moveFromSource(characterDepot, inventory, missing.itemId, remaining, "Character Depot", presetItem, movedItems);
    [guildItems, inventory, remaining] = moveFromSource(guildItems, inventory, missing.itemId, remaining, "Guild Depot", presetItem, movedItems);
  }

  const capacityUsed = calculateCapacityUsed(inventory);
  if (capacityUsed > character.capacityMax) {
    warnings.push("Preparacao falhou: capacity insuficiente.");
    return { character, guildDepot, movedItems: [], warnings };
  }

  return {
    character: {
      ...character,
      inventory: mergeStackableItems(inventory),
      characterDepot,
      capacityUsed,
    },
    guildDepot: {
      ...guildDepot,
      items: guildItems,
      capacityUsed: calculateCapacityUsed(guildItems),
    },
    movedItems,
    warnings,
  };
}

function moveFromSource(
  sourceItems: InventoryItem[],
  inventory: InventoryItem[],
  itemId: string,
  quantity: number,
  sourceName: string,
  presetItem: HuntSupplyPreset["items"][number] | undefined,
  movedItems: Array<{ itemId: string; itemName: string; quantity: number; from: string; to: string }>,
): [InventoryItem[], InventoryItem[], number] {
  let remaining = quantity;
  let targetInventory = inventory;
  const updatedSource = sourceItems.flatMap((sourceItem) => {
    if (remaining <= 0 || sourceItem.itemId !== itemId || sourceItem.locked || sourceItem.item.type === "quest") {
      return [sourceItem];
    }

    const movedQuantity = Math.min(sourceItem.quantity, remaining);
    remaining -= movedQuantity;
    const moved = createInventoryItem(sourceItem.itemId, movedQuantity, "character", sourceItem.ownerCharacterId);
    const container = findBestContainerForSupply(targetInventory, moved, presetItem?.targetContainerType);
    const movedWithContainer = container ? { ...moved, parentContainerId: container.id } : moved;
    targetInventory = mergeStackableItems([...targetInventory, movedWithContainer]);
    movedItems.push({
      itemId,
      itemName: sourceItem.item.name,
      quantity: movedQuantity,
      from: sourceName,
      to: container?.item.name ?? "Inventory",
    });

    const left = sourceItem.quantity - movedQuantity;
    return left > 0 ? [{ ...sourceItem, quantity: left }] : [];
  });

  return [updatedSource, targetInventory, remaining];
}
