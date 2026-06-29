import type { ShopCategory } from "../shared/types";

export interface ShopItem {
  itemId: string;
  category: ShopCategory;
  buyPrice: number;
  defaultQuantity: number;
}

export const shopItems: ShopItem[] = [
  { itemId: "minor-health-potion", category: "potions", buyPrice: 30, defaultQuantity: 10 },
  { itemId: "health-potion", category: "potions", buyPrice: 75, defaultQuantity: 10 },
  { itemId: "strong-health-potion", category: "potions", buyPrice: 145, defaultQuantity: 10 },
  { itemId: "mana-potion", category: "potions", buyPrice: 70, defaultQuantity: 10 },
  { itemId: "strong-mana-potion", category: "potions", buyPrice: 135, defaultQuantity: 10 },
  { itemId: "light-magic-rune", category: "runes", buyPrice: 58, defaultQuantity: 10 },
  { itemId: "fire-burst-rune", category: "runes", buyPrice: 155, defaultQuantity: 10 },
  { itemId: "healing-rune", category: "runes", buyPrice: 135, defaultQuantity: 10 },
  { itemId: "energy-strike-rune", category: "runes", buyPrice: 150, defaultQuantity: 10 },
  { itemId: "simple-arrow", category: "ammo", buyPrice: 4, defaultQuantity: 100 },
  { itemId: "piercing-arrow", category: "ammo", buyPrice: 11, defaultQuantity: 100 },
  { itemId: "light-quiver", category: "ammo", buyPrice: 180, defaultQuantity: 1 },
  { itemId: "adventurer-backpack", category: "containers", buyPrice: 240, defaultQuantity: 1 },
  { itemId: "small-backpack", category: "containers", buyPrice: 125, defaultQuantity: 1 },
  { itemId: "loot-bag", category: "containers", buyPrice: 215, defaultQuantity: 1 },
  { itemId: "supply-bag", category: "containers", buyPrice: 235, defaultQuantity: 1 },
  { itemId: "rune-pouch", category: "containers", buyPrice: 320, defaultQuantity: 1 },
  { itemId: "rope", category: "utilities", buyPrice: 65, defaultQuantity: 1 },
  { itemId: "shovel", category: "utilities", buyPrice: 85, defaultQuantity: 1 },
  { itemId: "torch", category: "utilities", buyPrice: 18, defaultQuantity: 5 },
  { itemId: "travel-scroll", category: "utilities", buyPrice: 325, defaultQuantity: 1 },
];
