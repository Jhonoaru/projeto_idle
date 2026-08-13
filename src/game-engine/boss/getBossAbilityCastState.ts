import type { BossAbilityCastSummary, BossThreatSummary } from "../../shared/types";

export type BossAbilityCastStateName = "idle" | "telegraphing" | "cooldown" | "resolved";

export interface BossAbilityCastState {
  state: BossAbilityCastStateName;
  cast?: BossAbilityCastSummary;
  nextCast?: BossAbilityCastSummary;
  remainingMs: number;
  progressPercent: number;
}

export function getBossAbilityCastState(
  threat: BossThreatSummary | undefined,
  elapsedMs: number,
  resolved = false,
): BossAbilityCastState {
  if (!threat || resolved) return { state: resolved ? "resolved" : "idle", remainingMs: 0, progressPercent: resolved ? 100 : 0 };
  const now = Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0);
  const casts = [...threat.abilityCasts].sort((left, right) => left.telegraphStartsAtMs - right.telegraphStartsAtMs);
  const telegraph = casts.find((cast) => now >= cast.telegraphStartsAtMs && now < cast.resolvesAtMs);
  if (telegraph) {
    const duration = Math.max(1, telegraph.resolvesAtMs - telegraph.telegraphStartsAtMs);
    return {
      state: "telegraphing",
      cast: telegraph,
      nextCast: telegraph,
      remainingMs: Math.max(0, telegraph.resolvesAtMs - now),
      progressPercent: clamp(Math.round(((now - telegraph.telegraphStartsAtMs) / duration) * 100), 0, 100),
    };
  }
  const cooldown = [...casts].reverse().find((cast) => now >= cast.resolvesAtMs && now < cast.cooldownEndsAtMs);
  if (cooldown) {
    const duration = Math.max(1, cooldown.cooldownEndsAtMs - cooldown.resolvesAtMs);
    return {
      state: "cooldown",
      cast: cooldown,
      nextCast: casts.find((cast) => cast.telegraphStartsAtMs > now),
      remainingMs: Math.max(0, cooldown.cooldownEndsAtMs - now),
      progressPercent: clamp(Math.round(((now - cooldown.resolvesAtMs) / duration) * 100), 0, 100),
    };
  }
  return {
    state: "idle",
    nextCast: casts.find((cast) => cast.telegraphStartsAtMs > now),
    remainingMs: 0,
    progressPercent: 0,
  };
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}
