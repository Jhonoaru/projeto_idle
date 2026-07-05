import type { DailyRewardDefinition } from "../shared/types";

export const DAILY_REWARD_CYCLE_LENGTH = 7;
export const DAILY_REWARD_GOLD_FALLBACK = 350;

export const dailyRewards: DailyRewardDefinition[] = [
  {
    day: 1,
    rewardType: "gold",
    label: "Guild Hall Stipend",
    description: "A modest pouch of gold for routine guild expenses.",
    goldAmount: 250,
    previewValue: "250g",
  },
  {
    day: 2,
    rewardType: "supply",
    label: "Health Supply Crate",
    description: "Five Health Potions delivered to the Guild Depot.",
    itemId: "health-potion",
    quantity: 5,
    previewValue: "HP x5",
  },
  {
    day: 3,
    rewardType: "material",
    label: "Iron Ore Bundle",
    description: "Three Iron Ore for early forge work.",
    itemId: "iron-ore",
    quantity: 3,
    previewValue: "Ore x3",
  },
  {
    day: 4,
    rewardType: "supply",
    label: "Mana Supply Crate",
    description: "Five Mana Potions delivered to the Guild Depot.",
    itemId: "mana-potion",
    quantity: 5,
    previewValue: "MP x5",
  },
  {
    day: 5,
    rewardType: "gold",
    label: "Contract Dividend",
    description: "A slightly larger payout from local guild contracts.",
    goldAmount: 500,
    previewValue: "500g",
  },
  {
    day: 6,
    rewardType: "material",
    label: "Cloth Repair Kit",
    description: "Eight Old Cloth for basic crafting and imbuement prep.",
    itemId: "old-cloth",
    quantity: 8,
    previewValue: "Cloth x8",
  },
  {
    day: 7,
    rewardType: "collection",
    label: "Beast Hunter Sigil",
    description: "A cosmetic avatar sigil for the guild collection.",
    collectionItemId: "avatar-beast-hunter-sigil",
    previewValue: "BH",
  },
];

export function getDailyRewardByDay(day: number) {
  return dailyRewards.find((reward) => reward.day === day);
}
