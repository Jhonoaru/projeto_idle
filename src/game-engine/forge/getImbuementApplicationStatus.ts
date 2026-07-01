import { getImbuementById } from "../../data/imbuements";
import { getForgeMaterialsAvailable } from "./getForgeMaterialsAvailable";
import { isForgeEligibleItem } from "./forgeInventoryHelpers";
import type {
  Character,
  EquipmentSlot,
  ForgeMaterialRequirement,
  Guild,
  GuildDepot,
  ImbuementDefinition,
  InventoryItem,
} from "../../shared/types";

export type ImbuementApplicationStatus =
  | "Available"
  | "Missing Materials"
  | "Not Enough Gold"
  | "Wrong Slot"
  | "Requires Higher Level"
  | "Requires Higher Tier"
  | "Already Active"
  | "Locked";

export interface ImbuementMaterialStatus extends ForgeMaterialRequirement {
  available: number;
  missing: number;
}

export interface ImbuementApplicationCheck {
  status: ImbuementApplicationStatus;
  canApply: boolean;
  reason: string;
  imbuement?: ImbuementDefinition;
  slot?: EquipmentSlot;
  materials: ImbuementMaterialStatus[];
  willReplaceImbuementId?: string;
}

const imbuementSlotLimits: Record<EquipmentSlot, number> = {
  weapon: 2,
  armor: 1,
  helmet: 1,
  legs: 1,
  boots: 1,
  backpack: 1,
  offhand: 1,
  ring: 1,
  amulet: 1,
};

export function getImbuementApplicationStatus(
  character: Character,
  guild: Guild,
  guildDepot: GuildDepot,
  inventoryItem: InventoryItem,
  equipmentSlot: EquipmentSlot | undefined,
  imbuementId: string,
): ImbuementApplicationCheck {
  const imbuement = getImbuementById(imbuementId);
  const slot = equipmentSlot ?? inventoryItem.item.equipmentSlot;
  const materials = imbuement ? getMaterialStatus(character, guildDepot, imbuement.requiredMaterials) : [];

  if (!imbuement) {
    return { status: "Locked", canApply: false, reason: "Imbuement nao encontrado.", materials };
  }

  if (!isForgeEligibleItem(inventoryItem)) {
    return { status: "Locked", canApply: false, reason: "Item nao aceita imbuement.", imbuement, slot, materials };
  }

  if (!slot || !imbuement.allowedEquipmentSlots.includes(slot)) {
    return { status: "Wrong Slot", canApply: false, reason: "Slot incompativel.", imbuement, slot, materials };
  }

  const activeImbuements = inventoryItem.imbuements ?? [];
  const validActiveImbuements = activeImbuements.filter(
    (active) => getImbuementById(active.imbuementId) && (active.remainingHunts ?? 1) > 0,
  );
  const sameFamily = validActiveImbuements.find((active) => getImbuementById(active.imbuementId)?.familyId === imbuement.familyId);

  if (sameFamily?.imbuementId === imbuement.id) {
    return { status: "Already Active", canApply: false, reason: "Este imbuement ja esta ativo.", imbuement, slot, materials };
  }

  const limit = imbuementSlotLimits[slot] ?? 1;
  const effectiveCount = sameFamily ? validActiveImbuements.length - 1 : validActiveImbuements.length;
  if (effectiveCount >= limit) {
    return { status: "Locked", canApply: false, reason: `Limite de ${limit} imbuement(s) atingido para este slot.`, imbuement, slot, materials };
  }

  const needsLevelOrTier =
    imbuement.requiredCharacterLevel &&
    imbuement.requiredForgeTier &&
    character.level < imbuement.requiredCharacterLevel &&
    (inventoryItem.tier ?? 0) < imbuement.requiredForgeTier;
  if (needsLevelOrTier) {
    const requiredForgeTier = imbuement.requiredForgeTier ?? 0;
    const status =
      (inventoryItem.tier ?? 0) < requiredForgeTier
        ? "Requires Higher Tier"
        : "Requires Higher Level";
    return {
      status,
      canApply: false,
      reason: `Exige Tier ${imbuement.requiredForgeTier} ou level ${imbuement.requiredCharacterLevel}.`,
      imbuement,
      slot,
      materials,
      willReplaceImbuementId: sameFamily?.imbuementId,
    };
  }

  if (guild.gold < imbuement.goldCost) {
    return { status: "Not Enough Gold", canApply: false, reason: "Gold insuficiente.", imbuement, slot, materials, willReplaceImbuementId: sameFamily?.imbuementId };
  }

  if (materials.some((material) => material.available < material.quantity)) {
    return { status: "Missing Materials", canApply: false, reason: "Materiais insuficientes.", imbuement, slot, materials, willReplaceImbuementId: sameFamily?.imbuementId };
  }

  return {
    status: "Available",
    canApply: true,
    reason: sameFamily ? "Vai substituir o imbuement ativo da mesma familia." : "Disponivel.",
    imbuement,
    slot,
    materials,
    willReplaceImbuementId: sameFamily?.imbuementId,
  };
}

function getMaterialStatus(
  character: Character,
  guildDepot: GuildDepot,
  requirements: ForgeMaterialRequirement[],
) {
  const available = getForgeMaterialsAvailable(character, guildDepot);
  return requirements.map((requirement) => {
    const owned = available.get(requirement.itemId) ?? 0;
    return {
      ...requirement,
      available: owned,
      missing: Math.max(0, requirement.quantity - owned),
    };
  });
}
