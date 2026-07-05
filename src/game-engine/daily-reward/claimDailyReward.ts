import { DAILY_REWARD_CYCLE_LENGTH } from "../../data/dailyRewards";
import type { DailyRewardClaim, Guild, GuildDepot } from "../../shared/types";
import { applyDailyReward } from "./applyDailyReward";
import { calculateDailyStreak } from "./calculateDailyStreak";
import { canClaimDailyReward } from "./canClaimDailyReward";
import { getCurrentDailyReward } from "./getCurrentDailyReward";
import { normalizeDailyRewardState } from "./normalizeDailyRewardState";

export function claimDailyReward(guild: Guild, guildDepot: GuildDepot, now = new Date()) {
  const dailyReward = normalizeDailyRewardState(guild.dailyReward, now);
  if (!canClaimDailyReward(dailyReward, now)) {
    return {
      success: false,
      guild: { ...guild, dailyReward },
      guildDepot,
      logs: ["Daily Reward already claimed today."],
    };
  }

  const reward = getCurrentDailyReward(dailyReward);
  const applied = applyDailyReward({ ...guild, dailyReward }, guildDepot, reward);
  const claimedAt = now.toISOString();
  const currentStreak = calculateDailyStreak(dailyReward.lastClaimedAt, dailyReward.currentStreak, now);
  const claim: DailyRewardClaim = {
    claimedAt,
    day: dailyReward.cycleDay,
    rewardType: reward?.rewardType ?? "gold",
    label: reward?.label ?? "Daily Reward",
  };
  const updatedDailyReward = normalizeDailyRewardState({
    lastClaimedAt: claimedAt,
    currentStreak,
    totalClaims: dailyReward.totalClaims + 1,
    cycleDay: dailyReward.cycleDay >= DAILY_REWARD_CYCLE_LENGTH ? 1 : dailyReward.cycleDay + 1,
    claimHistory: [...dailyReward.claimHistory, claim].slice(-20),
    claimedToday: true,
  }, now);

  return {
    success: true,
    guild: {
      ...applied.guild,
      dailyReward: updatedDailyReward,
    },
    guildDepot: applied.guildDepot,
    reward,
    receivedLabel: applied.receivedLabel,
    logs: [
      ...applied.logs,
      `Daily streak: ${currentStreak} day${currentStreak === 1 ? "" : "s"}.`,
    ],
  };
}
