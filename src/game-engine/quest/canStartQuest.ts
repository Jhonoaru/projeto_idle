import type { Character, Quest } from "../../shared/types";

export function canStartQuest(character: Character, quest: Quest, questCatalog: Quest[] = []) {
  if (character.status !== "idle") {
    return { canStart: false, reason: `${character.name} is ${character.status}.` };
  }

  if (character.level < quest.requiredLevel) {
    return { canStart: false, reason: `requires level ${quest.requiredLevel}.` };
  }

  if (quest.requiredAccess && !character.accessIds.includes(quest.requiredAccess)) {
    return { canStart: false, reason: `requires access ${quest.requiredAccess}.` };
  }

  const missingQuest = quest.requiredQuestIds?.find(
    (questId) => !character.completedQuestIds.includes(questId),
  );

  if (missingQuest) {
    const requiredQuestName = questCatalog.find((entry) => entry.id === missingQuest)?.name ?? missingQuest;
    return { canStart: false, reason: `requires contract ${requiredQuestName}.` };
  }

  if (character.completedQuestIds.includes(quest.id)) {
    return { canStart: false, reason: "quest already completed." };
  }

  return { canStart: true };
}
