import { bossTrophyRewards, getBossTrophyRewards } from "../../data/bossTrophyRewards";
import { getCollectionItemById } from "../../data/collections";
import type { Boss, BossTrophyRewardTier, Guild } from "../../shared/types";
import { buildBossRaidCodex, type BossRaidCodexStatus } from "./buildBossRaidCodex";
import { normalizeBossTrophyHall } from "./normalizeBossTrophyHall";

const tierOrder: BossTrophyRewardTier[] = ["conquered", "mastered", "flawless"];

export function buildBossTrophyHall(guild: Guild, definitions: Boss[]) {
  const codex = buildBossRaidCodex(guild, definitions);
  const state = normalizeBossTrophyHall(guild.operationOutcomes?.bossTrophyHall);
  const claimed = new Set(state.claimedRewardIds);
  const wings = codex.entries.map((entry) => {
    const rewards = getBossTrophyRewards(entry.boss.id).map((definition, index) => {
      const prerequisiteId = index > 0 ? getBossTrophyRewards(entry.boss.id)[index - 1]?.id : undefined;
      const eligible = statusRank(entry.status) >= tierRank(definition.tier);
      const prerequisiteMet = !prerequisiteId || claimed.has(prerequisiteId);
      return {
        definition,
        collectionItem: getCollectionItemById(definition.collectionItemId),
        claimed: claimed.has(definition.id),
        available: eligible && prerequisiteMet && !claimed.has(definition.id),
        eligible,
        prerequisiteMet,
      };
    });
    return {
      boss: entry.boss,
      status: entry.status,
      rewards,
      claimedCount: rewards.filter((reward) => reward.claimed).length,
      availableCount: rewards.filter((reward) => reward.available).length,
    };
  });
  return {
    wings,
    state,
    totalRewards: bossTrophyRewards.length,
    claimedCount: state.claimedRewardIds.length,
    availableCount: wings.reduce((sum, wing) => sum + wing.availableCount, 0),
  };
}

export function getBossTrophyTierLabel(tier: BossTrophyRewardTier) {
  return tier === "flawless" ? "Flawless" : tier === "mastered" ? "Mastered" : "Conquered";
}

export function isBossTrophyTierEligible(status: BossRaidCodexStatus, tier: BossTrophyRewardTier) {
  return statusRank(status) >= tierRank(tier);
}

function statusRank(status: BossRaidCodexStatus) {
  if (status === "flawless") return 3;
  if (status === "mastered") return 2;
  if (status === "conquered") return 1;
  return 0;
}

function tierRank(tier: BossTrophyRewardTier) {
  return tierOrder.indexOf(tier) + 1;
}
