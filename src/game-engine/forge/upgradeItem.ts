import { calculateCharacterAttributes } from "../character/calculateCharacterAttributes";
import { canUpgradeItem } from "./canUpgradeItem";
import { consumeForgeMaterials } from "./consumeForgeMaterials";
import { updateCharacterItem } from "./forgeInventoryHelpers";
import type { Character, Guild, GuildDepot, InventoryItem } from "../../shared/types";

export function upgradeItem(
  character: Character,
  guild: Guild,
  guildDepot: GuildDepot,
  inventoryItem: InventoryItem,
) {
  const validation = canUpgradeItem(character, guild, guildDepot, inventoryItem);
  if (!validation.canUpgrade || !validation.cost) throw new Error(validation.reason);

  const consumed = consumeForgeMaterials(character, guildDepot, validation.cost.requiredMaterials);
  const nextLevel = (inventoryItem.upgradeLevel ?? 0) + 1;
  const updatedCharacter = updateCharacterItem(
    consumed.character,
    inventoryItem.id,
    (item) => ({ ...item, upgradeLevel: nextLevel }),
  );
  const attributes = calculateCharacterAttributes(updatedCharacter);

  return {
    character: { ...updatedCharacter, attributes, capacityMax: attributes.capacity },
    guild: { ...guild, gold: Math.max(0, guild.gold - validation.cost.goldCost) },
    guildDepot: consumed.guildDepot,
    logs: [
      `${character.name} upgraded ${inventoryItem.item.name} to +${nextLevel}.`,
      `Guild spent ${validation.cost.goldCost.toLocaleString("en-US")} gold.`,
    ],
  };
}
