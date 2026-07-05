import { DAILY_REWARD_CYCLE_LENGTH } from "../../data/dailyRewards";
import type { DailyRewardClaim, DailyRewardState, DailyRewardType } from "../../shared/types";
import { createDefaultDailyRewardState } from "./createDefaultDailyRewardState";
import { getTodayKey } from "./getTodayKey";

const rewardTypes: DailyRewardType[] = [
  "gold",
  "item",
  "material",
  "supply",
  "collection",
  "xp_boost_placeholder",
];

export function normalizeDailyRewardState(
  state?: Partial<DailyRewardState> | null,
  now = new Date(),
): DailyRewardState {
  const defaults = createDefaultDailyRewardState();
  const lastClaimedAt = normalizeDateString(state?.lastClaimedAt);
  const currentStreak = normalizeNonNegativeInteger(state?.currentStreak, defaults.currentStreak);
  const totalClaims = normalizeNonNegativeInteger(state?.totalClaims, defaults.totalClaims);
  const cycleDay = normalizeCycleDay(state?.cycleDay);
  const claimHistory = normalizeClaimHistory(state?.claimHistory);
  const claimedToday = lastClaimedAt ? getTodayKey(new Date(lastClaimedAt)) === getTodayKey(now) : false;

  return {
    lastClaimedAt,
    currentStreak,
    totalClaims,
    cycleDay,
    claimHistory,
    claimedToday,
  };
}

function normalizeDateString(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeNonNegativeInteger(value: unknown, fallback: number) {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) return fallback;

  return Math.floor(numberValue);
}

function normalizeCycleDay(value: unknown) {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 1 || numberValue > DAILY_REWARD_CYCLE_LENGTH) return 1;

  return Math.floor(numberValue);
}

function normalizeClaimHistory(value: unknown): DailyRewardClaim[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return undefined;
      const candidate = entry as Partial<DailyRewardClaim>;
      const claimedAt = normalizeDateString(candidate.claimedAt);
      const day = normalizeCycleDay(candidate.day);
      const rewardType = rewardTypes.includes(candidate.rewardType as DailyRewardType)
        ? candidate.rewardType as DailyRewardType
        : "gold";
      const label = typeof candidate.label === "string" && candidate.label.trim()
        ? candidate.label
        : "Daily Reward";

      return claimedAt ? { claimedAt, day, rewardType, label } : undefined;
    })
    .filter((entry): entry is DailyRewardClaim => Boolean(entry))
    .slice(-20);
}
