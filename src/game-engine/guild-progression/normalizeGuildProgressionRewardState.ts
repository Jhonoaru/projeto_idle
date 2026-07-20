import { guildLevelRewards } from "../../data/guildLevelRewards";
import type { GuildLevelRewardClaim, GuildProgressionRewardState } from "../../shared/types";

const validLevels = new Set(guildLevelRewards.map((reward) => reward.level));

export function normalizeGuildProgressionRewardState(state: GuildProgressionRewardState | null | undefined): GuildProgressionRewardState {
  const claimedLevels = Array.from(new Set(
    (Array.isArray(state?.claimedLevels) ? state.claimedLevels : [])
      .map(normalizeLevel)
      .filter((level): level is number => level !== undefined && validLevels.has(level)),
  )).sort((left, right) => left - right);
  const claimedSet = new Set(claimedLevels);
  const historyByLevel = new Map<number, GuildLevelRewardClaim>();

  for (const entry of Array.isArray(state?.claimHistory) ? state.claimHistory : []) {
    const level = normalizeLevel(entry?.level);
    if (level === undefined || !claimedSet.has(level) || !validLevels.has(level)) continue;
    if (typeof entry.label !== "string" || entry.label.trim().length === 0) continue;
    if (typeof entry.claimedAt !== "string" || !Number.isFinite(new Date(entry.claimedAt).getTime())) continue;
    historyByLevel.set(level, { level, label: entry.label.trim(), claimedAt: new Date(entry.claimedAt).toISOString() });
  }

  return {
    claimedLevels,
    claimHistory: [...historyByLevel.values()].sort((left, right) => left.level - right.level),
  };
}

function normalizeLevel(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  const level = Math.floor(parsed);
  return level > 0 ? level : undefined;
}
