import { formatClock } from "../../shared/time";
import { clampMaxRepeats, normalizeCompletedRepeats } from "./canContinueAutoRepeat";
import { MAX_AUTO_REPEAT_RUNS } from "./constants";
import type { Character, HuntArea, HuntAutoRepeatConfig } from "../../shared/types";

export function createNextRepeatedHuntAction(
  character: Character,
  hunt: HuntArea,
  config: HuntAutoRepeatConfig,
  durationMinutes: number,
  guildXpBonusPercent = 0,
): Character {
  const now = new Date();
  const endsAt = new Date(now.getTime() + durationMinutes * 60_000);
  const completedRepeats = normalizeCompletedRepeats(config.completedRepeats);
  const maxRepeats = clampMaxRepeats(config.maxRepeats);
  const displayMaxRepeats = config.mode === "repeat_count" ? maxRepeats : MAX_AUTO_REPEAT_RUNS;
  const repeatIndex = completedRepeats + 1;
  const safeGuildXpBonus = Number.isFinite(guildXpBonusPercent) ? Math.min(25, Math.max(0, Math.floor(guildXpBonusPercent))) : 0;

  return {
    ...character,
    status: "hunting",
    currentAction: {
      type: "hunting",
      label: `Hunting at ${hunt.name}`,
      startedAt: formatClock(now),
      endsAt: formatClock(endsAt),
      durationMinutes,
      targetId: hunt.id,
      targetName: hunt.name,
      risk: hunt.risk,
      expectedXp: Math.round((hunt.estimatedXpPerHour / 60) * durationMinutes * (1 + safeGuildXpBonus / 100)),
      guildXpBonusPercent: safeGuildXpBonus,
      expectedGold: Math.round((hunt.estimatedGoldPerHour / 60) * durationMinutes),
      autoRepeat: {
        ...config,
        maxRepeats,
        updatedAt: now.toISOString(),
      },
      repeatGroupId: character.currentAction?.repeatGroupId ?? `repeat-${character.id}-${hunt.id}-${Date.now()}`,
      repeatIndex,
      maxRepeatIndex: displayMaxRepeats,
    },
  };
}
