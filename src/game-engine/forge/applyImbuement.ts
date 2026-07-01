import { calculateCharacterAttributes } from "../character/calculateCharacterAttributes";
import { canApplyImbuement } from "./canApplyImbuement";
import { consumeForgeMaterials } from "./consumeForgeMaterials";
import { updateCharacterItem } from "./forgeInventoryHelpers";
import type { Character, EquipmentSlot, Guild, GuildDepot, InventoryItem } from "../../shared/types";

export function applyImbuement(
  character: Character,
  guild: Guild,
  guildDepot: GuildDepot,
  inventoryItem: InventoryItem,
  equipmentSlot: EquipmentSlot | undefined,
  imbuementId: string,
) {
  const validation = canApplyImbuement(character, guild, guildDepot, inventoryItem, equipmentSlot, imbuementId);
  if (!validation.canApply || !validation.imbuement) throw new Error(validation.reason);

  const consumed = consumeForgeMaterials(character, guildDepot, validation.imbuement.requiredMaterials);
  const activeImbuement = {
    imbuementId,
    appliedAt: new Date().toISOString(),
    remainingHunts: validation.imbuement.durationHunts ?? 20,
  };
  const updatedCharacter = updateCharacterItem(
    consumed.character,
    inventoryItem.id,
    (item) => ({
      ...item,
      imbuements: [...(item.imbuements ?? []), activeImbuement],
    }),
  );
  const attributes = calculateCharacterAttributes(updatedCharacter);

  return {
    character: { ...updatedCharacter, attributes, capacityMax: attributes.capacity },
    guild: { ...guild, gold: Math.max(0, guild.gold - validation.imbuement.goldCost) },
    guildDepot: consumed.guildDepot,
    logs: [
      `${validation.imbuement.name} applied to ${inventoryItem.item.name}.`,
      `Guild spent ${validation.imbuement.goldCost.toLocaleString("en-US")} gold.`,
    ],
  };
}
