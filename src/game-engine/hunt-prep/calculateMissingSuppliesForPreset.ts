import { getItemById } from "../../data/items";
import type { Character, GuildDepot, HuntSupplyPreset } from "../../shared/types";

export function calculateMissingSuppliesForPreset(
  character: Character,
  guildDepot: GuildDepot,
  preset: HuntSupplyPreset,
) {
  const characterAvailable = countItems([...character.inventory]);
  const depotAvailable = countItems([...character.characterDepot, ...guildDepot.items]);

  return preset.items.map((presetItem) => {
    const item = getItemById(presetItem.itemId);
    const availableOnCharacter = characterAvailable.get(presetItem.itemId) ?? 0;
    const availableInDepot = depotAvailable.get(presetItem.itemId) ?? 0;
    const missingFromCharacter = Math.max(0, presetItem.quantity - availableOnCharacter);

    return {
      itemId: presetItem.itemId,
      itemName: item.name,
      requiredQuantity: presetItem.quantity,
      availableOnCharacter,
      availableInDepot,
      missingQuantity: missingFromCharacter,
      missingAfterDepot: Math.max(0, missingFromCharacter - availableInDepot),
    };
  });
}

function countItems(items: Array<{ itemId: string; quantity: number; locked?: boolean; item?: { type: string } }>) {
  const counts = new Map<string, number>();

  for (const item of items) {
    if (item.locked || item.item?.type === "quest") continue;
    counts.set(item.itemId, (counts.get(item.itemId) ?? 0) + item.quantity);
  }

  return counts;
}
