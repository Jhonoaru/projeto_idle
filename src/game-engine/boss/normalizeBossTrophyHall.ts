import { bossTrophyRewards, getBossTrophyReward } from "../../data/bossTrophyRewards";
import type { BossTrophyClaim, BossTrophyHallState } from "../../shared/types";

export function createDefaultBossTrophyHallState(): BossTrophyHallState {
  return { claimedRewardIds: [], claimHistory: [] };
}

export function normalizeBossTrophyHall(value: unknown): BossTrophyHallState {
  if (!value || typeof value !== "object") return createDefaultBossTrophyHallState();
  const candidate = value as Partial<BossTrophyHallState>;
  const validIds = new Set(bossTrophyRewards.map((reward) => reward.id));
  const claimed = new Set(uniqueStrings(candidate.claimedRewardIds).filter((id) => validIds.has(id)));
  const historyByRewardId = new Map<string, BossTrophyClaim>();
  for (const entry of Array.isArray(candidate.claimHistory) ? candidate.claimHistory : []) {
    if (!entry || typeof entry !== "object") continue;
    const claim = entry as Partial<BossTrophyClaim>;
    const reward = typeof claim.rewardId === "string" ? getBossTrophyReward(claim.rewardId) : undefined;
    if (
      !reward || claim.bossId !== reward.bossId || claim.tier !== reward.tier
      || claim.collectionItemId !== reward.collectionItemId || !validDate(claim.claimedAt)
    ) continue;
    claimed.add(reward.id);
    historyByRewardId.set(reward.id, {
      rewardId: reward.id,
      bossId: reward.bossId,
      tier: reward.tier,
      collectionItemId: reward.collectionItemId,
      claimedAt: new Date(claim.claimedAt).toISOString(),
    });
  }
  return {
    claimedRewardIds: [...claimed],
    claimHistory: [...historyByRewardId.values()]
      .sort((left, right) => Date.parse(right.claimedAt) - Date.parse(left.claimedAt))
      .slice(0, 40),
  };
}

function uniqueStrings(value: unknown) {
  return Array.isArray(value)
    ? [...new Set(value.filter((entry): entry is string => typeof entry === "string").map((entry) => entry.trim()).filter(Boolean))]
    : [];
}

function validDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}
