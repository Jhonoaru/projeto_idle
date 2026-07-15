import { canStartQuest } from "./canStartQuest";
import type { Character, Quest, QuestStatus } from "../../shared/types";

export function getQuestAvailability(character: Character, quests: Quest[]) {
  return quests.map((quest) => {
    let status: QuestStatus = "locked";

    if (character.completedQuestIds.includes(quest.id)) {
      status = "completed";
    } else {
      const progress = character.questProgress.find(
        (entry) => entry.questId === quest.id && entry.status === "in_progress",
      );

      if (progress) {
        status = "in_progress";
      } else if (canStartQuest(character, quest, quests).canStart) {
        status = "available";
      }
    }

    return { quest, status };
  });
}
