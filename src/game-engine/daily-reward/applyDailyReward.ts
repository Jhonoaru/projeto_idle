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
  guildDepot: GuildDepot | null | undefined,
  reward: DailyRewardDefinition | undefined,
): AppliedDailyReward {
  const safeGuildDepot = normalizeGuildDepot(guildDepot);

  if (!reward) return applyGoldFallback(guild, safeGuildDepot, "Daily reward fallback");

  if (reward.rewardType === "gold") {
    const amount = normalizeAmount(reward.goldAmount, DAILY_REWARD_GOLD_FALLBACK);
    return {
      guild: { ...guild, gold: normalizeGuildGold(guild.gold) + amount },
      guildDepot: safeGuildDepot,
      receivedLabel: `${amount.toLocaleString("en-US")} gold`,
      logs: [`Daily Reward claimed: ${amount.toLocaleString("en-US")} gold.`],
    };
  }

  if (reward.rewardType === "item" || reward.rewardType === "supply" || reward.rewardType === "material") {
    if (!reward.itemId) return applyGoldFallback(guild, safeGuildDepot, reward.label);

    try {
      const item = getItemById(reward.itemId);
      const quantity = normalizeAmount(reward.quantity, 1);
      const dailyItem = createInventoryItem(item.id, quantity, "guildDepot");
      const items = mergeStackableItems([...safeGuildDepot.items, dailyItem]);

      return {
        guild,
        guildDepot: {
          ...safeGuildDepot,
          items,
          capacityUsed: calculateCapacityUsed(items),
        },
        receivedLabel: `${item.name} x${quantity}`,
        logs: [`Daily Reward claimed: ${item.name} x${quantity} sent to Guild Depot.`],
      };
    } catch {
      return applyGoldFallback(guild, safeGuildDepot, reward.label);
    }
  }

  if (reward.rewardType === "collection") {
    if (!reward.collectionItemId) return applyGoldFallback(guild, safeGuildDepot, reward.label);

    try {
      const unlocked = unlockCollectionItem(guild, reward.collectionItemId);
      if (!unlocked.unlocked) return applyGoldFallback(guild, safeGuildDepot, reward.label);

      return {
        guild: unlocked.guild,
        guildDepot: safeGuildDepot,
        receivedLabel: reward.label,
        logs: unlocked.logs,
      };
    } catch {
      return applyGoldFallback(guild, safeGuildDepot, reward.label);
    }
  }

  return applyGoldFallback(guild, safeGuildDepot, reward.label);
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

function normalizeGuildDepot(guildDepot: GuildDepot | null | undefined): GuildDepot {
  return {
    goldStored: guildDepot?.goldStored ?? 0,
    items: Array.isArray(guildDepot?.items) ? guildDepot.items : [],
    capacityUsed: guildDepot?.capacityUsed,
  };
}
