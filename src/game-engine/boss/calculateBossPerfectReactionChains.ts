import type {
  BossAbilityCastSummary,
  BossManualReaction,
  BossManualReactionQuality,
} from "../../shared/types";
import { normalizeBossManualReactionQuality } from "./getBossManualReactionTiming";

export interface BossPerfectReactionChainSummary {
  castId: string;
  targetCharacterId: string;
  reactionType: BossManualReaction["reactionType"];
  quality: BossManualReactionQuality;
  streak: number;
  dodgeBonusPercent: number;
  holdPowerPercent: number;
}

const MAX_CHAIN_BONUS_STEPS = 3;

export function calculateBossPerfectReactionChains(
  reactions: BossManualReaction[],
  eligibleCasts: BossAbilityCastSummary[],
): BossPerfectReactionChainSummary[] {
  const reactionsByCastId = new Map<string, BossManualReaction>();
  reactions.forEach((reaction) => {
    if (!reactionsByCastId.has(reaction.castId)) reactionsByCastId.set(reaction.castId, reaction);
  });

  const streaks = new Map<string, number>();
  const summaries: BossPerfectReactionChainSummary[] = [];
  [...eligibleCasts]
    .filter((cast) => Boolean(cast.targetCharacterId))
    .sort((left, right) => left.telegraphStartsAtMs - right.telegraphStartsAtMs || left.castId.localeCompare(right.castId))
    .forEach((cast) => {
      const targetCharacterId = cast.targetCharacterId!;
      const reaction = reactionsByCastId.get(cast.castId);
      if (!reaction || reaction.targetCharacterId !== targetCharacterId) {
        streaks.set(targetCharacterId, 0);
        return;
      }

      const quality = normalizeBossManualReactionQuality(reaction.quality);
      const streak = quality === "perfect" ? (streaks.get(targetCharacterId) ?? 0) + 1 : 0;
      streaks.set(targetCharacterId, streak);
      const effects = getBossPerfectReactionChainEffects(streak);
      summaries.push({
        castId: cast.castId,
        targetCharacterId,
        reactionType: reaction.reactionType,
        quality,
        streak,
        ...effects,
      });
    });

  return summaries;
}

export function getBossPerfectReactionChainEffects(streak: number) {
  const bonusSteps = Math.min(MAX_CHAIN_BONUS_STEPS, Math.max(0, Math.floor(finite(streak)) - 1));
  return {
    dodgeBonusPercent: bonusSteps * 2,
    holdPowerPercent: rounded(bonusSteps * 0.05),
  };
}

function finite(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function rounded(value: number) {
  return Math.round(value * 100) / 100;
}
