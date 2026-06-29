import { addExperience } from "../progression/addExperience";
import type { Character, Quest } from "../../shared/types";

export function completeQuest(character: Character, quest: Quest) {
  const withExperience = addExperience(character, quest.rewards.experience ?? 0);
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
      gold: withExperience.character.gold + (quest.rewards.gold ?? 0),
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
  };
}
