import type {
  InventoryItem,
  WeaponProficiencyType,
} from "../../shared/types";

export function getEquippedWeaponProficiencyType(
  inventoryItem?: InventoryItem,
): WeaponProficiencyType | undefined {
  const item = inventoryItem?.item;
  if (!item) return undefined;
  if (item.weaponProficiencyType) return item.weaponProficiencyType;

  const name = item.name.toLowerCase();

  if (item.equipmentSlot === "offhand") {
    if (item.offhandType === "shield") return "shield";
    return undefined;
  }

  if (item.equipmentSlot !== "weapon") return undefined;
  if (item.fistPower || name.includes("wrap")) return "fist";
  if (item.distancePower || name.includes("bow")) return "bow";
  if (item.magicPower && name.includes("staff")) return "staff";
  if (item.magicPower || name.includes("wand")) return "wand";
  if (name.includes("axe")) return "axe";
  if (name.includes("club") || name.includes("mace") || name.includes("hammer")) return "club";
  if (name.includes("sword") || name.includes("blade")) return "sword";

  return undefined;
}
