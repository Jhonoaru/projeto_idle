import {
  monsterFocusBonusTypes,
  monsterFocusConfig,
} from "../../data/monsterFocus";
import { monsters } from "../../data/monsters";
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
  const remainingHunts = toSafeInteger(source.remainingHunts);
  const monsterId = isCatalogMonster(source.monsterId) ? source.monsterId : undefined;
  const hasActiveData = Boolean(monsterId && bonusType && remainingHunts > 0);
  const status = hasActiveData
    ? "active"
    : source.status === "expired" && monsterId && bonusType
      ? "expired"
      : "empty";
  const defaultBonusPercent = monsterFocusConfig.bonusPercentByType[bonusType ?? "experience"];
  const bonusPercent = toSafeInteger(source.bonusPercent, defaultBonusPercent);

  return {
    slotIndex: fallback.slotIndex,
    status,
    monsterId: status === "active" || status === "expired" ? monsterId : undefined,
    bonusType: status === "active" || status === "expired" ? bonusType : undefined,
    bonusPercent: status === "active" || status === "expired" ? bonusPercent : undefined,
    remainingHunts: status === "active" ? remainingHunts : status === "expired" ? 0 : undefined,
    createdAt: source.createdAt,
    expiresAt: source.expiresAt ?? null,
    rerollCount: toSafeInteger(source.rerollCount),
  };
}

function isCatalogMonster(monsterId: string | undefined) {
  return Boolean(monsterId && Object.values(monsters).some((monster) => monster.id === monsterId));
}

function toSafeInteger(value: unknown, fallback = 0) {
  const numberValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numberValue)) return fallback;

  return Math.max(0, Math.floor(numberValue));
}
