import { getHeadquartersBonuses } from "../headquarters/getHeadquartersBonuses";
import { getGuildDirectiveBonuses } from "../guild-directives/getGuildDirectiveStatus";
import type { Guild } from "../../shared/types";

export function getNpcDiscountPercent(guild: Guild) {
  return getHeadquartersBonuses(guild.headquarters).npcPriceDiscountPercent
    + getGuildDirectiveBonuses(guild).npcPriceDiscountPercent;
}

export function applyNpcDiscount(unitPrice: number, discountPercent: number) {
  const safePrice = Number.isFinite(unitPrice) ? Math.max(0, Math.floor(unitPrice)) : 0;
  const safeDiscount = Number.isFinite(discountPercent)
    ? Math.min(25, Math.max(0, Math.floor(discountPercent)))
    : 0;
  return Math.max(1, Math.round(safePrice * (1 - safeDiscount / 100)));
}
