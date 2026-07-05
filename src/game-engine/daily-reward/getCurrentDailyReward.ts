import { getDailyRewardByDay } from "../../data/dailyRewards";
import type { DailyRewardState } from "../../shared/types";
import { normalizeDailyRewardState } from "./normalizeDailyRewardState";

export function getCurrentDailyReward(state?: Partial<DailyRewardState> | null) {
  const dailyReward = normalizeDailyRewardState(state);

  return getDailyRewardByDay(dailyReward.cycleDay) ?? getDailyRewardByDay(1);
}
