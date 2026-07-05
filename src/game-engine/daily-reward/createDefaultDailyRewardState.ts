import type { DailyRewardState } from "../../shared/types";

export function createDefaultDailyRewardState(): DailyRewardState {
  return {
    lastClaimedAt: null,
    currentStreak: 0,
    totalClaims: 0,
    cycleDay: 1,
    claimHistory: [],
    claimedToday: false,
  };
}
