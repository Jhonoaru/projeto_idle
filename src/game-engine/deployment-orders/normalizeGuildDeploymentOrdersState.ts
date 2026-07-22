import { bosses } from "../../data/bosses";
import { guildContracts } from "../../data/guildContracts";
import { getGuildDeploymentOrderSlot } from "../../data/guildDeploymentOrders";
import { getGuildSquadSlot } from "../../data/guildSquads";
import type { GuildDeploymentOrder, GuildDeploymentOrdersState } from "../../shared/types";

export function normalizeGuildDeploymentOrdersState(value: unknown): GuildDeploymentOrdersState {
  if (!value || typeof value !== "object") return { orders: [] };
  const candidate = value as Partial<GuildDeploymentOrdersState>;
  const seen = new Set<string>();
  const orders = (Array.isArray(candidate.orders) ? candidate.orders : [])
    .map(normalizeOrder)
    .filter((order): order is GuildDeploymentOrder => Boolean(order))
    .filter((order) => {
      if (seen.has(order.id)) return false;
      seen.add(order.id);
      return true;
    })
    .slice(0, 3);
  return { orders };
}

function normalizeOrder(value: unknown): GuildDeploymentOrder | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<GuildDeploymentOrder>;
  const slot = getGuildDeploymentOrderSlot(candidate.id);
  const squad = getGuildSquadSlot(candidate.squadSlotId);
  const kind = candidate.kind === "boss" || candidate.kind === "contract" ? candidate.kind : undefined;
  const targetExists = kind === "boss"
    ? bosses.some((boss) => boss.id === candidate.targetId)
    : kind === "contract" && guildContracts.some((contract) => contract.id === candidate.targetId);
  if (!slot || !squad || !kind || !targetExists) return undefined;
  const updatedAt = typeof candidate.updatedAt === "string" && Number.isFinite(Date.parse(candidate.updatedAt))
    ? candidate.updatedAt
    : new Date(0).toISOString();
  return { id: slot.id, kind, targetId: candidate.targetId as string, squadSlotId: squad.id, updatedAt };
}
