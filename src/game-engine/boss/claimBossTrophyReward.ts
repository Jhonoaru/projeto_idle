import { bosses } from "../../data/bosses";
import { getBossTrophyReward, getBossTrophyRewards } from "../../data/bossTrophyRewards";
import type { Guild } from "../../shared/types";
import { unlockCollectionItem } from "../collections/unlockCollectionItem";
import { normalizeGuildOperationOutcomes } from "../operations/normalizeGuildOperationOutcomes";
import { buildBossRaidCodex } from "./buildBossRaidCodex";
import { isBossTrophyTierEligible } from "./buildBossTrophyHall";
import { normalizeBossTrophyHall } from "./normalizeBossTrophyHall";

export function claimBossTrophyReward(guild: Guild, rewardId: string, now = new Date()) {
  const reward = getBossTrophyReward(rewardId);
  const boss = reward ? bosses.find((entry) => entry.id === reward.bossId) : undefined;
  const claimedAt = Number.isFinite(now.getTime()) ? now.toISOString() : new Date().toISOString();
  if (!reward || !boss) return result(false, guild, "Trophy reward not found.");
  const outcomes = normalizeGuildOperationOutcomes(guild.operationOutcomes);
  const hall = normalizeBossTrophyHall(outcomes.bossTrophyHall);
  if (hall.claimedRewardIds.includes(reward.id)) return result(false, { ...guild, operationOutcomes: outcomes }, "This trophy reward was already claimed.");
  const codexEntry = buildBossRaidCodex({ ...guild, operationOutcomes: outcomes }, [boss]).entries[0];
  if (!codexEntry || !isBossTrophyTierEligible(codexEntry.status, reward.tier)) {
    return result(false, { ...guild, operationOutcomes: outcomes }, `Reach ${reward.tier} status with ${boss.name} first.`);
  }
  const rewards = getBossTrophyRewards(boss.id);
  const rewardIndex = rewards.findIndex((entry) => entry.id === reward.id);
  const previous = rewardIndex > 0 ? rewards[rewardIndex - 1] : undefined;
  if (previous && !hall.claimedRewardIds.includes(previous.id)) {
    return result(false, { ...guild, operationOutcomes: outcomes }, `Claim ${previous.label} first.`);
  }
  const updatedHall = normalizeBossTrophyHall({
    claimedRewardIds: [...hall.claimedRewardIds, reward.id],
    claimHistory: [{
      rewardId: reward.id,
      bossId: reward.bossId,
      tier: reward.tier,
      collectionItemId: reward.collectionItemId,
      claimedAt,
    }, ...hall.claimHistory],
  });
  const archivedGuild: Guild = {
    ...guild,
    operationOutcomes: normalizeGuildOperationOutcomes({ ...outcomes, bossTrophyHall: updatedHall }),
  };
  const unlock = unlockCollectionItem(archivedGuild, reward.collectionItemId);
  return {
    success: true,
    guild: unlock.guild,
    message: `${reward.label} archived in the Boss Trophy Hall.`,
    claimed: true,
    unlockedCollectionItemId: unlock.unlocked ? reward.collectionItemId : undefined,
    logs: [`Boss trophy claimed: ${reward.label}.`, ...unlock.logs],
  };
}

function result(success: boolean, guild: Guild, message: string) {
  return { success, guild, message, claimed: false, unlockedCollectionItemId: undefined, logs: [] as string[] };
}
