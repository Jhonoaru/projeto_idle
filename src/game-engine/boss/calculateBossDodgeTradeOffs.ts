import type {
  BossAbilityCastSummary,
  BossDodgeTradeOffSummary,
  BossTelegraphDodgeSummary,
  Character,
} from "../../shared/types";
import { normalizeBossDodgeBehavior } from "../combat-skills/normalizeCombatSkillLoadout";
import { normalizeBossManualReactions } from "./recordBossManualReaction";
import { getBossManualReactionEffects, normalizeBossManualReactionQuality } from "./getBossManualReactionTiming";
import { calculateBossPerfectReactionChains } from "./calculateBossPerfectReactionChains";

export function calculateBossDodgeTradeOffs(
  characters: Character[],
  abilityCasts: BossAbilityCastSummary[],
  dodges: BossTelegraphDodgeSummary[],
): BossDodgeTradeOffSummary[] {
  return characters.map((character) => {
    const perfectChains = calculateBossPerfectReactionChains(
      normalizeBossManualReactions(character.currentAction?.bossManualReactions),
      abilityCasts,
    );
    const behavior = normalizeBossDodgeBehavior(
      character.currentAction?.combatSkillLoadout?.bossDodgeBehavior
        ?? character.combatSkillLoadout?.bossDodgeBehavior,
    );
    const targetedTelegraphs = abilityCasts.filter((cast) => cast.targetCharacterId === character.id).length;
    const characterDodges = dodges.filter((dodge) => dodge.targetCharacterId === character.id);
    const successfulDodges = characterDodges.filter((dodge) => dodge.dodged).length;
    const targetedCastIds = new Set(abilityCasts.filter((cast) => cast.targetCharacterId === character.id).map((cast) => cast.castId));
    const manualHolds = normalizeBossManualReactions(character.currentAction?.bossManualReactions)
      .filter((entry) => entry.targetCharacterId === character.id && entry.reactionType === "hold" && targetedCastIds.has(entry.castId));
    const manualHoldCount = manualHolds.length;
    const baseManualPositionBonusPercent = manualHolds.reduce(
      (sum, entry) => sum + getBossManualReactionEffects(entry.quality).holdPowerPercent,
      0,
    );
    const perfectHoldChainBonusRaw = manualHolds.reduce(
      (sum, entry) => sum + (perfectChains.find((chain) => chain.castId === entry.castId)?.holdPowerPercent ?? 0),
      0,
    );
    const manualPositionBonusPercent = rounded(Math.min(1, baseManualPositionBonusPercent + perfectHoldChainBonusRaw));
    const perfectHoldChainBonusPercent = rounded(
      Math.max(0, manualPositionBonusPercent - Math.min(1, baseManualPositionBonusPercent)),
    );
    const manualHoldQualityCounts = manualHolds.reduce((counts, entry) => ({
      ...counts,
      [normalizeBossManualReactionQuality(entry.quality)]: counts[normalizeBossManualReactionQuality(entry.quality)] + 1,
    }), { early: 0, perfect: 0, late: 0, standard: 0 });
    const behaviorBonusPercent = targetedTelegraphs > 0
      ? behavior === "hold_position" ? 1.5 : behavior === "safe_windows" ? 0.75 : 0
      : 0;
    const offensiveBonusPercent = behaviorBonusPercent + manualPositionBonusPercent;

    return {
      characterId: character.id,
      characterName: character.name,
      dodgeBehavior: behavior,
      positioning: behavior === "hold_position" ? "anchored" : behavior === "safe_windows" ? "selective" : "mobile",
      targetedTelegraphs,
      dodgeAttempts: characterDodges.length,
      successfulDodges,
      unavoidedTelegraphs: Math.max(0, targetedTelegraphs - successfulDodges),
      offensiveBonusPercent,
      manualHoldCount,
      manualPositionBonusPercent,
      manualHoldQualityCounts,
      maxPerfectReactionStreak: perfectChains
        .filter((entry) => entry.targetCharacterId === character.id && entry.reactionType === "hold")
        .reduce((maximum, entry) => Math.max(maximum, entry.streak), 0),
      perfectHoldChainBonusPercent,
    };
  });
}

function rounded(value: number) {
  return Math.round(value * 100) / 100;
}
