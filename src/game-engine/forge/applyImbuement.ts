import { calculateCharacterAttributes } from "../character/calculateCharacterAttributes";
import { canApplyImbuement } from "./canApplyImbuement";
import { consumeForgeMaterials } from "./consumeForgeMaterials";
import { updateCharacterItem } from "./forgeInventoryHelpers";
import { getImbuementById } from "../../data/imbuements";
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
  const replaced = validation.willReplaceImbuementId
    ? getImbuementById(validation.willReplaceImbuementId)
    : undefined;
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
      imbuements: [
        ...(item.imbuements ?? []).filter((active) => {
          const activeDefinition = getImbuementById(active.imbuementId);
          return (
            activeDefinition &&
            (active.remainingHunts ?? 1) > 0 &&
            activeDefinition.familyId !== validation.imbuement?.familyId
          );
        }),
        activeImbuement,
      ],
    }),
  );
  const attributes = calculateCharacterAttributes(updatedCharacter);
  const materialLog = validation.imbuement.requiredMaterials
    .map((material) => `${material.itemId} x${material.quantity}`)
    .join(", ");

  return {
    character: { ...updatedCharacter, attributes, capacityMax: attributes.capacity },
    guild: { ...guild, gold: Math.max(0, guild.gold - validation.imbuement.goldCost) },
    guildDepot: consumed.guildDepot,
    logs: [
      `${validation.imbuement.name} applied to ${inventoryItem.item.name}.`,
      ...(replaced ? [`${replaced.name} was replaced without material recovery.`] : []),
      `Guild spent ${validation.imbuement.goldCost.toLocaleString("en-US")} gold.`,
      `Consumed ${materialLog}.`,
    ],
  };
}
