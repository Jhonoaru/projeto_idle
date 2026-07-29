import type {
  Character,
  Guild,
  GuildDepot,
  GuildRegionalOrderDifficulty,
  GuildRegionalOrderObjective,
  Item,
} from "../../shared/types";
import { buildRegionalMaterialAcquisitionPlan } from "./buildRegionalMaterialAcquisitionPlan";
import {
  buildRegionalCampaignDifficultyOptions,
  buildRegionalCampaignOffers,
  type RegionalCampaignOrderOffer,
} from "./regionalCampaignOrders";

export interface RegionalAcquisitionForecastMatch {
  id: string;
  orderId: string;
  regionId: string;
  regionName: string;
  regionSigil: string;
  orderTitle: string;
  objective: GuildRegionalOrderObjective;
  destination: RegionalCampaignOrderOffer["destination"];
  difficulty: GuildRegionalOrderDifficulty;
  difficultyLabel: string;
  requiredGuildLevel: number;
  unlocked: boolean;
  item: Item;
  quantity: number;
  missing: number;
  contribution: number;
  rewardGold: number;
  rewardTableLabel: string;
}

export interface RegionalAcquisitionForecastDay {
  dateKey: string;
  daysFromNow: number;
  matchedMaterialCount: number;
  actionableCount: number;
  matches: RegionalAcquisitionForecastMatch[];
}

export interface RegionalAcquisitionForecast {
  startDateKey: string;
  endDateKey: string;
  horizonDays: number;
  shortageCount: number;
  forecastMaterialCount: number;
  actionableMaterialCount: number;
  totalMatches: number;
  firstActionableDateKey: string | null;
  days: RegionalAcquisitionForecastDay[];
}

const FORECAST_DAYS = 7;

export function buildRegionalAcquisitionForecast(
  guild: Guild,
  depot: GuildDepot,
  characters: Character[],
  now = new Date(),
): RegionalAcquisitionForecast {
  const validNow = now instanceof Date && Number.isFinite(now.getTime()) ? now : new Date();
  const plan = buildRegionalMaterialAcquisitionPlan(guild, depot, characters);
  const demands = new Map(plan.entries.map((entry) => [entry.item.id, entry]));
  const days = Array.from({ length: FORECAST_DAYS }, (_, index) => {
    const daysFromNow = index + 1;
    const date = addLocalDays(validNow, daysFromNow);
    const offers = buildRegionalCampaignOffers(guild.id, date);
    const matches = offers.flatMap((offer) => {
      const candidates = buildRegionalCampaignDifficultyOptions(guild, offer).flatMap((option) => {
        const demand = option.rewardItem ? demands.get(option.rewardItem.itemId) : undefined;
        if (!demand || !option.rewardItem || option.rewardItem.quantity < 1) return [];
        return [{
          id: `${offer.id}-${option.id}-${option.rewardItem.itemId}`,
          orderId: offer.id,
          regionId: offer.regionId,
          regionName: offer.regionName,
          regionSigil: offer.regionSigil,
          orderTitle: offer.title,
          objective: offer.objective,
          destination: offer.destination,
          difficulty: option.id,
          difficultyLabel: option.label,
          requiredGuildLevel: option.requiredGuildLevel,
          unlocked: option.unlocked,
          item: demand.item,
          quantity: option.rewardItem.quantity,
          missing: demand.missing,
          contribution: Math.min(demand.missing, option.rewardItem.quantity),
          rewardGold: option.rewardGold,
          rewardTableLabel: option.rewardTableLabel,
        } satisfies RegionalAcquisitionForecastMatch];
      }).sort(compareMatches);
      return candidates.slice(0, 1);
    }).sort(compareMatches);

    return {
      dateKey: localDateKey(date),
      daysFromNow,
      matchedMaterialCount: new Set(matches.map((entry) => entry.item.id)).size,
      actionableCount: matches.filter((entry) => entry.unlocked).length,
      matches,
    } satisfies RegionalAcquisitionForecastDay;
  });
  const forecastMaterials = new Set(days.flatMap((day) => day.matches.map((entry) => entry.item.id)));
  const actionableMaterials = new Set(days.flatMap((day) => day.matches.filter((entry) => entry.unlocked).map((entry) => entry.item.id)));

  return {
    startDateKey: days[0].dateKey,
    endDateKey: days.at(-1)?.dateKey ?? days[0].dateKey,
    horizonDays: FORECAST_DAYS,
    shortageCount: plan.materialCount,
    forecastMaterialCount: forecastMaterials.size,
    actionableMaterialCount: actionableMaterials.size,
    totalMatches: days.reduce((total, day) => total + day.matches.length, 0),
    firstActionableDateKey: days.find((day) => day.actionableCount > 0)?.dateKey ?? null,
    days,
  };
}

function compareMatches(left: RegionalAcquisitionForecastMatch, right: RegionalAcquisitionForecastMatch) {
  return Number(right.unlocked) - Number(left.unlocked)
    || (!left.unlocked && !right.unlocked ? left.requiredGuildLevel - right.requiredGuildLevel : 0)
    || right.contribution - left.contribution
    || right.quantity - left.quantity
    || left.requiredGuildLevel - right.requiredGuildLevel
    || left.regionName.localeCompare(right.regionName)
    || left.orderTitle.localeCompare(right.orderTitle);
}

function addLocalDays(now: Date, days: number) {
  const date = new Date(now);
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

function localDateKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}
