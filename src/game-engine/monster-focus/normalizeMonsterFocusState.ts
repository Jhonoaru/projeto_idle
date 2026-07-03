import {
  monsterFocusBonusTypes,
  monsterFocusConfig,
} from "../../data/monsterFocus";
import type {
  MonsterFocusSlot,
  MonsterFocusState,
} from "../../shared/types";
import { createDefaultMonsterFocusState } from "./createDefaultMonsterFocusState";

export function normalizeMonsterFocusState(
  state?: Partial<MonsterFocusState> | null,
): MonsterFocusState {
  const defaults = createDefaultMonsterFocusState();
  const sourceSlots = Array.isArray(state?.slots) ? state?.slots ?? [] : [];

  return {
    slots: defaults.slots.map((defaultSlot) => {
      const source = sourceSlots.find((slot) => slot?.slotIndex === defaultSlot.slotIndex);

      return normalizeSlot(source, defaultSlot);
    }),
    lastFreeRerollAt: state?.lastFreeRerollAt ?? null,
  };
}

function normalizeSlot(
  source: Partial<MonsterFocusSlot> | undefined,
  fallback: MonsterFocusSlot,
): MonsterFocusSlot {
  if (!source) return fallback;
  if (fallback.status === "locked") {
    return { ...fallback, status: "locked" };
  }

  const bonusType = monsterFocusBonusTypes.includes(source.bonusType as never)
    ? source.bonusType
    : undefined;
  const remainingHunts = Math.max(
    0,
    Math.floor(Number.isFinite(source.remainingHunts) ? source.remainingHunts ?? 0 : 0),
  );
  const hasActiveData = Boolean(source.monsterId && bonusType && remainingHunts > 0);
  const status = hasActiveData
    ? "active"
    : source.status === "expired"
      ? "expired"
      : "empty";

  return {
    slotIndex: fallback.slotIndex,
    status,
    monsterId: status === "active" || status === "expired" ? source.monsterId : undefined,
    bonusType: status === "active" || status === "expired" ? bonusType : undefined,
    bonusPercent:
      status === "active" || status === "expired"
        ? Math.max(0, Math.round(source.bonusPercent ?? monsterFocusConfig.bonusPercentByType[bonusType ?? "experience"]))
        : undefined,
    remainingHunts: status === "active" ? remainingHunts : status === "expired" ? 0 : undefined,
    createdAt: source.createdAt,
    expiresAt: source.expiresAt ?? null,
    rerollCount: Math.max(0, Math.floor(source.rerollCount ?? 0)),
  };
}
