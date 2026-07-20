export interface GuildLevelRewardDefinition {
  level: number;
  label: string;
  description: string;
  preview: string;
  goldAmount?: number;
  itemId?: string;
  quantity?: number;
  collectionItemId?: string;
  fallbackGold?: number;
}

export const guildLevelRewards: readonly GuildLevelRewardDefinition[] = [
  {
    level: 1,
    label: "Founding Cache",
    description: "Basic field medicine for the guild's first chartered routes.",
    preview: "Minor Health Potion x3",
    itemId: "minor-health-potion",
    quantity: 3,
  },
  {
    level: 2,
    label: "Recognized Purse",
    description: "A modest local grant awarded when the guild earns regional recognition.",
    preview: "200 gold",
    goldAmount: 200,
  },
  {
    level: 3,
    label: "Established Stores",
    description: "Common workshop ore reserved for a stable guild hall.",
    preview: "Iron Ore x4",
    itemId: "iron-ore",
    quantity: 4,
  },
  {
    level: 4,
    label: "Veteran Field Kit",
    description: "Reliable healing supplies for veteran campaign assignments.",
    preview: "Health Potion x5",
    itemId: "health-potion",
    quantity: 5,
  },
  {
    level: 5,
    label: "Renowned Reagent",
    description: "One rare crafting reagent granted for sustained regional service.",
    preview: "Enchanted Dust x1",
    itemId: "enchanted-dust",
    quantity: 1,
  },
  {
    level: 6,
    label: "Master Charter",
    description: "A permanent collection mark for a guild at the highest standing.",
    preview: "Golden Guild Sigil",
    collectionItemId: "avatar-golden-guild-sigil",
    fallbackGold: 1_000,
  },
];

export function getGuildLevelReward(level: number | undefined) {
  return guildLevelRewards.find((reward) => reward.level === level);
}
