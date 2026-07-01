import type { Character } from "../../shared/types";

export type OfflineActionCompletionStatus =
  | "running"
  | "completed_online"
  | "completed_offline"
  | "ready_to_resolve"
  | "dead_recovery_ready"
  | "invalid";

export function getActionCompletionStatus(
  character: Character,
  now: Date,
  lastSavedAt?: string,
): OfflineActionCompletionStatus {
  if (character.status === "dead") {
    const recoveryEndsAt = character.deathState?.recoveryEndsAt
      ? new Date(character.deathState.recoveryEndsAt).getTime()
      : Number.NaN;
    return Number.isFinite(recoveryEndsAt) && recoveryEndsAt <= now.getTime()
      ? "dead_recovery_ready"
      : "running";
  }

  const action = character.currentAction;
  if (!action) return "running";
  if (action.resolvedAt) return "invalid";
  if (action.readyToResolve) return "ready_to_resolve";

  const endsAt = resolveActionEndsAt(action.endsAt, lastSavedAt ? new Date(lastSavedAt) : now);
  if (!endsAt) return "invalid";

  return endsAt.getTime() <= now.getTime() ? "completed_offline" : "running";
}

export function resolveActionEndsAt(endsAt: string | undefined, anchor: Date) {
  if (!endsAt) return undefined;

  const isoDate = new Date(endsAt);
  if (Number.isFinite(isoDate.getTime()) && endsAt.includes("T")) {
    return isoDate;
  }

  const parts = endsAt.split(":").map(Number);
  if (parts.length < 2 || parts.some((part) => !Number.isFinite(part))) {
    return undefined;
  }

  const [hours, minutes, seconds = 0] = parts;
  const resolved = new Date(anchor);
  resolved.setHours(hours, minutes, seconds, 0);

  if (resolved.getTime() < anchor.getTime() - 12 * 60 * 60 * 1000) {
    resolved.setDate(resolved.getDate() + 1);
  }

  if (resolved.getTime() > anchor.getTime() + 12 * 60 * 60 * 1000) {
    resolved.setDate(resolved.getDate() - 1);
  }

  return resolved;
}
