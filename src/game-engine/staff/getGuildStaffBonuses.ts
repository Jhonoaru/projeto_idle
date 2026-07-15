import { getGuildSpecialist } from "../../data/guildSpecialists";
import type { GuildSpecialistId, GuildStaffState } from "../../shared/types";
import { normalizeGuildStaffState } from "./normalizeGuildStaffState";

export function getGuildStaffBonuses(state: GuildStaffState | undefined, specialistOverride?: GuildSpecialistId) {
  const staff = normalizeGuildStaffState(state);
  return buildBonuses(getGuildSpecialist(specialistOverride ?? staff.activeSpecialistId));
}

export function getGuildSpecialistBonuses(specialistId: GuildSpecialistId | undefined) {
  return buildBonuses(getGuildSpecialist(specialistId));
}

function buildBonuses(specialist: ReturnType<typeof getGuildSpecialist>) {
  return {
    specialist,
    successChancePoints: specialist?.bonusType === "expedition_success" ? specialist.bonusValue : 0,
    dispatchDiscountPercent: specialist?.bonusType === "dispatch_discount" ? specialist.bonusValue : 0,
    expeditionGoldPercent: specialist?.bonusType === "expedition_gold" ? specialist.bonusValue : 0,
    expeditionRenown: specialist?.bonusType === "expedition_renown" ? specialist.bonusValue : 0,
  };
}

export function applyDispatchDiscount(cost: number, discountPercent: number) {
  const safeCost = Number.isFinite(cost) ? Math.max(0, Math.floor(cost)) : 0;
  const safeDiscount = Number.isFinite(discountPercent) ? Math.min(25, Math.max(0, discountPercent)) : 0;
  return Math.max(0, Math.floor(safeCost * (1 - safeDiscount / 100)));
}
