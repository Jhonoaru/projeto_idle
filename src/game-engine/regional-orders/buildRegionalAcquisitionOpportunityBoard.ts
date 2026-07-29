import { getRegionalCampaignDifficultyBand } from "../../data/regionalCampaignOrders";
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
  buildRegionalCampaignOrderStatuses,
  getLocalCampaignCycleKey,
  type RegionalCampaignOrderStatus,
} from "./regionalCampaignOrders";

export type RegionalAcquisitionOpportunityState = "available" | "active" | "ready" | "blocked" | "locked" | "completed";

export interface RegionalAcquisitionOpportunity {
  id: string;
  orderId: string;
  regionId: string;
  regionName: string;
  regionSigil: string;
  orderTitle: string;
  objective: GuildRegionalOrderObjective;
  objectiveLabel: string;
  destination: RegionalCampaignOrderStatus["destination"];
  difficulty: GuildRegionalOrderDifficulty;
  difficultyLabel: string;
  requiredGuildLevel: number;
  state: RegionalAcquisitionOpportunityState;
  item: Item;
  quantity: number;
  missing: number;
  contribution: number;
  remainingAfterClaim: number;
  rewardGold: number;
  rewardTableLabel: string;
}

export interface RegionalAcquisitionOpportunityBoard {
  cycleKey: string;
  nextRotationAt: string;
  shortageCount: number;
  matchedMaterialCount: number;
  actionableCount: number;
  opportunities: RegionalAcquisitionOpportunity[];
}

const objectiveLabels: Record<GuildRegionalOrderObjective, string> = {
  hunt_minutes: "Hunt Route",
  boss_defeats: "Boss Route",
  contract_successes: "Contract Route",
};

export function buildRegionalAcquisitionOpportunityBoard(
  guild: Guild,
  depot: GuildDepot,
  characters: Character[],
  now = new Date(),
): RegionalAcquisitionOpportunityBoard {
  const validNow = Number.isFinite(now.getTime()) ? now : new Date();
  const cycleKey = getLocalCampaignCycleKey(validNow);
  const plan = buildRegionalMaterialAcquisitionPlan(guild, depot, characters);
  const demands = new Map(plan.entries.map((entry) => [entry.item.id, entry]));
  const statuses = buildRegionalCampaignOrderStatuses(guild, validNow).filter((order) => order.cycleKey === cycleKey);
  const opportunities = statuses.flatMap((order) => {
    const candidates = buildCandidates(guild, order).flatMap((candidate) => {
      const demand = candidate.itemId ? demands.get(candidate.itemId) : undefined;
      if (!demand || !candidate.quantity || candidate.quantity < 1) return [];
      const state = opportunityState(order.state, candidate.unlocked);
      return [{
        id: `${order.id}-${candidate.difficulty}-${candidate.itemId}`,
        orderId: order.id,
        regionId: order.regionId,
        regionName: order.regionName,
        regionSigil: order.regionSigil,
        orderTitle: order.title,
        objective: order.objective,
        objectiveLabel: objectiveLabels[order.objective],
        destination: order.destination,
        difficulty: candidate.difficulty,
        difficultyLabel: candidate.difficultyLabel,
        requiredGuildLevel: candidate.requiredGuildLevel,
        state,
        item: demand.item,
        quantity: candidate.quantity,
        missing: demand.missing,
        contribution: Math.min(demand.missing, candidate.quantity),
        remainingAfterClaim: Math.max(0, demand.missing - candidate.quantity),
        rewardGold: candidate.rewardGold,
        rewardTableLabel: candidate.rewardTableLabel,
      } satisfies RegionalAcquisitionOpportunity];
    });
    candidates.sort(compareOpportunities);
    return candidates.slice(0, 1);
  }).sort(compareOpportunities);
  const nextRotation = new Date(validNow);
  nextRotation.setHours(24, 0, 0, 0);

  return {
    cycleKey,
    nextRotationAt: nextRotation.toISOString(),
    shortageCount: plan.materialCount,
    matchedMaterialCount: new Set(opportunities.map((entry) => entry.item.id)).size,
    actionableCount: opportunities.filter((entry) => entry.state === "available" || entry.state === "active" || entry.state === "ready").length,
    opportunities,
  };
}

function buildCandidates(guild: Guild, order: RegionalCampaignOrderStatus) {
  if (order.state === "active" || order.state === "ready" || order.state === "claimed") {
    const band = getRegionalCampaignDifficultyBand(order.difficulty);
    return [{
      difficulty: order.difficulty,
      difficultyLabel: order.difficultyLabel,
      requiredGuildLevel: band.requiredGuildLevel,
      unlocked: true,
      itemId: order.rewardItem?.itemId,
      quantity: order.rewardItem?.quantity,
      rewardGold: order.rewardGold,
      rewardTableLabel: order.rewardTableLabel,
    }];
  }
  return buildRegionalCampaignDifficultyOptions(guild, order).map((option) => ({
    difficulty: option.id,
    difficultyLabel: option.label,
    requiredGuildLevel: option.requiredGuildLevel,
    unlocked: option.unlocked,
    itemId: option.rewardItem?.itemId,
    quantity: option.rewardItem?.quantity,
    rewardGold: option.rewardGold,
    rewardTableLabel: option.rewardTableLabel,
  }));
}

function opportunityState(state: RegionalCampaignOrderStatus["state"], unlocked: boolean): RegionalAcquisitionOpportunityState {
  if (state === "claimed") return "completed";
  if (state === "ready") return "ready";
  if (state === "active") return "active";
  if (!unlocked) return "locked";
  if (state === "unavailable") return "blocked";
  return "available";
}

function compareOpportunities(left: RegionalAcquisitionOpportunity, right: RegionalAcquisitionOpportunity) {
  return stateRank(left.state) - stateRank(right.state)
    || (left.state === "locked" && right.state === "locked"
      ? left.requiredGuildLevel - right.requiredGuildLevel
      : 0)
    || right.contribution - left.contribution
    || right.quantity - left.quantity
    || left.requiredGuildLevel - right.requiredGuildLevel
    || left.regionName.localeCompare(right.regionName)
    || left.orderTitle.localeCompare(right.orderTitle);
}

function stateRank(state: RegionalAcquisitionOpportunityState) {
  if (state === "ready") return 0;
  if (state === "active") return 1;
  if (state === "available") return 2;
  if (state === "blocked") return 3;
  if (state === "locked") return 4;
  return 5;
}
