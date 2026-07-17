import type { InventoryItem, Item } from "../../shared/types";

export interface ItemIconMeta {
  symbol: string;
  tone: string;
  label: string;
}

export function getItemIconMeta(item?: Item): ItemIconMeta {
  if (!item) return { symbol: "?", tone: "unknown", label: "Unknown item" };
  if (item.isContainer) return { symbol: getContainerSymbol(item.containerType), tone: "container", label: "Container" };
  if (item.type === "gold") return { symbol: "GC", tone: "gold", label: "Gold" };
  if (item.type === "quest") return { symbol: "Q", tone: "quest", label: "Quest" };
  if (item.type === "material") return getMaterialMeta(item);
  if (item.type === "creature_product") return getCreatureProductMeta(item);
  if (item.type === "consumable") return getConsumableMeta(item);
  if (item.type === "equipment") return getEquipmentMeta(item);

  return { symbol: "?", tone: "misc", label: "Misc" };
}

export function getInventoryItemBadges(inventoryItem?: InventoryItem, equipped = false) {
  if (!inventoryItem) return [];

  return [
    inventoryItem.locked ? "L" : undefined,
    equipped ? "E" : undefined,
    inventoryItem.item.type === "quest" ? "Q" : undefined,
    inventoryItem.imbuements?.length ? "IM" : undefined,
    inventoryItem.upgradeLevel ? `+${inventoryItem.upgradeLevel}` : undefined,
    inventoryItem.item.isContainer ? "B" : undefined,
  ].filter((badge): badge is string => Boolean(badge));
}

function getEquipmentMeta(item: Item): ItemIconMeta {
  if (item.equipmentSlot === "helmet") return { symbol: "HM", tone: "armor", label: "Helmet" };
  if (item.equipmentSlot === "armor" || item.equipmentSlot === "legs" || item.equipmentSlot === "boots") {
    return { symbol: "AR", tone: "armor", label: "Armor" };
  }
  if (item.equipmentSlot === "offhand" && item.offhandType === "shield") return { symbol: "SH", tone: "shield", label: "Shield" };
  if (item.equipmentSlot === "offhand" && item.offhandType === "quiver") return { symbol: "QV", tone: "weapon", label: "Quiver" };
  if (item.weaponProficiencyType === "bow") return { symbol: "BW", tone: "weapon", label: "Bow" };
  if (item.weaponProficiencyType === "wand" || item.weaponProficiencyType === "staff") return { symbol: "WD", tone: "magic", label: "Magic weapon" };
  if (item.weaponProficiencyType === "axe") return { symbol: "AX", tone: "weapon", label: "Axe" };
  if (item.weaponProficiencyType === "club") return { symbol: "CB", tone: "weapon", label: "Club" };
  if (item.weaponProficiencyType === "fist") return { symbol: "FT", tone: "weapon", label: "Fist weapon" };
  if (item.equipmentSlot === "ring") return { symbol: "RG", tone: "jewel", label: "Ring" };
  if (item.equipmentSlot === "amulet") return { symbol: "AM", tone: "jewel", label: "Amulet" };

  return { symbol: "SW", tone: "weapon", label: "Weapon" };
}

function getConsumableMeta(item: Item): ItemIconMeta {
  const name = item.name.toLowerCase();
  if (name.includes("health")) return { symbol: "HP", tone: "potion", label: "Health potion" };
  if (name.includes("mana")) return { symbol: "MP", tone: "potion", label: "Mana potion" };
  if (name.includes("rune")) return { symbol: "RU", tone: "rune", label: "Rune" };
  if (name.includes("arrow")) return { symbol: "AR", tone: "ammo", label: "Ammo" };

  return { symbol: "SU", tone: "supply", label: "Supply" };
}

function getMaterialMeta(item: Item): ItemIconMeta {
  const name = item.name.toLowerCase();
  if (name.includes("ore")) return { symbol: "OR", tone: "material", label: "Ore" };
  if (name.includes("cloth")) return { symbol: "CL", tone: "material", label: "Cloth" };
  if (name.includes("fang")) return { symbol: "FG", tone: "material", label: "Fang" };
  if (name.includes("dust")) return { symbol: "DU", tone: "material", label: "Dust" };

  return { symbol: "MT", tone: "material", label: "Material" };
}

function getCreatureProductMeta(item: Item): ItemIconMeta {
  const name = item.name.toLowerCase();
  if (name.includes("tooth") || name.includes("fang")) return { symbol: "TH", tone: "loot", label: "Tooth" };
  if (name.includes("bone")) return { symbol: "BN", tone: "loot", label: "Bone" };
  if (name.includes("claw")) return { symbol: "CL", tone: "loot", label: "Claw" };
  if (name.includes("tail")) return { symbol: "TL", tone: "loot", label: "Tail" };
  if (name.includes("silk") || name.includes("leather")) return { symbol: "LT", tone: "loot", label: "Hide" };

  return { symbol: "LT", tone: "loot", label: "Loot" };
}

function getContainerSymbol(containerType: Item["containerType"]) {
  if (containerType === "loot_bag") return "LB";
  if (containerType === "supply_bag") return "SB";
  if (containerType === "rune_pouch") return "RP";
  if (containerType === "quiver") return "QV";

  return "BP";
}
