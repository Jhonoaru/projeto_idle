import { DAILY_REWARD_GOLD_FALLBACK } from "../../data/dailyRewards";
import { createInventoryItem } from "../../data/inventoryFactory";
import { getItemById } from "../../data/items";
import { unlockCollectionItem } from "../collections/unlockCollectionItem";
import { calculateCapacityUsed } from "../inventory/calculateCapacityUsed";
import { mergeStackableItems } from "../inventory/mergeStackableItems";
import type { DailyRewardDefinition, Guild, GuildDepot } from "../../shared/types";

export interface AppliedDailyReward {
  guild: Guild;
  guildDepot: GuildDepot;
  receivedLabel: string;
  logs: string[];
}

export function applyDailyReward(
  guild: Guild,
  guildDepot: GuildDepot,
  reward: DailyRewardDefinition | undefined,
): AppliedDailyReward {
  if (!reward) return applyGoldFallback(guild, guildDepot, "Daily reward fallback");

  if (reward.rewardType === "gold") {
    const amount = normalizeAmount(reward.goldAmount, DAILY_REWARD_GOLD_FALLBACK);
    return {
      guild: { ...guild, gold: normalizeGuildGold(guild.gold) + amount },
      guildDepot,
      receivedLabel: `${amount.toLocaleString("en-US")} gold`,
      logs: [`Daily Reward claimed: ${amount.toLocaleString("en-US")} gold.`],
    };
  }

  if (reward.rewardType === "item" || reward.rewardType === "supply" || reward.rewardType === "material") {
    if (!reward.itemId) return applyGoldFallback(guild, guildDepot, reward.label);

    try {
      const item = getItemById(reward.itemId);
      const quantity = normalizeAmount(reward.quantity, 1);
      const dailyItem = createInventoryItem(item.id, quantity, "guildDepot");
      const items = mergeStackableItems([...guildDepot.items, dailyItem]);

      return {
        guild,
        guildDepot: {
          ...guildDepot,
          items,
          capacityUsed: calculateCapacityUsed(items),
        },
        receivedLabel: `${item.name} x${quantity}`,
        logs: [`Daily Reward claimed: ${item.name} x${quantity} sent to Guild Depot.`],
      };
    } catch {
      return applyGoldFallback(guild, guildDepot, reward.label);
    }
  }

  if (reward.rewardType === "collection") {
    if (!reward.collectionItemId) return applyGoldFallback(guild, guildDepot, reward.label);

    try {
      const unlocked = unlockCollectionItem(guild, reward.collectionItemId);
      if (!unlocked.unlocked) return applyGoldFallback(guild, guildDepot, reward.label);

      return {
        guild: unlocked.guild,
        guildDepot,
        receivedLabel: reward.label,
        logs: unlocked.logs,
      };
    } catch {
      return applyGoldFallback(guild, guildDepot, reward.label);
    }
  }

  return applyGoldFallback(guild, guildDepot, reward.label);
}

function applyGoldFallback(guild: Guild, guildDepot: GuildDepot, label: string): AppliedDailyReward {
  return {
    guild: { ...guild, gold: normalizeGuildGold(guild.gold) + DAILY_REWARD_GOLD_FALLBACK },
    guildDepot,
    receivedLabel: `${DAILY_REWARD_GOLD_FALLBACK.toLocaleString("en-US")} gold`,
    logs: [
      `Daily Reward claimed: ${label} converted to ${DAILY_REWARD_GOLD_FALLBACK.toLocaleString("en-US")} gold.`,
    ],
  };
}

function normalizeAmount(value: unknown, fallback: number) {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return fallback;

  return Math.floor(amount);
}

function normalizeGuildGold(value: unknown) {
  const gold = typeof value === "number" ? value : Number(value);

  return Number.isFinite(gold) && gold >= 0 ? gold : 0;
}
