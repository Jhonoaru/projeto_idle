import { canStartQuest } from "../game-engine/quest/canStartQuest";
import { calculateQuestRisk } from "../game-engine/quest/calculateQuestRisk";
import { completeQuest } from "../game-engine/quest/completeQuest";
import { createSeededRandom } from "../game-engine/hunt/random";
import { formatClock } from "../shared/time";
import type { Character, Quest } from "../shared/types";

export function startQuest(character: Character, quest: Quest) {
  const validation = canStartQuest(character, quest);

  if (!validation.canStart) {
    throw new Error(`${character.name} nao pode iniciar ${quest.name}: ${validation.reason}`);
  }

  const risk = calculateQuestRisk(character, quest);
  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + quest.totalDurationMinutes * 60_000);
  const progress = {
    questId: quest.id,
    status: "in_progress" as const,
    currentStepIndex: 0,
    startedAt: startedAt.toISOString(),
    endsAt: endsAt.toISOString(),
  };

  return {
    character: {
      ...character,
      status: "questing" as const,
      currentAction: {
        type: "questing" as const,
        label: quest.name,
        startedAt: formatClock(startedAt),
        endsAt: formatClock(endsAt),
        durationMinutes: quest.totalDurationMinutes,
        targetId: quest.id,
        targetName: quest.name,
      },
      questProgress: [
        ...character.questProgress.filter((entry) => entry.questId !== quest.id),
        progress,
      ],
    },
    logs: [
      `${character.name} iniciou a quest ${quest.name}.`,
      `${quest.name} tem risco ${risk.label.toLowerCase()}.`,
    ],
  };
}

export function finishQuest(character: Character, quest: Quest) {
  if (character.status !== "questing" || character.currentAction?.targetId !== quest.id) {
    throw new Error(`${character.name} nao esta fazendo ${quest.name}.`);
  }

  const risk = calculateQuestRisk(character, quest);
  const random = createSeededRandom(`${character.id}-${quest.id}-${character.experience}`);
  const died = random() < risk.deathChance;
  const failed = died || random() < risk.failChance;

  if (died) {
    return {
      character: {
        ...character,
        status: "dead" as const,
        currentAction: undefined,
        questProgress: markQuest(character, quest.id, "failed"),
      },
      guildRenownGained: 0,
      result: {
        success: false,
        died: true,
        accessUnlocked: undefined,
        logs: [`${character.name} morreu durante ${quest.name}.`],
      },
    };
  }

  if (failed) {
    return {
      character: {
        ...character,
        status: "idle" as const,
        currentAction: undefined,
        questProgress: markQuest(character, quest.id, "failed"),
      },
      guildRenownGained: 0,
      result: {
        success: false,
        died: false,
        accessUnlocked: undefined,
        logs: [`${character.name} falhou em ${quest.name}.`],
      },
    };
  }

  const completed = completeQuest(character, quest);
  const logs = [
    `${character.name} completou ${quest.name}.`,
    ...(quest.unlocksAccess ? [`${character.name} liberou ${quest.unlocksAccess}.`] : []),
    ...(completed.levelResult.levelsGained > 0
      ? [
          `${character.name} avancou do level ${completed.levelResult.oldLevel} para ${completed.levelResult.newLevel}.`,
        ]
      : []),
  ];

  return {
    character: completed.character,
    guildRenownGained: quest.rewards.renown ?? 0,
    result: {
      success: true,
      died: false,
      accessUnlocked: quest.unlocksAccess,
      logs,
    },
  };
}

function markQuest(
  character: Character,
  questId: string,
  status: "failed" | "completed",
) {
  return character.questProgress.map((progress) =>
    progress.questId === questId
      ? {
          ...progress,
          status,
          completedAt: status === "completed" ? new Date().toISOString() : progress.completedAt,
        }
      : progress,
  );
}
