import { addExperience } from "../progression/addExperience";
import type { Character, Quest } from "../../shared/types";

export function completeQuest(character: Character, quest: Quest, xpBonusPercent = 0) {
  const safeBonusPercent = Number.isFinite(xpBonusPercent)
    ? Math.min(25, Math.max(0, Math.floor(xpBonusPercent)))
    : 0;
  const experienceGained = Math.round((quest.rewards.experience ?? 0) * (1 + safeBonusPercent / 100));
  const withExperience = addExperience(character, experienceGained);
  const accessIds =
    quest.unlocksAccess && !withExperience.character.accessIds.includes(quest.unlocksAccess)
      ? [...withExperience.character.accessIds, quest.unlocksAccess]
      : withExperience.character.accessIds;
  const completedQuestIds = withExperience.character.completedQuestIds.includes(quest.id)
    ? withExperience.character.completedQuestIds
    : [...withExperience.character.completedQuestIds, quest.id];

  return {
    character: {
      ...withExperience.character,
      accessIds,
      completedQuestIds,
      questProgress: withExperience.character.questProgress.map((progress) =>
        progress.questId === quest.id
          ? {
              ...progress,
              status: "completed" as const,
              completedAt: new Date().toISOString(),
            }
          : progress,
      ),
      status: "idle" as const,
      currentAction: undefined,
    },
    levelResult: withExperience.result,
    experienceGained,
  };
}
