import type {
  BossAbilityCastSummary,
  BossDodgeTradeOffSummary,
  BossTelegraphDodgeSummary,
  Character,
} from "../../shared/types";
import { normalizeBossDodgeBehavior } from "../combat-skills/normalizeCombatSkillLoadout";
import { normalizeBossManualReactions } from "./recordBossManualReaction";

export function calculateBossDodgeTradeOffs(
  characters: Character[],
  abilityCasts: BossAbilityCastSummary[],
  dodges: BossTelegraphDodgeSummary[],
): BossDodgeTradeOffSummary[] {
  return characters.map((character) => {
    const behavior = normalizeBossDodgeBehavior(
      character.currentAction?.combatSkillLoadout?.bossDodgeBehavior
        ?? character.combatSkillLoadout?.bossDodgeBehavior,
    );
    const targetedTelegraphs = abilityCasts.filter((cast) => cast.targetCharacterId === character.id).length;
    const characterDodges = dodges.filter((dodge) => dodge.targetCharacterId === character.id);
    const successfulDodges = characterDodges.filter((dodge) => dodge.dodged).length;
    const targetedCastIds = new Set(abilityCasts.filter((cast) => cast.targetCharacterId === character.id).map((cast) => cast.castId));
    const manualHoldCount = normalizeBossManualReactions(character.currentAction?.bossManualReactions)
      .filter((entry) => entry.targetCharacterId === character.id && entry.reactionType === "hold" && targetedCastIds.has(entry.castId)).length;
    const manualPositionBonusPercent = Math.min(1, manualHoldCount * 0.25);
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
    };
  });
}
