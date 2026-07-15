import { createInventoryItem } from "../../data/inventoryFactory";
import { getGuildContract } from "../../data/guildContracts";
import { items } from "../../data/items";
import { mergeStackableItems } from "../inventory/mergeStackableItems";
import { calculateCapacityUsed } from "../inventory/calculateCapacityUsed";
import type { Guild, GuildDepot } from "../../shared/types";
import { normalizeGuildExpeditionState } from "./normalizeGuildExpeditionState";
import { getGuildSpecialistBonuses } from "../staff/getGuildStaffBonuses";

export function finishGuildExpedition(guild: Guild, depot: GuildDepot, now = new Date()) {
  const safeDepot = { ...depot, items: Array.isArray(depot?.items) ? depot.items : [] };
  const expeditions = normalizeGuildExpeditionState(guild.expeditions);
  const active = expeditions.activeExpedition;
  if (!active) return blocked(guild, safeDepot, "There is no active guild expedition.");
  const contract = getGuildContract(active.contractId);
  if (!contract) return blocked(guild, safeDepot, "The active guild contract is invalid.");
  const resolvedAt = new Date(now);
  if (!Number.isFinite(resolvedAt.getTime())) return blocked(guild, safeDepot, "Invalid expedition completion time.");
  if (resolvedAt.getTime() < Date.parse(active.endsAt)) return blocked(guild, safeDepot, `${contract.name} is still in progress.`);

  const succeeded = active.outcomeRoll < active.successChance / 100;
  const staffBonuses = getGuildSpecialistBonuses(active.specialistId);
  const rewardGold = Math.floor(contract.rewardGold * (1 + staffBonuses.expeditionGoldPercent / 100));
  const rewardRenown = contract.rewardRenown + staffBonuses.expeditionRenown;
  const rewardItem = contract.rewardItemId ? items[contract.rewardItemId] : undefined;
  const itemQuantity = succeeded && rewardItem ? Math.max(1, contract.rewardItemQuantity ?? 1) : 0;
  const rewardedItems = itemQuantity > 0
    ? mergeStackableItems([...safeDepot.items, createInventoryItem(rewardItem!.id, itemQuantity, "guildDepot")])
    : safeDepot.items;
  const rewardedDepot = { ...safeDepot, items: rewardedItems, capacityUsed: calculateCapacityUsed(rewardedItems) };
  const historyEntry = {
    id: `history-${active.id}`,
    contractId: contract.id,
    completedAt: resolvedAt.toISOString(),
    assignedCharacterIds: active.assignedCharacterIds,
    success: succeeded,
    goldGained: succeeded ? rewardGold : 0,
    renownGained: succeeded ? rewardRenown : 0,
    itemId: itemQuantity > 0 ? rewardItem?.id : undefined,
    itemQuantity: itemQuantity || undefined,
    specialistId: active.specialistId,
  };
  const updatedExpeditions = {
    activeExpedition: undefined,
    history: [historyEntry, ...expeditions.history].slice(0, 12),
    totalCompleted: expeditions.totalCompleted + 1,
    totalSucceeded: expeditions.totalSucceeded + (succeeded ? 1 : 0),
  };
  const currentGold = Number.isFinite(guild.gold) ? Math.max(0, Math.floor(guild.gold)) : 0;
  const currentRenown = Number.isFinite(guild.renown) ? Math.max(0, Math.floor(guild.renown)) : 0;

  return {
    success: true,
    succeeded,
    guild: {
      ...guild,
      gold: currentGold + historyEntry.goldGained,
      renown: currentRenown + historyEntry.renownGained,
      expeditions: updatedExpeditions,
    },
    depot: rewardedDepot,
    historyEntry,
    message: succeeded
      ? `${contract.name} completed: +${rewardGold.toLocaleString("en-US")}g, +${rewardRenown} renown${rewardItem ? `, ${rewardItem.name} x${itemQuantity}` : ""}${staffBonuses.specialist ? ` with ${staffBonuses.specialist.name} on duty` : ""}.`
      : `${contract.name} returned without rewards. The dispatch cost was not recovered.`,
  };
}

export function getGuildExpeditionRemainingMs(guild: Guild, now = new Date()) {
  const active = normalizeGuildExpeditionState(guild.expeditions).activeExpedition;
  return active ? Math.max(0, Date.parse(active.endsAt) - now.getTime()) : 0;
}

function blocked(guild: Guild, depot: GuildDepot, message: string) {
  return { success: false, succeeded: false, guild, depot, historyEntry: undefined, message };
}
