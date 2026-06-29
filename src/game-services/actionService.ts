import { formatClock } from "../shared/time";
import type { Character } from "../shared/types";

const cancellableStatuses = ["hunting", "training", "questing", "bossing"] as const;
const travelDurationMs = 10_000;

export function cancelCurrentAction(character: Character) {
  if (character.status === "idle") {
    return { character, success: false, message: `${character.name} ja esta parado.` };
  }

  if (character.status === "dead") {
    return { character, success: false, message: `${character.name} esta morto.` };
  }

  if (!cancellableStatuses.includes(character.status as (typeof cancellableStatuses)[number])) {
    return {
      character,
      success: false,
      message: `${character.name} nao possui uma acao cancelavel.`,
    };
  }

  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + travelDurationMs);
  const questProgress =
    character.currentAction?.type === "questing" && character.currentAction.targetId
      ? character.questProgress.map((progress) =>
          progress.questId === character.currentAction?.targetId &&
          progress.status === "in_progress"
            ? { ...progress, status: "failed" as const }
            : progress,
        )
      : character.questProgress;
  const updatedCharacter: Character = {
    ...character,
    status: "traveling",
    questProgress,
    currentAction: {
      type: "traveling",
      label: `Retornando para ${character.city}`,
      startedAt: formatClock(startedAt),
      endsAt: formatClock(endsAt),
      durationMinutes: travelDurationMs / 60_000,
      targetName: character.city,
    },
  };

  return {
    character: updatedCharacter,
    success: true,
    message: `${character.name} cancelou a acao e esta retornando para ${character.city}.`,
  };
}

export function finishTravel(character: Character) {
  if (character.status !== "traveling" || !character.currentAction) {
    return { character, success: false, message: `${character.name} nao esta viajando.` };
  }

  const remainingMs = getTravelRemainingMs(character);

  if (remainingMs > 0) {
    return {
      character,
      success: false,
      remainingMs,
      message: `${character.name} ainda esta viajando.`,
    };
  }

  return {
    character: {
      ...character,
      status: "idle" as const,
      currentAction: undefined,
    },
    success: true,
    remainingMs: 0,
    message: `${character.name} chegou em ${character.city} e esta disponivel.`,
  };
}

export function getTravelRemainingMs(character: Character) {
  if (character.status !== "traveling" || !character.currentAction?.endsAt) {
    return 0;
  }

  const [hours, minutes, seconds] = character.currentAction.endsAt
    .split(":")
    .map(Number);
  const now = new Date();
  const endsAt = new Date(now);
  endsAt.setHours(hours, minutes, seconds || 0, 0);

  if (endsAt.getTime() < now.getTime() - 12 * 60 * 60 * 1000) {
    endsAt.setDate(endsAt.getDate() + 1);
  }

  return Math.max(0, endsAt.getTime() - now.getTime());
}
