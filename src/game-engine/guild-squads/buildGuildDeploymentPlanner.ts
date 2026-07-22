import { bosses } from "../../data/bosses";
import { guildContracts } from "../../data/guildContracts";
import type { Character, Guild, GuildSquadSlotId, PartyRole } from "../../shared/types";
import { buildGuildSquadCommandCenter, type GuildSquadCommandSlot } from "./buildGuildSquadCommandCenter";

export type GuildDeploymentKind = "boss" | "contract";

export interface GuildDeploymentCandidate {
  slotId: GuildSquadSlotId;
  slotName: string;
  sigil: string;
  unlocked: boolean;
  configured: boolean;
  ready: boolean;
  readinessLabel: string;
  reason: string;
  memberCount: number;
  availableCount: number;
  power: number;
  targetPower?: number;
  chance?: number;
  roleCounts: Record<PartyRole, number>;
}

export interface GuildDeploymentTarget {
  id: string;
  kind: GuildDeploymentKind;
  name: string;
  region: string;
  detail: string;
  cost: number;
  candidates: GuildDeploymentCandidate[];
  recommendedSlotId?: GuildSquadSlotId;
  readySquadCount: number;
}

export function buildGuildDeploymentPlanner(guild: Guild, characters: Character[], now = new Date()) {
  const commandCenter = buildGuildSquadCommandCenter(guild, characters, now);
  const bossTargets = bosses.map<GuildDeploymentTarget>((boss) => {
    const candidates = rankCandidates(commandCenter.slots.map((slot) => createBossCandidate(slot, boss.id)));
    return {
      id: boss.id,
      kind: "boss",
      name: boss.name,
      region: boss.city,
      detail: `${boss.type === "party" ? "Party raid" : "Solo raid"} / Lv ${boss.requirements.requiredLevel}+ / ${boss.requirements.minPartySize}-${boss.requirements.maxPartySize} adventurer${boss.requirements.maxPartySize === 1 ? "" : "s"}`,
      cost: Math.max(0, Math.floor(boss.entryCost)),
      candidates,
      recommendedSlotId: candidates.find((candidate) => candidate.ready)?.slotId,
      readySquadCount: candidates.filter((candidate) => candidate.ready).length,
    };
  });
  const contractTargets = guildContracts.map<GuildDeploymentTarget>((contract) => {
    const candidates = rankCandidates(commandCenter.slots.map((slot) => createContractCandidate(slot, contract.id)));
    return {
      id: contract.id,
      kind: "contract",
      name: contract.name,
      region: contract.region,
      detail: `${contract.risk} risk / ${contract.minimumTeamSize}-${contract.maximumTeamSize} adventurers / ${contract.durationMinutes} min`,
      cost: Math.max(0, Math.floor(contract.dispatchCost)),
      candidates,
      recommendedSlotId: candidates.find((candidate) => candidate.ready)?.slotId,
      readySquadCount: candidates.filter((candidate) => candidate.ready).length,
    };
  });

  return {
    bossTargets,
    contractTargets,
    configuredSquadCount: commandCenter.configuredCount,
    readyBossTargets: bossTargets.filter((target) => target.readySquadCount > 0).length,
    readyContractTargets: contractTargets.filter((target) => target.readySquadCount > 0).length,
  };
}

export type GuildDeploymentPlannerState = ReturnType<typeof buildGuildDeploymentPlanner>;

function createBossCandidate(slot: GuildSquadCommandSlot, bossId: string): GuildDeploymentCandidate {
  const route = slot.bossRoutes.find((entry) => entry.id === bossId);
  return createCandidate(slot, route?.ready ?? false, route?.reason ?? getMissingRouteReason(slot), {
    power: route?.power ?? 0,
    targetPower: route?.targetPower ?? 0,
  });
}

function createContractCandidate(slot: GuildSquadCommandSlot, contractId: string): GuildDeploymentCandidate {
  const route = slot.contractRoutes.find((entry) => entry.id === contractId);
  return createCandidate(slot, route?.ready ?? false, route?.reason ?? getMissingRouteReason(slot), {
    power: route?.power ?? 0,
    chance: route?.chance ?? 0,
    memberCount: route?.teamSize ?? slot.memberCount,
  });
}

function createCandidate(
  slot: GuildSquadCommandSlot,
  ready: boolean,
  reason: string,
  metrics: { power: number; targetPower?: number; chance?: number; memberCount?: number },
): GuildDeploymentCandidate {
  return {
    slotId: slot.id,
    slotName: slot.name,
    sigil: slot.sigil,
    unlocked: slot.unlocked,
    configured: slot.configured,
    ready,
    readinessLabel: slot.readinessLabel,
    reason,
    memberCount: metrics.memberCount ?? slot.memberCount,
    availableCount: slot.idleCount,
    power: metrics.power,
    targetPower: metrics.targetPower,
    chance: metrics.chance,
    roleCounts: slot.roleCounts,
  };
}

function rankCandidates(candidates: GuildDeploymentCandidate[]) {
  return candidates.map((candidate, index) => ({ candidate, index })).sort((left, right) => {
    if (left.candidate.ready !== right.candidate.ready) return left.candidate.ready ? -1 : 1;
    if (left.candidate.configured !== right.candidate.configured) return left.candidate.configured ? -1 : 1;
    const leftMetric = left.candidate.chance ?? powerRatio(left.candidate);
    const rightMetric = right.candidate.chance ?? powerRatio(right.candidate);
    if (leftMetric !== rightMetric) return rightMetric - leftMetric;
    return left.index - right.index;
  }).map(({ candidate }) => candidate);
}

function powerRatio(candidate: GuildDeploymentCandidate) {
  return candidate.targetPower && candidate.targetPower > 0 ? candidate.power / candidate.targetPower : candidate.power;
}

function getMissingRouteReason(slot: GuildSquadCommandSlot) {
  if (!slot.unlocked) return "This formation slot is still locked.";
  return "Save at least one adventurer in this formation.";
}
