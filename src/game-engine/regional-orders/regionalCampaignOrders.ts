import { guildCampaignRegions } from "../../data/guildCampaignRegions";
import { createInventoryItem } from "../../data/inventoryFactory";
import { getItemById } from "../../data/items";
import {
  getRegionalCampaignDifficultyValues,
  getRegionalCampaignOrderPresentation,
  getRegionalCampaignRewardTierById,
  regionalCampaignDifficultyBands,
  regionalCampaignOrderClaimLedgerLimit,
  regionalCampaignOrderObjectives,
} from "../../data/regionalCampaignOrders";
import type {
  Guild,
  GuildDepot,
  GuildRegionalOrderDifficulty,
  GuildRegionalOrderObjective,
  GuildRegionalOrderClaim,
  GuildRegionalOrderRewardItem,
  GuildRegionalOrderRewardTier,
  GuildRegionalOrdersState,
  GuildRegionMasteryProgress,
  InventoryItem,
} from "../../shared/types";
import { calculateCapacityUsed } from "../inventory/calculateCapacityUsed";
import { mergeStackableItems } from "../inventory/mergeStackableItems";
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
  assignmentLabel: string;
  intensityLabel: string;
  difficulty: GuildRegionalOrderDifficulty;
  difficultyLabel: string;
  difficultyCommandLabel: string;
  rewardTier: GuildRegionalOrderRewardTier;
  rewardTierLabel: string;
  rewardTierShortLabel: string;
  rewardTierDescription: string;
  rewardItem?: GuildRegionalOrderRewardItem;
  rewardItemLabel?: string;
  destination: "hunts" | "bosses" | "contracts";
}

export interface RegionalCampaignOrderStatus extends RegionalCampaignOrderOffer {
  state: "available" | "active" | "ready" | "claimed" | "unavailable";
  progress: number;
  progressPercent: number;
}

export interface RegionalCampaignOrderDifficultyOption {
  id: GuildRegionalOrderDifficulty;
  label: string;
  description: string;
  requiredGuildLevel: number;
  unlocked: boolean;
  target: number;
  rewardGold: number;
  rewardTier: GuildRegionalOrderRewardTier;
  rewardTierLabel: string;
  rewardTierShortLabel: string;
  rewardTierDescription: string;
  rewardItem?: GuildRegionalOrderRewardItem;
  rewardItemLabel?: string;
}

interface RegionalOrderResult {
  success: boolean;
  guild: Guild;
  message: string;
  order?: RegionalCampaignOrderStatus;
  guildDepot?: GuildDepot;
  rewardItem?: GuildRegionalOrderRewardItem & { label: string };
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
    ? buildOffer(active.regionId, active.cycleKey, active.objective, orderVariant(active.id), active.difficulty ?? "standard")
    : undefined;
  const visible = activeOffer && !offers.some((offer) => offer.id === activeOffer.id)
    ? [activeOffer, ...offers]
    : offers.map((offer) => {
      if (activeOffer?.id === offer.id) return activeOffer;
      const claim = state.claimHistory.find((entry) => entry.orderId === offer.id);
      return claim
        ? applyClaimRewardSnapshot(buildOffer(offer.regionId, offer.cycleKey, offer.objective, orderVariant(offer.id), claim.difficulty ?? "standard"), claim)
        : offer;
    });
  return visible.map((offer) => buildStatus(offer, state, outcomes.regionMastery ?? []));
}

export function buildRegionalCampaignDifficultyOptions(
  guild: Pick<Guild, "level">,
  order: Pick<RegionalCampaignOrderOffer, "objective" | "id">,
): RegionalCampaignOrderDifficultyOption[] {
  const variant = orderVariant(order.id);
  if (variant < 0) return [];
  return regionalCampaignDifficultyBands.map((band) => {
    const values = getRegionalCampaignDifficultyValues(order.objective, variant, band.id);
    return {
      id: band.id,
      label: band.label,
      description: band.description,
      requiredGuildLevel: band.requiredGuildLevel,
      unlocked: safeInteger(guild.level) >= band.requiredGuildLevel,
      target: values.target,
      rewardGold: values.rewardGold,
      rewardTier: values.rewardTier.id,
      rewardTierLabel: values.rewardTier.label,
      rewardTierShortLabel: values.rewardTier.shortLabel,
      rewardTierDescription: values.rewardTier.description,
      rewardItem: values.rewardTier.bonusItem ? { ...values.rewardTier.bonusItem } : undefined,
      rewardItemLabel: rewardItemLabel(values.rewardTier.bonusItem),
    };
  });
}

export function acceptRegionalCampaignOrder(
  guild: Guild,
  orderId: string,
  difficultyOrNow: GuildRegionalOrderDifficulty | Date = "standard",
  acceptedAt = new Date(),
): RegionalOrderResult {
  const difficulty = difficultyOrNow instanceof Date ? "standard" : difficultyOrNow;
  const now = difficultyOrNow instanceof Date ? difficultyOrNow : acceptedAt;
  const outcomes = normalizeGuildOperationOutcomes(guild.operationOutcomes);
  const state = outcomes.regionalOrders ?? { claimedOrderIds: [], claimHistory: [] };
  if (state.activeOrder) return result(false, guild, "Finish or abandon the active regional order first.");
  const baseOffer = buildRegionalCampaignOffers(guild.id, now).find((entry) => entry.id === orderId);
  if (!baseOffer) return result(false, guild, "This regional order is no longer available.");
  if (state.claimedOrderIds.includes(baseOffer.id)) return result(false, guild, "This regional order was already completed.");
  const option = buildRegionalCampaignDifficultyOptions(guild, baseOffer).find((entry) => entry.id === difficulty);
  if (!option) return result(false, guild, "This regional difficulty is invalid.");
  if (!option.unlocked) return result(false, guild, `${option.label} orders require guild level ${option.requiredGuildLevel}.`);
  const offer = buildOffer(baseOffer.regionId, baseOffer.cycleKey, baseOffer.objective, orderVariant(baseOffer.id), option.id);
  const baseline = getObjectiveValue(outcomes.regionMastery ?? [], offer.regionId, offer.objective);
  const regionalOrders: GuildRegionalOrdersState = {
    ...state,
    activeOrder: {
      id: offer.id,
      cycleKey: offer.cycleKey,
      regionId: offer.regionId,
      objective: offer.objective,
      difficulty: offer.difficulty,
      target: offer.target,
      baseline,
      rewardGold: offer.rewardGold,
      rewardTier: offer.rewardTier,
      rewardItem: offer.rewardItem ? { ...offer.rewardItem } : undefined,
      acceptedAt: safeDate(now).toISOString(),
    },
  };
  const updated = { ...guild, operationOutcomes: { ...outcomes, regionalOrders } };
  return result(true, updated, `${offer.difficultyLabel} ${offer.title} accepted. Progress starts now.`, buildStatus(offer, regionalOrders, outcomes.regionMastery ?? []));
}

export function claimRegionalCampaignOrder(
  guild: Guild,
  guildDepotOrNow?: GuildDepot | Date,
  claimTime = new Date(),
): RegionalOrderResult {
  const now = guildDepotOrNow instanceof Date ? guildDepotOrNow : claimTime;
  const depotInput = guildDepotOrNow instanceof Date ? undefined : guildDepotOrNow;
  const outcomes = normalizeGuildOperationOutcomes(guild.operationOutcomes);
  const state = outcomes.regionalOrders ?? { claimedOrderIds: [], claimHistory: [] };
  const active = state.activeOrder;
  if (!active) return result(false, guild, "There is no active regional order to claim.");
  const offer = buildOffer(active.regionId, active.cycleKey, active.objective, orderVariant(active.id), active.difficulty ?? "standard");
  if (!sameOrderSnapshot(active, offer)) return result(false, guild, "The active regional order data is invalid.");
  const status = buildStatus(offer, state, outcomes.regionMastery ?? []);
  if (status.progress < offer.target) return result(false, guild, `${offer.title} is still in progress.`, status);
  if (state.claimedOrderIds.includes(active.id)) return result(false, guild, "This regional order was already claimed.");
  const guildDepot = normalizeGuildDepot(depotInput);
  if (!guildDepot) return result(false, guild, "Guild Depot data is invalid. Reload the save before claiming this reward.", status);
  if (!canApplyRewardItem(guildDepot, active.rewardItem)) {
    return result(false, guild, "The Guild Depot cannot safely receive this reward cache.", status);
  }
  const claimedAt = safeDate(now).toISOString();
  const regionalOrders: GuildRegionalOrdersState = {
    claimedOrderIds: [...state.claimedOrderIds.filter((id) => id !== active.id), active.id].slice(-regionalCampaignOrderClaimLedgerLimit),
    claimHistory: [{
      orderId: active.id,
      regionId: active.regionId,
      objective: active.objective,
      difficulty: active.difficulty ?? "standard",
      rewardGold: active.rewardGold,
      rewardTier: active.rewardTier ?? offer.rewardTier,
      rewardItem: active.rewardItem ? { ...active.rewardItem } : undefined,
      claimedAt,
    }, ...state.claimHistory.filter((entry) => entry.orderId !== active.id)].slice(0, 20),
  };
  const gold = safeInteger(guild.gold);
  const rewardedDepot = applyRewardItem(guildDepot, active.rewardItem);
  const receivedItem = active.rewardItem && rewardedDepot !== guildDepot
    ? { ...active.rewardItem, label: rewardItemLabel(active.rewardItem) ?? active.rewardItem.itemId }
    : undefined;
  const updated = {
    ...guild,
    gold: Math.min(Number.MAX_SAFE_INTEGER, gold + active.rewardGold),
    operationOutcomes: { ...outcomes, regionalOrders },
  };
  const itemMessage = receivedItem ? ` ${receivedItem.label} x${receivedItem.quantity} sent to the Guild Depot.` : "";
  return {
    ...result(true, updated, `${offer.title} completed. ${active.rewardGold.toLocaleString("en-US")} gold added to the guild treasury.${itemMessage}`, { ...status, state: "claimed" }),
    guildDepot: rewardedDepot,
    rewardItem: receivedItem,
  };
}

export function abandonRegionalCampaignOrder(guild: Guild): RegionalOrderResult {
  const outcomes = normalizeGuildOperationOutcomes(guild.operationOutcomes);
  const state = outcomes.regionalOrders ?? { claimedOrderIds: [], claimHistory: [] };
  if (!state.activeOrder) return result(false, guild, "There is no active regional order to abandon.");
  const regionalOrders = { ...state, activeOrder: undefined };
  return result(true, { ...guild, operationOutcomes: { ...outcomes, regionalOrders } }, "Regional order abandoned. No reward was granted.");
}

function buildOffer(
  regionId: string,
  cycleKey: string,
  objective: GuildRegionalOrderObjective,
  variant: number,
  difficulty: GuildRegionalOrderDifficulty = "standard",
) {
  const region = guildCampaignRegions.find((entry) => entry.id === regionId) ?? guildCampaignRegions[0];
  const safeVariant = Math.max(0, Math.min(2, Math.floor(variant)));
  const values = getRegionalCampaignDifficultyValues(objective, safeVariant, difficulty);
  const regionIndex = Math.max(0, guildCampaignRegions.findIndex((entry) => entry.id === region.id));
  const presentationIndex = (stableHash(`${cycleKey}:${objective}:presentation`) + regionIndex) % 3;
  const presentation = getRegionalCampaignOrderPresentation(objective, presentationIndex);
  const destination = objective === "hunt_minutes" ? "hunts" as const : objective === "boss_defeats" ? "bosses" as const : "contracts" as const;
  return {
    id: `regional-order:${cycleKey}:${region.id}:${objective}:${safeVariant}`,
    cycleKey,
    regionId: region.id,
    regionName: region.name,
    regionSigil: region.sigil,
    objective,
    title: presentation.title,
    description: presentation.description,
    target: values.target,
    rewardGold: values.rewardGold,
    assignmentLabel: presentation.assignmentLabel,
    intensityLabel: values.intensityLabel,
    difficulty: values.difficultyBand.id,
    difficultyLabel: values.difficultyBand.label,
    difficultyCommandLabel: values.difficultyBand.commandLabel,
    rewardTier: values.rewardTier.id,
    rewardTierLabel: values.rewardTier.label,
    rewardTierShortLabel: values.rewardTier.shortLabel,
    rewardTierDescription: values.rewardTier.description,
    rewardItem: values.rewardTier.bonusItem ? { ...values.rewardTier.bonusItem } : undefined,
    rewardItemLabel: rewardItemLabel(values.rewardTier.bonusItem),
    destination,
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

function applyClaimRewardSnapshot(offer: RegionalCampaignOrderOffer, claim: GuildRegionalOrderClaim) {
  const tier = getRegionalCampaignRewardTierById(claim.rewardTier);
  return {
    ...offer,
    rewardTier: tier.id,
    rewardTierLabel: tier.label,
    rewardTierShortLabel: tier.shortLabel,
    rewardTierDescription: tier.description,
    rewardItem: claim.rewardItem ? { ...claim.rewardItem } : undefined,
    rewardItemLabel: rewardItemLabel(claim.rewardItem),
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
  return active.id === offer.id
    && active.target === offer.target
    && active.rewardGold === offer.rewardGold
    && (active.rewardTier ?? "field") === offer.rewardTier
    && sameRewardItem(active.rewardItem, offer.rewardItem);
}

function sameRewardItem(left: GuildRegionalOrderRewardItem | undefined, right: GuildRegionalOrderRewardItem | undefined) {
  return left === undefined && right === undefined
    || Boolean(left && right && left.itemId === right.itemId && left.quantity === right.quantity);
}

function rewardItemLabel(rewardItem: GuildRegionalOrderRewardItem | undefined) {
  if (!rewardItem) return undefined;
  try {
    return getItemById(rewardItem.itemId).name;
  } catch {
    return undefined;
  }
}

function normalizeGuildDepot(value: GuildDepot | undefined): GuildDepot | undefined {
  if (value === undefined) return { goldStored: 0, items: [], capacityUsed: 0 };
  if (!value || !Array.isArray(value.items)) return undefined;
  const ids = new Set<string>();
  const stackTotals = new Map<string, number>();
  const items: InventoryItem[] = [];
  for (const entry of value.items) {
    if (!entry || typeof entry !== "object" || typeof entry.id !== "string" || !entry.id || ids.has(entry.id)) return undefined;
    if (typeof entry.itemId !== "string" || entry.location !== "guildDepot" || entry.ownerCharacterId !== undefined) return undefined;
    if (entry.parentContainerId != null && (typeof entry.parentContainerId !== "string" || !entry.parentContainerId)) return undefined;
    if (!Number.isSafeInteger(entry.quantity) || entry.quantity < 1) return undefined;
    let catalogItem: ReturnType<typeof getItemById>;
    try {
      catalogItem = getItemById(entry.itemId);
    } catch {
      return undefined;
    }
    if (!catalogItem.stackable && entry.quantity !== 1) return undefined;
    ids.add(entry.id);
    const normalized = { ...entry, item: catalogItem };
    if (catalogItem.stackable) {
      const key = stackKey(normalized);
      const current = stackTotals.get(key) ?? 0;
      if (current > Number.MAX_SAFE_INTEGER - entry.quantity) return undefined;
      stackTotals.set(key, current + entry.quantity);
    }
    items.push(normalized);
  }
  const capacityUsed = calculateCapacityUsed(items);
  return Number.isFinite(capacityUsed)
    ? { goldStored: safeInteger(value.goldStored), items, capacityUsed }
    : undefined;
}

function canApplyRewardItem(depot: GuildDepot, rewardItem: GuildRegionalOrderRewardItem | undefined) {
  if (!rewardItem) return true;
  if (!rewardItemLabel(rewardItem) || !Number.isSafeInteger(rewardItem.quantity) || rewardItem.quantity < 1) return false;
  const current = depot.items
    .filter((entry) => stackKey(entry) === rewardStackKey(rewardItem.itemId))
    .reduce((total, entry) => total + entry.quantity, 0);
  return Number.isSafeInteger(current) && current <= Number.MAX_SAFE_INTEGER - rewardItem.quantity;
}

function applyRewardItem(depot: GuildDepot, rewardItem: GuildRegionalOrderRewardItem | undefined) {
  if (!rewardItem || !rewardItemLabel(rewardItem)) return depot;
  const items = mergeStackableItems([
    ...depot.items,
    createInventoryItem(rewardItem.itemId, rewardItem.quantity, "guildDepot"),
  ]);
  return { ...depot, items, capacityUsed: calculateCapacityUsed(items) };
}

function stackKey(entry: InventoryItem) {
  return [
    entry.location,
    entry.ownerCharacterId ?? "depot",
    entry.parentContainerId ?? "root",
    entry.itemId,
    entry.locked ? "locked" : "unlocked",
  ].join("-");
}

function rewardStackKey(itemId: string) {
  return ["guildDepot", "depot", "root", itemId, "unlocked"].join("-");
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
