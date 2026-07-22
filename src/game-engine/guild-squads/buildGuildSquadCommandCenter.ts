import { bosses } from "../../data/bosses";
import { guildContracts } from "../../data/guildContracts";
import { calculateBossPower } from "../boss/calculateBossPower";
import { canStartBoss } from "../boss/canStartBoss";
import {
  calculateExpeditionSuccessChance,
  calculateExpeditionTeamPower,
  getGuildContractAvailability,
} from "../expeditions/getGuildContractAvailability";
import { normalizeGuildExpeditionState } from "../expeditions/normalizeGuildExpeditionState";
import { getGuildDirectiveBonuses } from "../guild-directives/getGuildDirectiveStatus";
import { applyDispatchDiscount, getGuildStaffBonuses } from "../staff/getGuildStaffBonuses";
import type { Character, Guild, GuildSquadSlotId, PartyRole } from "../../shared/types";
import { createBossPartyFromGuildSquad } from "./createBossPartyFromGuildSquad";
import { createContractTeamFromGuildSquad } from "./createContractTeamFromGuildSquad";
import { getGuildSquadStatus } from "./getGuildSquadStatus";

export type GuildSquadReadiness = "locked" | "empty" | "ready" | "partial" | "assigned" | "unavailable";

const roleOrder: readonly PartyRole[] = ["tank", "healer", "damage", "support"];

export function buildGuildSquadCommandCenter(guild: Guild, characters: Character[], now = new Date()) {
  const status = getGuildSquadStatus(guild, characters);
  const staffBonuses = getGuildStaffBonuses(guild.staff);
  const directiveBonuses = getGuildDirectiveBonuses(guild);
  const hasActiveExpedition = Boolean(normalizeGuildExpeditionState(guild.expeditions).activeExpedition);
  const gold = normalizeGold(guild.gold);

  const slots = status.slots.map((slot) => {
    const members = (slot.squad?.members ?? []).map((member) => ({
      ...member,
      character: characters.find((character) => character.id === member.characterId),
    })).filter((entry): entry is typeof entry & { character: Character } => Boolean(entry.character));
    const aliveMembers = members.filter((entry) => entry.character.status !== "dead");
    const idleMembers = aliveMembers.filter((entry) => entry.character.status === "idle");
    const deadCount = members.length - aliveMembers.length;
    const busyCount = aliveMembers.length - idleMembers.length;
    const roleCounts = roleOrder.reduce<Record<PartyRole, number>>((counts, role) => {
      counts[role] = members.filter((member) => member.role === role).length;
      return counts;
    }, { tank: 0, healer: 0, damage: 0, support: 0 });
    const readiness = getReadiness(slot.unlocked, members.length, aliveMembers.length, idleMembers.length);
    const fieldPower = calculateExpeditionTeamPower(characters, aliveMembers.map((member) => member.characterId));

    const bossRoutes = slot.squad?.members.length ? bosses.map((boss) => {
      const partyResult = createBossPartyFromGuildSquad(guild, characters, boss, slot.definition.id);
      if (!partyResult.success) return { id: boss.id, name: boss.name, ready: false, reason: partyResult.message, power: 0, targetPower: 0, partySize: 0 };
      const validation = canStartBoss(characters, boss, partyResult.party, gold, now);
      const power = calculateBossPower(characters, partyResult.party, boss);
      return {
        id: boss.id,
        name: boss.name,
        ready: validation.canStart,
        reason: validation.canStart ? "Raid requirements met." : validation.reason ?? "Raid requirements pending.",
        power: normalizeMetric(power.totalPower),
        targetPower: normalizeMetric(power.targetPower),
        partySize: partyResult.party.members.length,
      };
    }) : [];

    const contractRoutes = slot.squad?.members.length ? guildContracts.map((contract) => {
      const teamResult = createContractTeamFromGuildSquad(guild, characters, contract.maximumTeamSize, slot.definition.id);
      const availability = getGuildContractAvailability(contract, guild, characters);
      const teamPower = calculateExpeditionTeamPower(characters, teamResult.characterIds);
      const chance = Math.min(95, calculateExpeditionSuccessChance(teamPower, contract.recommendedPower)
        + staffBonuses.successChancePoints + directiveBonuses.expeditionSuccessChancePoints);
      const cost = applyDispatchDiscount(contract.dispatchCost, staffBonuses.dispatchDiscountPercent);
      const teamReady = teamResult.characterIds.length >= contract.minimumTeamSize;
      const reason = hasActiveExpedition
        ? "Another support expedition is active."
        : !availability.available
          ? availability.reasons[0] ?? "Contract requirements pending."
          : !teamReady
            ? `Requires ${contract.minimumTeamSize} available support adventurer${contract.minimumTeamSize === 1 ? "" : "s"}.`
            : gold < cost
              ? `Requires ${cost.toLocaleString("en-US")}g.`
              : "Dispatch requirements met.";
      return {
        id: contract.id,
        name: contract.name,
        ready: !hasActiveExpedition && availability.available && teamReady && gold >= cost,
        reason,
        teamSize: teamResult.characterIds.length,
        power: teamPower,
        chance,
      };
    }) : [];

    return {
      id: slot.definition.id,
      name: slot.squad?.name ?? slot.definition.defaultName,
      sigil: slot.definition.sigil,
      unlocked: slot.unlocked,
      configured: members.length > 0,
      memberCount: members.length,
      aliveCount: aliveMembers.length,
      idleCount: idleMembers.length,
      busyCount,
      deadCount,
      readiness,
      readinessLabel: getReadinessLabel(readiness),
      fieldPower,
      roleCounts,
      warnings: getWarnings(members.length, busyCount, deadCount, roleCounts),
      bossRoutes,
      contractRoutes,
      recommendedBoss: bossRoutes.find((route) => route.ready) ?? bossRoutes[0],
      recommendedContract: contractRoutes.find((route) => route.ready) ?? contractRoutes[0],
      readyBossCount: bossRoutes.filter((route) => route.ready).length,
      readyContractCount: contractRoutes.filter((route) => route.ready).length,
    };
  });

  return {
    slots,
    configuredCount: slots.filter((slot) => slot.configured).length,
    readyCount: slots.filter((slot) => slot.readiness === "ready").length,
  };
}

export function getGuildSquadCommandSlot(
  guild: Guild,
  characters: Character[],
  slotId: GuildSquadSlotId,
  now = new Date(),
) {
  return buildGuildSquadCommandCenter(guild, characters, now).slots.find((slot) => slot.id === slotId);
}

export type GuildSquadCommandCenterState = ReturnType<typeof buildGuildSquadCommandCenter>;
export type GuildSquadCommandSlot = GuildSquadCommandCenterState["slots"][number];

function getReadiness(unlocked: boolean, members: number, alive: number, idle: number): GuildSquadReadiness {
  if (!unlocked) return "locked";
  if (members === 0) return "empty";
  if (alive === 0) return "unavailable";
  if (idle === alive && alive === members) return "ready";
  if (idle > 0) return "partial";
  return "assigned";
}

function getReadinessLabel(readiness: GuildSquadReadiness) {
  const labels: Record<GuildSquadReadiness, string> = {
    locked: "Locked",
    empty: "Awaiting formation",
    ready: "Formation ready",
    partial: "Partially available",
    assigned: "Support duty only",
    unavailable: "Unavailable",
  };
  return labels[readiness];
}

function getWarnings(memberCount: number, busyCount: number, deadCount: number, roleCounts: Record<PartyRole, number>) {
  if (memberCount === 0) return ["Add adventurers to calculate readiness and operation routes."];
  const warnings: string[] = [];
  if (deadCount > 0) warnings.push(`${deadCount} member${deadCount === 1 ? " is" : "s are"} awaiting recovery.`);
  if (busyCount > 0) warnings.push(`${busyCount} member${busyCount === 1 ? " is" : "s are"} busy and cannot start a boss.`);
  if (roleCounts.tank === 0) warnings.push("No tank role assigned.");
  if (roleCounts.healer === 0) warnings.push("No healer role assigned.");
  if (roleCounts.damage === 0) warnings.push("No damage role assigned.");
  return warnings.slice(0, 3);
}

function normalizeGold(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

function normalizeMetric(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
}
