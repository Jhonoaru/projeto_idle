import { bosses } from "../../data/bosses";
import { guildContracts } from "../../data/guildContracts";
import type { Character, Guild, GuildDepot, PartyRole } from "../../shared/types";
import { normalizeGuildDeploymentOrdersState } from "../deployment-orders/normalizeGuildDeploymentOrdersState";
import { getGuildSquadStatus } from "../guild-squads/getGuildSquadStatus";
import { buildGuildActiveLoadoutDashboard } from "./buildGuildActiveLoadoutDashboard";

export type GuildSquadGearStatus = "locked" | "empty" | "ready" | "partial" | "unplanned" | "invalid";
export type GuildSquadMemberGearStatus = "ready" | "incomplete" | "unplanned" | "invalid";

const roleLabels: Record<PartyRole, string> = {
  tank: "Tank",
  healer: "Healer",
  damage: "Damage",
  support: "Support",
};

export function buildGuildSquadGearReadiness(
  guild: Guild,
  characters: Character[],
  depot: GuildDepot,
) {
  const safeCharacters = uniqueCharacters(characters);
  const squads = getGuildSquadStatus(guild, safeCharacters);
  const dashboard = buildGuildActiveLoadoutDashboard(guild, safeCharacters, safeDepot(depot));
  const dashboardByCharacterId = new Map(
    dashboard.entries.map((entry) => [entry.character.id, entry]),
  );
  const deploymentOrders = normalizeGuildDeploymentOrdersState(guild.deploymentOrders).orders;

  const slots = squads.slots.map((slot) => {
    const members = (slot.squad?.members ?? []).flatMap((member) => {
      const character = safeCharacters.find((entry) => entry.id === member.characterId);
      if (!character) return [];
      const plan = dashboardByCharacterId.get(character.id);
      const status = getMemberStatus(plan?.status);
      return [{
        character,
        role: member.role,
        roleLabel: roleLabels[member.role],
        templateId: plan?.template?.id,
        templateName: plan?.template?.name,
        status,
        statusLabel: getMemberStatusLabel(status),
        assignedTargets: plan?.review.summary.assigned ?? 0,
        equippedTargets: plan?.review.summary.equipped ?? 0,
        completionPercent: plan?.completionPercent ?? 0,
        nextAction: plan?.nextAction ?? "Activate a saved template",
      }];
    });
    const linkedOrders = deploymentOrders
      .filter((order) => order.squadSlotId === slot.definition.id)
      .map((order) => ({
        id: order.id,
        kind: order.kind,
        targetId: order.targetId,
        targetName: getDeploymentTargetName(order.kind, order.targetId),
      }));
    const assignedTargets = members.reduce((total, member) => total + member.assignedTargets, 0);
    const equippedTargets = members.reduce((total, member) => total + member.equippedTargets, 0);
    const readyMembers = members.filter((member) => member.status === "ready").length;
    const plannedMembers = members.filter((member) => member.status !== "unplanned").length;
    const invalidMembers = members.filter((member) => member.status === "invalid").length;
    const unplannedMembers = members.filter((member) => member.status === "unplanned").length;
    const status = getSquadStatus(
      slot.unlocked,
      members.length,
      readyMembers,
      plannedMembers,
      invalidMembers,
    );
    return {
      id: slot.definition.id,
      name: slot.squad?.name ?? slot.definition.defaultName,
      sigil: slot.definition.sigil,
      minimumGuildLevel: slot.definition.minimumGuildLevel,
      unlocked: slot.unlocked,
      configured: members.length > 0,
      status,
      statusLabel: getSquadStatusLabel(status),
      members,
      linkedOrders,
      summary: {
        memberCount: members.length,
        plannedMembers,
        readyMembers,
        invalidMembers,
        unplannedMembers,
        assignedTargets,
        equippedTargets,
        completionPercent: assignedTargets > 0
          ? Math.round((equippedTargets / assignedTargets) * 100)
          : 0,
      },
      warnings: getWarnings(members.length, invalidMembers, unplannedMembers, readyMembers, linkedOrders.length),
    };
  });

  const configured = slots.filter((slot) => slot.configured);
  const totals = configured.reduce(
    (summary, slot) => ({
      members: summary.members + slot.summary.memberCount,
      plannedMembers: summary.plannedMembers + slot.summary.plannedMembers,
      readyMembers: summary.readyMembers + slot.summary.readyMembers,
      targets: summary.targets + slot.summary.assignedTargets,
      equipped: summary.equipped + slot.summary.equippedTargets,
    }),
    { members: 0, plannedMembers: 0, readyMembers: 0, targets: 0, equipped: 0 },
  );

  return {
    slots,
    summary: {
      unlockedSquads: slots.filter((slot) => slot.unlocked).length,
      configuredSquads: configured.length,
      readySquads: configured.filter((slot) => slot.status === "ready").length,
      ...totals,
      completionPercent: totals.targets > 0
        ? Math.round((totals.equipped / totals.targets) * 100)
        : 0,
    },
  };
}

export type GuildSquadGearReadiness = ReturnType<typeof buildGuildSquadGearReadiness>;
export type GuildSquadGearReadinessSlot = GuildSquadGearReadiness["slots"][number];

function getMemberStatus(
  status: ReturnType<typeof buildGuildActiveLoadoutDashboard>["entries"][number]["status"] | undefined,
): GuildSquadMemberGearStatus {
  if (!status || status === "inactive") return "unplanned";
  if (status === "invalid") return "invalid";
  if (status === "ready") return "ready";
  return "incomplete";
}

function getMemberStatusLabel(status: GuildSquadMemberGearStatus) {
  if (status === "ready") return "Loadout ready";
  if (status === "invalid") return "Plan invalid";
  if (status === "unplanned") return "No active plan";
  return "Gear pending";
}

function getSquadStatus(
  unlocked: boolean,
  memberCount: number,
  readyMembers: number,
  plannedMembers: number,
  invalidMembers: number,
): GuildSquadGearStatus {
  if (!unlocked) return "locked";
  if (memberCount === 0) return "empty";
  if (invalidMembers > 0) return "invalid";
  if (plannedMembers === 0) return "unplanned";
  if (readyMembers === memberCount) return "ready";
  return "partial";
}

function getSquadStatusLabel(status: GuildSquadGearStatus) {
  if (status === "locked") return "Guild level locked";
  if (status === "empty") return "Formation empty";
  if (status === "ready") return "Gear ready";
  if (status === "invalid") return "Plan review required";
  if (status === "unplanned") return "Loadouts unplanned";
  return "Preparation in progress";
}

function getWarnings(
  memberCount: number,
  invalidMembers: number,
  unplannedMembers: number,
  readyMembers: number,
  linkedOrderCount: number,
) {
  if (memberCount === 0) return ["Configure this formation in Guild Squads."];
  const warnings: string[] = [];
  if (invalidMembers > 0) {
    warnings.push(`${invalidMembers} member plan${invalidMembers === 1 ? " is" : "s are"} invalid.`);
  }
  if (unplannedMembers > 0) {
    warnings.push(`${unplannedMembers} member${unplannedMembers === 1 ? " has" : "s have"} no active loadout.`);
  }
  if (readyMembers < memberCount) {
    warnings.push(`${memberCount - readyMembers} member${memberCount - readyMembers === 1 ? " still needs" : "s still need"} gear preparation.`);
  }
  if (linkedOrderCount === 0) warnings.push("No deployment order uses this formation.");
  return warnings.slice(0, 3);
}

function getDeploymentTargetName(kind: "boss" | "contract", targetId: string) {
  if (kind === "boss") return bosses.find((boss) => boss.id === targetId)?.name ?? targetId;
  return guildContracts.find((contract) => contract.id === targetId)?.name ?? targetId;
}

function uniqueCharacters(characters: Character[]) {
  const seen = new Set<string>();
  return (Array.isArray(characters) ? characters : []).filter((character) => {
    if (
      !character
      || typeof character.id !== "string"
      || !character.id
      || seen.has(character.id)
    ) return false;
    seen.add(character.id);
    return true;
  });
}

function safeDepot(depot: GuildDepot): GuildDepot {
  return {
    goldStored: Number.isFinite(depot?.goldStored) ? Math.max(0, depot.goldStored) : 0,
    items: Array.isArray(depot?.items) ? depot.items : [],
  };
}
