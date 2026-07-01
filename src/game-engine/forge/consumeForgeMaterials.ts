import { calculateCapacityUsed } from "../inventory/calculateCapacityUsed";
import { getForgeMaterialsAvailable } from "./getForgeMaterialsAvailable";
import type { Character, ForgeMaterialRequirement, GuildDepot, InventoryItem } from "../../shared/types";

export function hasForgeMaterials(
  character: Character,
  guildDepot: GuildDepot,
  requirements: ForgeMaterialRequirement[],
) {
  const available = getForgeMaterialsAvailable(character, guildDepot);
  const missing = requirements
    .map((requirement) => ({
      ...requirement,
      available: available.get(requirement.itemId) ?? 0,
    }))
    .filter((requirement) => requirement.available < requirement.quantity);

  return {
    hasMaterials: missing.length === 0,
    missing,
  };
}

export function consumeForgeMaterials(
  character: Character,
  guildDepot: GuildDepot,
  requirements: ForgeMaterialRequirement[],
) {
  let inventory = character.inventory;
  let characterDepot = character.characterDepot;
  let guildDepotItems = guildDepot.items;

  for (const requirement of requirements) {
    let remaining = requirement.quantity;
    [inventory, remaining] = consumeFromItems(inventory, requirement.itemId, remaining);
    [characterDepot, remaining] = consumeFromItems(characterDepot, requirement.itemId, remaining);
    [guildDepotItems, remaining] = consumeFromItems(guildDepotItems, requirement.itemId, remaining);

    if (remaining > 0) {
      throw new Error(`Material insuficiente: ${requirement.itemId} x${remaining}.`);
    }
  }

  return {
    character: {
      ...character,
      inventory,
      characterDepot,
      capacityUsed: calculateCapacityUsed(inventory),
    },
    guildDepot: {
      ...guildDepot,
      items: guildDepotItems,
      capacityUsed: calculateCapacityUsed(guildDepotItems),
    },
  };
}

function consumeFromItems(
  items: InventoryItem[],
  itemId: string,
  quantity: number,
): [InventoryItem[], number] {
  let remaining = quantity;
  const updated = items.flatMap((item) => {
    if (remaining <= 0 || item.itemId !== itemId || item.locked || item.item.type === "quest") {
      return [item];
    }

    const consumed = Math.min(item.quantity, remaining);
    remaining -= consumed;
    const left = item.quantity - consumed;
    return left > 0 ? [{ ...item, quantity: left }] : [];
  });

  return [updated, remaining];
}
