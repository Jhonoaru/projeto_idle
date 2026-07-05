import { getTodayKey } from "./getTodayKey";

export function calculateDailyStreak(lastClaimedAt: string | null | undefined, currentStreak: number, now = new Date()) {
  if (!lastClaimedAt) return 1;

  const lastClaimDate = new Date(lastClaimedAt);
  if (Number.isNaN(lastClaimDate.getTime())) return 1;

  const lastKey = getTodayKey(lastClaimDate);
  const todayKey = getTodayKey(now);
  if (lastKey === todayKey) return currentStreak;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  return lastKey === getTodayKey(yesterday) ? currentStreak + 1 : 1;
}
