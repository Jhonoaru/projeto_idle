import { equipmentFamilies, equipmentProgressionBands } from "../../data/equipmentProgression";
import type { EquipmentFamilyId, EquipmentProgressionBandId, Item } from "../../shared/types";

export function getEquipmentProgression(item?: Item) {
  const familyId = normalizeEquipmentFamily(item?.equipmentFamily) ?? deriveEquipmentFamily(item);
  const bandId = normalizeProgressionBand(item?.progressionBand) ?? deriveProgressionBand(item?.levelRequirement);

  return {
    familyId,
    family: equipmentFamilies[familyId],
    bandId,
    band: equipmentProgressionBands[bandId],
    requiredLevel: normalizeRequiredLevel(item?.levelRequirement),
    className: `equipment-family-${familyId} equipment-band-${bandId}`,
  };
}

export function deriveProgressionBand(levelRequirement: unknown): EquipmentProgressionBandId {
  const level = normalizeRequiredLevel(levelRequirement);
  if (level >= 60) return "mythic";
  if (level >= 45) return "elite";
  if (level >= 25) return "veteran";
  if (level >= 10) return "adventurer";
  return "novice";
}

function deriveEquipmentFamily(item?: Item): EquipmentFamilyId {
  if (!item || item.type !== "equipment") return "field-kit";
  if (item.weaponProficiencyType === "bow" || item.offhandType === "quiver" || item.distancePower) return "pathfinder";
  if (item.weaponProficiencyType === "wand" || item.magicPower) return "arcanum";
  if (item.weaponProficiencyType === "fist" || item.fistPower) return "discipline";
  if (["sword", "axe", "club", "shield"].includes(item.weaponProficiencyType ?? "") || item.offhandType === "shield") return "vanguard";
  return "field-kit";
}

function normalizeEquipmentFamily(value: unknown): EquipmentFamilyId | undefined {
  return typeof value === "string" && value in equipmentFamilies ? value as EquipmentFamilyId : undefined;
}

function normalizeProgressionBand(value: unknown): EquipmentProgressionBandId | undefined {
  return typeof value === "string" && value in equipmentProgressionBands ? value as EquipmentProgressionBandId : undefined;
}

function normalizeRequiredLevel(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 1 ? Math.floor(parsed) : 1;
}
