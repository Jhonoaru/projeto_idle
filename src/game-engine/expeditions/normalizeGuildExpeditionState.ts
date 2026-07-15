import { getGuildContract } from "../../data/guildContracts";
import type { GuildExpeditionHistoryEntry, GuildExpeditionRun, GuildExpeditionState } from "../../shared/types";

export function createDefaultGuildExpeditionState(): GuildExpeditionState {
  return { history: [], totalCompleted: 0, totalSucceeded: 0 };
}

export function normalizeGuildExpeditionState(value: unknown): GuildExpeditionState {
  if (!value || typeof value !== "object") return createDefaultGuildExpeditionState();
  const candidate = value as Partial<GuildExpeditionState>;
  const history = Array.isArray(candidate.history)
    ? candidate.history.map(normalizeHistoryEntry).filter((entry): entry is GuildExpeditionHistoryEntry => Boolean(entry)).slice(0, 12)
    : [];
  const totalCompleted = normalizeInteger(candidate.totalCompleted);
  const totalSucceeded = Math.min(totalCompleted, normalizeInteger(candidate.totalSucceeded));

  return {
    activeExpedition: normalizeActiveExpedition(candidate.activeExpedition),
    history,
    totalCompleted: Math.max(totalCompleted, history.length),
    totalSucceeded: Math.max(totalSucceeded, history.filter((entry) => entry.success).length),
  };
}

function normalizeActiveExpedition(value: unknown): GuildExpeditionRun | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<GuildExpeditionRun>;
  if (!candidate.contractId || !getGuildContract(candidate.contractId)) return undefined;
  if (!isValidDate(candidate.startedAt) || !isValidDate(candidate.endsAt)) return undefined;
  const assignedCharacterIds = normalizeCharacterIds(candidate.assignedCharacterIds);
  if (assignedCharacterIds.length === 0) return undefined;

  return {
    id: typeof candidate.id === "string" && candidate.id ? candidate.id : `expedition-${candidate.contractId}-${Date.parse(candidate.startedAt!)}`,
    contractId: candidate.contractId,
    startedAt: candidate.startedAt!,
    endsAt: candidate.endsAt!,
    assignedCharacterIds,
    teamPower: normalizeInteger(candidate.teamPower),
    successChance: Math.min(95, Math.max(5, normalizeInteger(candidate.successChance))),
    outcomeRoll: normalizeRoll(candidate.outcomeRoll),
    dispatchCost: normalizeInteger(candidate.dispatchCost),
  };
}

function normalizeHistoryEntry(value: unknown): GuildExpeditionHistoryEntry | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<GuildExpeditionHistoryEntry>;
  if (!candidate.contractId || !getGuildContract(candidate.contractId) || !isValidDate(candidate.completedAt)) return undefined;
  return {
    id: typeof candidate.id === "string" && candidate.id ? candidate.id : `history-${candidate.contractId}-${Date.parse(candidate.completedAt!)}`,
    contractId: candidate.contractId,
    completedAt: candidate.completedAt!,
    assignedCharacterIds: normalizeCharacterIds(candidate.assignedCharacterIds),
    success: candidate.success === true,
    goldGained: normalizeInteger(candidate.goldGained),
    renownGained: normalizeInteger(candidate.renownGained),
    itemId: typeof candidate.itemId === "string" ? candidate.itemId : undefined,
    itemQuantity: normalizeInteger(candidate.itemQuantity) || undefined,
  };
}

function normalizeCharacterIds(value: unknown) {
  return Array.isArray(value)
    ? [...new Set(value.filter((entry): entry is string => typeof entry === "string" && entry.length > 0))].slice(0, 3)
    : [];
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

function normalizeRoll(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(0.999999, Math.max(0, parsed)) : 0.5;
}

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}
