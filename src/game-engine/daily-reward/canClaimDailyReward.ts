import type { DailyRewardState } from "../../shared/types";
import { normalizeDailyRewardState } from "./normalizeDailyRewardState";

export function canClaimDailyReward(state?: Partial<DailyRewardState> | null, now = new Date()) {
  return !normalizeDailyRewardState(state, now).claimedToday;
}
