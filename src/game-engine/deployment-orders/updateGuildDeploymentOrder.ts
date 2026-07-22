import { getGuildDeploymentOrderSlot } from "../../data/guildDeploymentOrders";
import type { Character, Guild, GuildDeploymentOrderKind, GuildDeploymentOrderSlotId, GuildSquadSlotId } from "../../shared/types";
import { buildGuildDeploymentPlanner } from "../guild-squads/buildGuildDeploymentPlanner";
import { normalizeGuildDeploymentOrdersState } from "./normalizeGuildDeploymentOrdersState";

export function saveGuildDeploymentOrder(
  guild: Guild,
  characters: Character[],
  orderSlotId: GuildDeploymentOrderSlotId,
  kind: GuildDeploymentOrderKind,
  targetId: string,
  squadSlotId: GuildSquadSlotId,
  now = new Date(),
) {
  const slot = getGuildDeploymentOrderSlot(orderSlotId);
  const planner = buildGuildDeploymentPlanner(guild, characters, now);
  const target = (kind === "boss" ? planner.bossTargets : planner.contractTargets).find((entry) => entry.id === targetId);
  const candidate = target?.candidates.find((entry) => entry.slotId === squadSlotId);
  const current = normalizeGuildDeploymentOrdersState(guild.deploymentOrders);
  if (!slot || !target || !candidate || !candidate.unlocked || !candidate.configured) {
    return { success: false, guild: { ...guild, deploymentOrders: current }, message: "Choose a valid operation and a configured Guild Squad." };
  }
  const order = { id: slot.id, kind, targetId, squadSlotId, updatedAt: now.toISOString() } as const;
  const orders = [...current.orders.filter((entry) => entry.id !== slot.id), order]
    .sort((left, right) => left.id.localeCompare(right.id));
  return {
    success: true,
    guild: { ...guild, deploymentOrders: { orders } },
    message: `${slot.name} assigned to ${target.name} with ${candidate.slotName}.`,
  };
}

export function clearGuildDeploymentOrder(guild: Guild, orderSlotId: GuildDeploymentOrderSlotId) {
  const slot = getGuildDeploymentOrderSlot(orderSlotId);
  const current = normalizeGuildDeploymentOrdersState(guild.deploymentOrders);
  const orders = current.orders.filter((entry) => entry.id !== orderSlotId);
  if (!slot || orders.length === current.orders.length) {
    return { success: false, guild: { ...guild, deploymentOrders: current }, message: "This deployment order is already empty." };
  }
  return { success: true, guild: { ...guild, deploymentOrders: { orders } }, message: `${slot.name} cleared.` };
}
