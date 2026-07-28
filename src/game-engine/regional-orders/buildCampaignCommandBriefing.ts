import type { Guild, GuildRegionalOrderObjective } from "../../shared/types";
import {
  buildRegionalCampaignOrderStatuses,
  getLocalCampaignCycleKey,
  type RegionalCampaignOrderStatus,
} from "./regionalCampaignOrders";

export type CampaignCommandBriefingTone = "ready" | "active" | "available" | "complete";

export interface CampaignCommandBriefingOrder {
  id: string;
  regionName: string;
  regionSigil: string;
  title: string;
  state: RegionalCampaignOrderStatus["state"];
  objectiveLabel: string;
  progressLabel: string;
  progressPercent: number;
  rewardGold: number;
  previousCycle: boolean;
}

export interface CampaignCommandBriefing {
  cycleKey: string;
  tone: CampaignCommandBriefingTone;
  title: string;
  description: string;
  actionLabel: string;
  availableCount: number;
  completedCount: number;
  rewardReady: boolean;
  noticeBadge?: string;
  orders: CampaignCommandBriefingOrder[];
}

export function buildCampaignCommandBriefing(guild: Guild, now = new Date()): CampaignCommandBriefing {
  const cycleKey = getLocalCampaignCycleKey(now);
  const statuses = buildRegionalCampaignOrderStatuses(guild, now);
  const currentOrders = statuses.filter((order) => order.cycleKey === cycleKey);
  const activeOrder = statuses.find((order) => order.state === "active" || order.state === "ready");
  const availableCount = currentOrders.filter((order) => order.state === "available").length;
  const completedCount = currentOrders.filter((order) => order.state === "claimed").length;
  const rewardReady = activeOrder?.state === "ready";
  const command = getCommand(activeOrder, availableCount, completedCount, currentOrders.length);
  const visibleOrders = activeOrder && activeOrder.cycleKey !== cycleKey
    ? [activeOrder, ...currentOrders]
    : currentOrders;

  return {
    cycleKey,
    ...command,
    availableCount,
    completedCount,
    rewardReady,
    noticeBadge: rewardReady ? "!" : undefined,
    orders: visibleOrders.slice(0, 4).map((order) => ({
      id: order.id,
      regionName: order.regionName,
      regionSigil: order.regionSigil,
      title: order.title,
      state: order.state,
      objectiveLabel: `${order.difficultyLabel} ${objectiveLabel(order.objective)}`,
      progressLabel: `${order.progress}/${order.target} ${objectiveUnit(order.objective)}`,
      progressPercent: order.progressPercent,
      rewardGold: order.rewardGold,
      previousCycle: order.cycleKey !== cycleKey,
    })),
  };
}

function getCommand(
  activeOrder: RegionalCampaignOrderStatus | undefined,
  availableCount: number,
  completedCount: number,
  dailyOrderCount: number,
): Pick<CampaignCommandBriefing, "tone" | "title" | "description" | "actionLabel"> {
  if (activeOrder?.state === "ready") {
    return {
      tone: "ready",
      title: "Regional reward ready",
      description: `${activeOrder.regionName} has fulfilled its ${activeOrder.difficultyLabel} ${activeOrder.title} order. Claim ${activeOrder.rewardGold.toLocaleString("en-US")} guild gold from Campaign Operations.`,
      actionLabel: "Claim in Operations",
    };
  }
  if (activeOrder) {
    return {
      tone: "active",
      title: `${activeOrder.regionName} order in progress`,
      description: `${activeOrder.progress}/${activeOrder.target} ${objectiveUnit(activeOrder.objective)} complete on ${activeOrder.difficultyLabel} difficulty. Continue the assigned regional activity when the guild is ready.`,
      actionLabel: "Review Active Order",
    };
  }
  if (availableCount > 0) {
    return {
      tone: "available",
      title: `${availableCount} regional order${availableCount === 1 ? "" : "s"} available`,
      description: "The local command board has fresh Hunts, Boss and Contract objectives. Review them before choosing today's campaign focus.",
      actionLabel: "Review Daily Orders",
    };
  }
  return {
    tone: "complete",
    title: "Daily regional cycle complete",
    description: dailyOrderCount > 0
      ? `${completedCount}/${dailyOrderCount} regional dispatches are recorded for this local day.`
      : "No regional dispatches are available for this local day.",
    actionLabel: "Open Campaign Record",
  };
}

function objectiveLabel(objective: GuildRegionalOrderObjective) {
  if (objective === "hunt_minutes") return "Hunt duty";
  if (objective === "boss_defeats") return "Boss response";
  return "Contract support";
}

function objectiveUnit(objective: GuildRegionalOrderObjective) {
  if (objective === "hunt_minutes") return "min";
  if (objective === "boss_defeats") return "Boss";
  return "Contract";
}
