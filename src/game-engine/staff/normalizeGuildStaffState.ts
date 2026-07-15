import { getGuildSpecialist } from "../../data/guildSpecialists";
import type { GuildSpecialistId, GuildStaffState } from "../../shared/types";

export function createDefaultGuildStaffState(): GuildStaffState {
  return { hiredSpecialistIds: [], activeSpecialistId: null, totalSpentGold: 0 };
}

export function normalizeGuildStaffState(value: unknown): GuildStaffState {
  if (!value || typeof value !== "object") return createDefaultGuildStaffState();
  const candidate = value as Partial<GuildStaffState>;
  const hiredSpecialistIds = Array.isArray(candidate.hiredSpecialistIds)
    ? [...new Set(candidate.hiredSpecialistIds.filter(isSpecialistId))]
    : [];
  const activeSpecialistId = isSpecialistId(candidate.activeSpecialistId) && hiredSpecialistIds.includes(candidate.activeSpecialistId)
    ? candidate.activeSpecialistId
    : null;
  return {
    hiredSpecialistIds,
    activeSpecialistId,
    totalSpentGold: normalizeInteger(candidate.totalSpentGold),
  };
}

function isSpecialistId(value: unknown): value is GuildSpecialistId {
  return typeof value === "string" && Boolean(getGuildSpecialist(value));
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}
