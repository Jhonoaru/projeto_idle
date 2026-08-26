import type {
  BossAbilityCastSummary,
  BossManualReactionQuality,
} from "../../shared/types";

export interface BossManualReactionTiming {
  quality: BossManualReactionQuality;
  timingPercent?: number;
  dodgeBonusPercent: number;
  holdPowerPercent: number;
  validWindow: boolean;
}

const REACTION_EFFECTS: Record<BossManualReactionQuality, Omit<BossManualReactionTiming, "quality" | "timingPercent" | "validWindow">> = {
  early: { dodgeBonusPercent: 8, holdPowerPercent: 0.2 },
  perfect: { dodgeBonusPercent: 16, holdPowerPercent: 0.4 },
  late: { dodgeBonusPercent: 6, holdPowerPercent: 0.15 },
  standard: { dodgeBonusPercent: 12, holdPowerPercent: 0.25 },
};

export function getBossManualReactionTiming(
  actionStartedAt: string | undefined,
  cast: Pick<BossAbilityCastSummary, "telegraphStartsAtMs" | "resolvesAtMs">,
  recordedAt: string | Date,
): BossManualReactionTiming {
  const startedAtMs = dateMs(actionStartedAt);
  const recordedAtMs = dateMs(recordedAt);
  const startsAtMs = finite(cast.telegraphStartsAtMs);
  const resolvesAtMs = finite(cast.resolvesAtMs);
  const durationMs = resolvesAtMs - startsAtMs;
  if (!Number.isFinite(startedAtMs) || !Number.isFinite(recordedAtMs) || startsAtMs < 0 || durationMs <= 0) {
    return timingForQuality("standard", undefined, false);
  }
  const elapsedMs = recordedAtMs - startedAtMs;
  const timingPercent = rounded((elapsedMs - startsAtMs) / durationMs * 100);
  if (timingPercent < 0 || timingPercent > 100) {
    return timingForQuality("standard", timingPercent, false);
  }
  const quality: BossManualReactionQuality = timingPercent < 35
    ? "early"
    : timingPercent <= 75
      ? "perfect"
      : "late";
  return timingForQuality(quality, timingPercent, true);
}

export function getBossManualReactionEffects(value: unknown) {
  return REACTION_EFFECTS[normalizeBossManualReactionQuality(value)];
}

export function normalizeBossManualReactionQuality(value: unknown): BossManualReactionQuality {
  return value === "early" || value === "perfect" || value === "late" ? value : "standard";
}

function timingForQuality(
  quality: BossManualReactionQuality,
  timingPercent: number | undefined,
  validWindow: boolean,
): BossManualReactionTiming {
  return { quality, timingPercent, validWindow, ...REACTION_EFFECTS[quality] };
}

function dateMs(value: string | Date | undefined) {
  return value instanceof Date ? value.getTime() : typeof value === "string" ? new Date(value).getTime() : Number.NaN;
}

function finite(value: number) {
  return Number.isFinite(value) ? value : Number.NaN;
}

function rounded(value: number) {
  return Math.round(value * 100) / 100;
}
