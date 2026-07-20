import { getCollectionItemById } from "../../data/collections";
import { getGuildLevelReward } from "../../data/guildLevelRewards";
import { createInventoryItem } from "../../data/inventoryFactory";
import { getItemById } from "../../data/items";
import type { Guild, GuildDepot } from "../../shared/types";
import { unlockCollectionItem } from "../collections/unlockCollectionItem";
import { calculateCapacityUsed } from "../inventory/calculateCapacityUsed";
import { mergeStackableItems } from "../inventory/mergeStackableItems";
import { getGuildProgression } from "./getGuildProgression";
import { normalizeGuildProgressionRewardState } from "./normalizeGuildProgressionRewardState";

export function claimGuildLevelReward(guild: Guild, depot: GuildDepot | null | undefined, level: number, now = new Date()) {
  const safeDepot = normalizeDepot(depot);
  const state = normalizeGuildProgressionRewardState(guild.progressionRewards);
  const reward = getGuildLevelReward(level);
  const progression = getGuildProgression(guild);

  if (!reward) return blocked(guild, safeDepot, state, "Guild Level reward not found.");
  if (!Number.isFinite(now.getTime())) return blocked(guild, safeDepot, state, "Reward timestamp is invalid.");
  if (progression.level < reward.level) return blocked(guild, safeDepot, state, `Requires Guild Level ${reward.level}.`);
  if (state.claimedLevels.includes(reward.level)) return blocked(guild, safeDepot, state, `Guild Level ${reward.level} reward already claimed.`);

  let nextGuild: Guild = { ...guild, gold: normalizeGold(guild.gold), progressionRewards: state };
  let nextDepot = safeDepot;
  let receivedLabel = reward.preview;

  if (reward.goldAmount) {
    nextGuild = { ...nextGuild, gold: nextGuild.gold + normalizePositiveInteger(reward.goldAmount, 1) };
  } else if (reward.itemId) {
    try {
      const item = getItemById(reward.itemId);
      const quantity = normalizePositiveInteger(reward.quantity, 1);
      const items = mergeStackableItems([...safeDepot.items, createInventoryItem(item.id, quantity, "guildDepot")]);
      nextDepot = { ...safeDepot, items, capacityUsed: calculateCapacityUsed(items) };
      receivedLabel = `${item.name} x${quantity}`;
    } catch {
      const fallback = normalizePositiveInteger(reward.fallbackGold, 100);
      nextGuild = { ...nextGuild, gold: nextGuild.gold + fallback };
      receivedLabel = `${fallback.toLocaleString("en-US")} gold fallback`;
    }
  } else if (reward.collectionItemId) {
    try {
      const collectionItem = getCollectionItemById(reward.collectionItemId);
      if (!collectionItem) throw new Error("Collection reward not found.");
      const unlocked = unlockCollectionItem(nextGuild, collectionItem.id);
      if (unlocked.unlocked) {
        nextGuild = unlocked.guild;
        receivedLabel = collectionItem.name;
      } else {
        const fallback = normalizePositiveInteger(reward.fallbackGold, 100);
        nextGuild = { ...unlocked.guild, gold: normalizeGold(unlocked.guild.gold) + fallback };
        receivedLabel = `${fallback.toLocaleString("en-US")} gold fallback`;
      }
    } catch {
      const fallback = normalizePositiveInteger(reward.fallbackGold, 100);
      nextGuild = { ...nextGuild, gold: nextGuild.gold + fallback };
      receivedLabel = `${fallback.toLocaleString("en-US")} gold fallback`;
    }
  }

  const claimedAt = now.toISOString();
  const progressionRewards = normalizeGuildProgressionRewardState({
    claimedLevels: [...state.claimedLevels, reward.level],
    claimHistory: [...state.claimHistory, { level: reward.level, label: reward.label, claimedAt }],
  });
  nextGuild = { ...nextGuild, progressionRewards };

  return {
    success: true,
    guild: nextGuild,
    depot: nextDepot,
    reward,
    receivedLabel,
    message: `Guild Level ${reward.level} reward claimed: ${receivedLabel}.`,
  };
}

function blocked(guild: Guild, depot: GuildDepot, state: ReturnType<typeof normalizeGuildProgressionRewardState>, message: string) {
  return { success: false, guild: { ...guild, progressionRewards: state }, depot, reward: undefined, receivedLabel: undefined, message };
}

function normalizeDepot(depot: GuildDepot | null | undefined): GuildDepot {
  const items = Array.isArray(depot?.items) ? depot.items : [];
  return {
    goldStored: Number.isFinite(depot?.goldStored) && (depot?.goldStored ?? 0) >= 0 ? depot!.goldStored : 0,
    items,
    capacityUsed: calculateCapacityUsed(items),
  };
}

function normalizeGold(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
}

function normalizePositiveInteger(value: unknown, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}
