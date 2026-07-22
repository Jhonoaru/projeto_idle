import { guildDeploymentOrderSlots } from "../../data/guildDeploymentOrders";
import type { Character, Guild } from "../../shared/types";
import { buildGuildDeploymentPlanner } from "../guild-squads/buildGuildDeploymentPlanner";
import { normalizeGuildDeploymentOrdersState } from "./normalizeGuildDeploymentOrdersState";

export function buildGuildDeploymentOrders(guild: Guild, characters: Character[], now = new Date()) {
  const state = normalizeGuildDeploymentOrdersState(guild.deploymentOrders);
  const planner = buildGuildDeploymentPlanner(guild, characters, now);
  const slots = guildDeploymentOrderSlots.map((definition) => {
    const order = state.orders.find((entry) => entry.id === definition.id);
    const target = order
      ? (order.kind === "boss" ? planner.bossTargets : planner.contractTargets).find((entry) => entry.id === order.targetId)
      : undefined;
    const candidate = order && target ? target.candidates.find((entry) => entry.slotId === order.squadSlotId) : undefined;
    return {
      definition,
      order,
      target,
      candidate,
      ready: Boolean(candidate?.ready),
      reason: candidate?.reason ?? "Assign an operation and formation from the planner.",
    };
  });
  return { slots, configuredCount: slots.filter((slot) => slot.order).length, readyCount: slots.filter((slot) => slot.ready).length };
}

export type GuildDeploymentOrdersView = ReturnType<typeof buildGuildDeploymentOrders>;
