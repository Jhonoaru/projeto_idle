import { guildCampaignRegions } from "../../data/guildCampaignRegions";
import {
  getRegionalCampaignOrderVariant,
  regionalCampaignOrderClaimLedgerLimit,
  regionalCampaignOrderObjectives,
} from "../../data/regionalCampaignOrders";
import type {
  Guild,
  GuildRegionalOrderObjective,
  GuildRegionalOrdersState,
  GuildRegionMasteryProgress,
} from "../../shared/types";
import { normalizeGuildOperationOutcomes } from "../operations/normalizeGuildOperationOutcomes";

export interface RegionalCampaignOrderOffer {
  id: string;
  cycleKey: string;
  regionId: string;
  regionName: string;
  regionSigil: string;
  objective: GuildRegionalOrderObjective;
  title: string;
  description: string;
  target: number;
  rewardGold: number;
  destination: "hunts" | "bosses" | "contracts";
}

export interface RegionalCampaignOrderStatus extends RegionalCampaignOrderOffer {
  state: "available" | "active" | "ready" | "claimed" | "unavailable";
  progress: number;
  progressPercent: number;
}

interface RegionalOrderResult {
  success: boolean;
  guild: Guild;
  message: string;
  order?: RegionalCampaignOrderStatus;
}

export function getLocalCampaignCycleKey(now = new Date()) {
  const valid = Number.isFinite(now.getTime()) ? now : new Date();
  return [valid.getFullYear(), String(valid.getMonth() + 1).padStart(2, "0"), String(valid.getDate()).padStart(2, "0")].join("-");
}

export function buildRegionalCampaignOffers(guildId: string, now = new Date()): RegionalCampaignOrderOffer[] {
  const cycleKey = getLocalCampaignCycleKey(now);
  return guildCampaignRegions.map((region, index) => {
    const seed = stableHash(`${guildId}:${cycleKey}:${region.id}`);
    const objective = regionalCampaignOrderObjectives[(seed + index) % regionalCampaignOrderObjectives.length];
    const variant = seed % 3;
    return buildOffer(region.id, cycleKey, objective, variant);
  });
}

export function buildRegionalCampaignOrderStatuses(guild: Guild, now = new Date()): RegionalCampaignOrderStatus[] {
  const outcomes = normalizeGuildOperationOutcomes(guild.operationOutcomes);
  const state = outcomes.regionalOrders ?? { claimedOrderIds: [], claimHistory: [] };
  const offers = buildRegionalCampaignOffers(guild.id, now);
  const active = state.activeOrder;
  const activeOffer = active
    ? buildOffer(active.regionId, active.cycleKey, active.objective, orderVariant(active.id))
    : undefined;
  const visible = activeOffer && !offers.some((offer) => offer.id === activeOffer.id) ? [activeOffer, ...offers] : offers;
  return visible.map((offer) => buildStatus(offer, state, outcomes.regionMastery ?? []));
}

export function acceptRegionalCampaignOrder(guild: Guild, orderId: string, now = new Date()): RegionalOrderResult {
  const outcomes = normalizeGuildOperationOutcomes(guild.operationOutcomes);
  const state = outcomes.regionalOrders ?? { claimedOrderIds: [], claimHistory: [] };
  if (state.activeOrder) return result(false, guild, "Finish or abandon the active regional order first.");
  const offer = buildRegionalCampaignOffers(guild.id, now).find((entry) => entry.id === orderId);
  if (!offer) return result(false, guild, "This regional order is no longer available.");
  if (state.claimedOrderIds.includes(offer.id)) return result(false, guild, "This regional order was already completed.");
  const baseline = getObjectiveValue(outcomes.regionMastery ?? [], offer.regionId, offer.objective);
  const regionalOrders: GuildRegionalOrdersState = {
    ...state,
    activeOrder: {
      id: offer.id,
      cycleKey: offer.cycleKey,
      regionId: offer.regionId,
      objective: offer.objective,
      target: offer.target,
      baseline,
      rewardGold: offer.rewardGold,
      acceptedAt: safeDate(now).toISOString(),
    },
  };
  const updated = { ...guild, operationOutcomes: { ...outcomes, regionalOrders } };
  return result(true, updated, `${offer.title} accepted. Progress starts now.`, buildStatus(offer, regionalOrders, outcomes.regionMastery ?? []));
}

export function claimRegionalCampaignOrder(guild: Guild, now = new Date()): RegionalOrderResult {
  const outcomes = normalizeGuildOperationOutcomes(guild.operationOutcomes);
  const state = outcomes.regionalOrders ?? { claimedOrderIds: [], claimHistory: [] };
  const active = state.activeOrder;
  if (!active) return result(false, guild, "There is no active regional order to claim.");
  const offer = buildOffer(active.regionId, active.cycleKey, active.objective, orderVariant(active.id));
  if (!sameOrderSnapshot(active, offer)) return result(false, guild, "The active regional order data is invalid.");
  const status = buildStatus(offer, state, outcomes.regionMastery ?? []);
  if (status.progress < offer.target) return result(false, guild, `${offer.title} is still in progress.`, status);
  if (state.claimedOrderIds.includes(active.id)) return result(false, guild, "This regional order was already claimed.");
  const claimedAt = safeDate(now).toISOString();
  const regionalOrders: GuildRegionalOrdersState = {
    claimedOrderIds: [...state.claimedOrderIds.filter((id) => id !== active.id), active.id].slice(-regionalCampaignOrderClaimLedgerLimit),
    claimHistory: [{
      orderId: active.id,
      regionId: active.regionId,
      objective: active.objective,
      rewardGold: active.rewardGold,
      claimedAt,
    }, ...state.claimHistory.filter((entry) => entry.orderId !== active.id)].slice(0, 20),
  };
  const gold = safeInteger(guild.gold);
  const updated = {
    ...guild,
    gold: Math.min(Number.MAX_SAFE_INTEGER, gold + active.rewardGold),
    operationOutcomes: { ...outcomes, regionalOrders },
  };
  return result(true, updated, `${offer.title} completed. ${active.rewardGold.toLocaleString("en-US")} gold added to the guild treasury.`, { ...status, state: "claimed" });
}

export function abandonRegionalCampaignOrder(guild: Guild): RegionalOrderResult {
  const outcomes = normalizeGuildOperationOutcomes(guild.operationOutcomes);
  const state = outcomes.regionalOrders ?? { claimedOrderIds: [], claimHistory: [] };
  if (!state.activeOrder) return result(false, guild, "There is no active regional order to abandon.");
  const regionalOrders = { ...state, activeOrder: undefined };
  return result(true, { ...guild, operationOutcomes: { ...outcomes, regionalOrders } }, "Regional order abandoned. No reward was granted.");
}

function buildOffer(regionId: string, cycleKey: string, objective: GuildRegionalOrderObjective, variant: number) {
  const region = guildCampaignRegions.find((entry) => entry.id === regionId) ?? guildCampaignRegions[0];
  const safeVariant = Math.max(0, Math.min(2, Math.floor(variant)));
  const values = getRegionalCampaignOrderVariant(objective, safeVariant);
  const config = objective === "hunt_minutes"
    ? { title: "Hold the Hunting Line", description: "Complete successful Hunt time in this region after accepting the order.", destination: "hunts" as const }
    : objective === "boss_defeats"
      ? { title: "Break the Regional Threat", description: "Defeat a Boss tied to this region after accepting the order.", destination: "bosses" as const }
      : { title: "Secure the Support Route", description: "Complete a successful Contract tied to this region after accepting the order.", destination: "contracts" as const };
  return {
    id: `regional-order:${cycleKey}:${region.id}:${objective}:${safeVariant}`,
    cycleKey,
    regionId: region.id,
    regionName: region.name,
    regionSigil: region.sigil,
    objective,
    title: config.title,
    description: config.description,
    target: values.target,
    rewardGold: values.rewardGold,
    destination: config.destination,
  };
}

function buildStatus(offer: RegionalCampaignOrderOffer, state: GuildRegionalOrdersState, progress: GuildRegionMasteryProgress[]): RegionalCampaignOrderStatus {
  const active = state.activeOrder?.id === offer.id ? state.activeOrder : undefined;
  const value = active ? Math.max(0, getObjectiveValue(progress, offer.regionId, offer.objective) - active.baseline) : 0;
  const current = Math.min(offer.target, value);
  const claimed = state.claimedOrderIds.includes(offer.id);
  return {
    ...offer,
    state: claimed ? "claimed" : active ? current >= offer.target ? "ready" : "active" : state.activeOrder ? "unavailable" : "available",
    progress: claimed ? offer.target : current,
    progressPercent: claimed ? 100 : Math.min(100, Math.round((current / offer.target) * 100)),
  };
}

function getObjectiveValue(progress: GuildRegionMasteryProgress[], regionId: string, objective: GuildRegionalOrderObjective) {
  const region = progress.find((entry) => entry.regionId === regionId);
  if (!region) return 0;
  if (objective === "hunt_minutes") return safeInteger(region.successfulHuntMinutes);
  if (objective === "boss_defeats") return safeInteger(region.bossDefeats);
  return safeInteger(region.contractsSucceeded);
}

function orderVariant(orderId: string) {
  const parsed = Number(orderId.split(":").at(-1));
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 2 ? parsed : -1;
}

function sameOrderSnapshot(active: NonNullable<GuildRegionalOrdersState["activeOrder"]>, offer: RegionalCampaignOrderOffer) {
  return active.id === offer.id && active.target === offer.target && active.rewardGold === offer.rewardGold;
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function safeDate(value: Date) {
  return Number.isFinite(value.getTime()) ? value : new Date();
}

function safeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(parsed))) : 0;
}

function result(success: boolean, guild: Guild, message: string, order?: RegionalCampaignOrderStatus): RegionalOrderResult {
  return { success, guild, message, order };
}
