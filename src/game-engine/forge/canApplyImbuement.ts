import { getImbuementById } from "../../data/imbuements";
import { hasForgeMaterials } from "./consumeForgeMaterials";
import { isForgeEligibleItem } from "./forgeInventoryHelpers";
import type { Character, EquipmentSlot, Guild, GuildDepot, InventoryItem } from "../../shared/types";

export function canApplyImbuement(
  character: Character,
  guild: Guild,
  guildDepot: GuildDepot,
  inventoryItem: InventoryItem,
  equipmentSlot: EquipmentSlot | undefined,
  imbuementId: string,
) {
  const imbuement = getImbuementById(imbuementId);
  if (!imbuement) return { canApply: false, reason: "Imbuement nao encontrado." };
  if (!isForgeEligibleItem(inventoryItem)) return { canApply: false, reason: "Item nao aceita imbuement." };

  const slot = equipmentSlot ?? inventoryItem.item.equipmentSlot;
  if (!slot || !imbuement.allowedEquipmentSlots.includes(slot)) {
    return { canApply: false, reason: "Este item nao aceita este imbuement." };
  }

  if ((inventoryItem.imbuements ?? []).some((active) => getImbuementById(active.imbuementId)?.type === imbuement.type)) {
    return { canApply: false, reason: "Item ja possui imbuement deste tipo." };
  }

  if ((inventoryItem.imbuements ?? []).length >= 2) {
    return { canApply: false, reason: "Limite de imbuements atingido." };
  }

  if (guild.gold < imbuement.goldCost) return { canApply: false, reason: "Gold insuficiente." };

  const materials = hasForgeMaterials(character, guildDepot, imbuement.requiredMaterials);
  if (!materials.hasMaterials) {
    const missing = materials.missing[0];
    return { canApply: false, reason: `Material insuficiente: ${missing.itemId} x${missing.quantity - missing.available}.` };
  }

  return { canApply: true, imbuement, slot };
}
