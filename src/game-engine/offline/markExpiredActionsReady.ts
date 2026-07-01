import { getActionCompletionStatus, resolveActionEndsAt } from "./getActionCompletionStatus";
import type { Character, OfflineCharacterReport } from "../../shared/types";

const resolvableStatuses = ["hunting", "training", "questing", "bossing"] as const;

export function markExpiredActionsReady(
  characters: Character[],
  now: Date,
  lastSavedAt?: string,
) {
  const reports: OfflineCharacterReport[] = [];
  const logs: string[] = [];
  const updatedCharacters = characters.map((character) => {
    const status = getActionCompletionStatus(character, now, lastSavedAt);

    if (character.status === "traveling" && character.currentAction) {
      if (status !== "completed_offline") return character;

      const destination = character.currentAction.targetName ?? character.city;
      reports.push({
        characterId: character.id,
        characterName: character.name,
        actionType: "traveling",
        actionLabel: character.currentAction.label,
        completedOffline: true,
        readyToResolve: false,
        message: `${character.name} arrived at ${destination} while offline.`,
      });
      logs.push(`${character.name} arrived at ${destination} while offline.`);
      return {
        ...character,
        city: destination,
        status: "idle" as const,
        currentAction: undefined,
      };
    }

    if (character.status === "dead") {
      if (status !== "dead_recovery_ready") return character;

      reports.push({
        characterId: character.id,
        characterName: character.name,
        actionType: "dead",
        actionLabel: character.deathState?.sourceName ?? "Death recovery",
        completedOffline: true,
        readyToResolve: true,
        message: `${character.name} can now be revived at ${character.deathState?.templeName ?? "the temple"}.`,
      });
      logs.push(`${character.name} is ready to revive at ${character.deathState?.templeName ?? "the temple"}.`);
      return character;
    }

    if (!character.currentAction || !resolvableStatuses.includes(character.status as (typeof resolvableStatuses)[number])) {
      return character;
    }

    if (status === "ready_to_resolve") return character;

    if (status !== "completed_offline") return character;

    const endsAt = resolveActionEndsAt(
      character.currentAction.endsAt,
      lastSavedAt ? new Date(lastSavedAt) : now,
    );
    const offlineElapsedMs = endsAt ? Math.max(0, now.getTime() - endsAt.getTime()) : undefined;
    const action = {
      ...character.currentAction,
      readyToResolve: true,
      offlineCompletedAt: endsAt?.toISOString() ?? now.toISOString(),
      offlineElapsedMs,
    };

    reports.push({
      characterId: character.id,
      characterName: character.name,
      actionType: action.type,
      actionLabel: action.label,
      completedOffline: true,
      readyToResolve: true,
      message: `${character.name} completed ${action.targetName ?? action.label} while offline. Result ready to collect.`,
    });
    logs.push(`${character.name} completed ${action.targetName ?? action.label} while offline.`);

    return {
      ...character,
      currentAction: action,
    };
  });

  return {
    characters: updatedCharacters,
    reports,
    logs,
  };
}
