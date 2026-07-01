import { calculateCharacterAttributes } from "../character/calculateCharacterAttributes";
import { canIncreaseItemTier } from "./canIncreaseItemTier";
import { consumeForgeMaterials } from "./consumeForgeMaterials";
import { updateCharacterItem } from "./forgeInventoryHelpers";
import type { Character, Guild, GuildDepot, InventoryItem } from "../../shared/types";

export function increaseItemTier(
  character: Character,
  guild: Guild,
  guildDepot: GuildDepot,
  inventoryItem: InventoryItem,
) {
  const validation = canIncreaseItemTier(character, guild, guildDepot, inventoryItem);
  if (!validation.canIncrease || !validation.cost) throw new Error(validation.reason);

  const consumed = consumeForgeMaterials(character, guildDepot, validation.cost.requiredMaterials);
  const nextTier = (inventoryItem.tier ?? 0) + 1;
  const updatedCharacter = updateCharacterItem(
    consumed.character,
    inventoryItem.id,
    (item) => ({ ...item, tier: nextTier }),
  );
  const attributes = calculateCharacterAttributes(updatedCharacter);

  return {
    character: { ...updatedCharacter, attributes, capacityMax: attributes.capacity },
    guild: { ...guild, gold: Math.max(0, guild.gold - validation.cost.goldCost) },
    guildDepot: consumed.guildDepot,
    logs: [
      `${inventoryItem.item.name} reached Tier ${nextTier}.`,
      `Guild spent ${validation.cost.goldCost.toLocaleString("en-US")} gold.`,
    ],
  };
}
