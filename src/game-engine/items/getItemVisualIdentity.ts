import type { InventoryItem, Item, ItemRarity } from "../../shared/types";

export type ItemVisualTier = 0 | 1 | 2 | 3;

const rarityLabels: Record<ItemRarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

const tierLabels: Record<ItemVisualTier, string> = {
  0: "Base",
  1: "Forged I",
  2: "Ascendant II",
  3: "Exalted III",
};

export function getItemVisualIdentity(item?: Item, inventoryItem?: InventoryItem) {
  const rarity = normalizeItemRarity(item?.rarity);
  const tier = normalizeItemTier(inventoryItem?.tier);
  const upgradeLevel = normalizeItemUpgradeLevel(inventoryItem?.upgradeLevel);
  const rarityLabel = rarityLabels[rarity];
  const tierLabel = tierLabels[tier];

  return {
    rarity,
    rarityLabel,
    tier,
    tierLabel,
    upgradeLevel,
    upgradeLabel: upgradeLevel > 0 ? `+${upgradeLevel}` : "Base",
    combinedLabel: `${rarityLabel} / ${tierLabel}`,
    className: `item-rarity-${rarity} item-tier-${tier}`,
    surfaceClassName: `rarity-${rarity} item-tier-${tier}`,
  };
}

export function normalizeItemTier(value: unknown): ItemVisualTier {
  return clampInteger(value, 0, 3) as ItemVisualTier;
}

export function normalizeItemUpgradeLevel(value: unknown) {
  return clampInteger(value, 0, 5);
}

export function normalizeItemRarity(value: unknown): ItemRarity {
  return typeof value === "string" && value in rarityLabels ? value as ItemRarity : "common";
}

export function formatEnhancedItemName(inventoryItem: InventoryItem) {
  const identity = getItemVisualIdentity(inventoryItem.item, inventoryItem);
  const upgrade = identity.upgradeLevel > 0 ? ` +${identity.upgradeLevel}` : "";
  const tier = identity.tier > 0 ? ` [T${identity.tier}]` : "";
  return `${inventoryItem.item.name}${upgrade}${tier}`;
}

function clampInteger(value: unknown, minimum: number, maximum: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return minimum;
  return Math.min(maximum, Math.max(minimum, Math.floor(parsed)));
}
