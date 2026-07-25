import type { Character, Guild, GuildDepot } from "../../shared/types";
import { buildGuildDeploymentOrders } from "../deployment-orders/buildGuildDeploymentOrders";
import { buildGuildSquadGearReadiness } from "../loadout-templates/buildGuildSquadGearReadiness";

export type OperationBriefingStatus = "empty" | "blocked" | "gear-pending" | "ready";
export type OperationBriefingCheckStatus = "pass" | "warning" | "fail";

export function buildOperationReadinessBriefing(
  guild: Guild,
  characters: Character[],
  depot: GuildDepot,
  now = new Date(),
) {
  const safeCharacters = uniqueCharacters(characters);
  const safeNow = now instanceof Date && Number.isFinite(now.getTime()) ? now : new Date(0);
  const orders = buildGuildDeploymentOrders(guild, safeCharacters, safeNow);
  const gear = buildGuildSquadGearReadiness(guild, safeCharacters, depot);
  const slots = orders.slots.map((slot) => {
    const gearSlot = slot.order
      ? gear.slots.find((entry) => entry.id === slot.order?.squadSlotId)
      : undefined;
    const formationReady = Boolean(
      slot.candidate?.unlocked
      && slot.candidate.configured
      && slot.candidate.memberCount > 0
      && slot.candidate.availableCount >= slot.candidate.memberCount,
    );
    const plansReady = Boolean(
      gearSlot
      && gearSlot.summary.memberCount > 0
      && gearSlot.summary.plannedMembers === gearSlot.summary.memberCount
      && gearSlot.summary.invalidMembers === 0,
    );
    const equipmentReady = Boolean(
      gearSlot
      && gearSlot.summary.assignedTargets > 0
      && gearSlot.summary.equippedTargets === gearSlot.summary.assignedTargets,
    );
    const status = getStatus(Boolean(slot.order), Boolean(slot.candidate?.ready), plansReady, equipmentReady);

    return {
      id: slot.definition.id,
      sigil: slot.definition.sigil,
      name: slot.definition.name,
      order: slot.order,
      target: slot.target,
      candidate: slot.candidate,
      gear: gearSlot,
      status,
      statusLabel: getStatusLabel(status),
      checks: slot.order ? [
        createCheck("Formation availability", formationReady ? "pass" : "fail", formationReady
          ? `${slot.candidate?.availableCount ?? 0}/${slot.candidate?.memberCount ?? 0} assigned adventurers available.`
          : slot.candidate?.readinessLabel ?? "Formation unavailable."),
        createCheck("Operation requirements", slot.candidate?.ready ? "pass" : "fail", slot.reason),
        createCheck("Active loadout plans", plansReady ? "pass" : "warning", gearSlot
          ? `${gearSlot.summary.plannedMembers}/${gearSlot.summary.memberCount} members planned.`
          : "Formation gear data unavailable."),
        createCheck("Equipped targets", equipmentReady ? "pass" : "warning", gearSlot?.summary.assignedTargets
          ? `${gearSlot.summary.equippedTargets}/${gearSlot.summary.assignedTargets} loadout targets equipped.`
          : "No active equipment targets."),
      ] : [],
      blockers: getBlockers(slot.reason, slot.candidate?.ready, gearSlot?.warnings ?? []),
    };
  });

  return {
    slots,
    summary: {
      configured: slots.filter((slot) => slot.order).length,
      operationReady: slots.filter((slot) => slot.order && slot.candidate?.ready).length,
      fullyReady: slots.filter((slot) => slot.status === "ready").length,
      gearPending: slots.filter((slot) => slot.status === "gear-pending").length,
      blocked: slots.filter((slot) => slot.status === "blocked").length,
    },
  };
}

export type OperationReadinessBriefing = ReturnType<typeof buildOperationReadinessBriefing>;
export type OperationReadinessBriefingSlot = OperationReadinessBriefing["slots"][number];

function createCheck(label: string, status: OperationBriefingCheckStatus, detail: string) {
  return { label, status, detail };
}

function getStatus(
  configured: boolean,
  operationReady: boolean,
  plansReady: boolean,
  equipmentReady: boolean,
): OperationBriefingStatus {
  if (!configured) return "empty";
  if (!operationReady) return "blocked";
  if (!plansReady || !equipmentReady) return "gear-pending";
  return "ready";
}

function getStatusLabel(status: OperationBriefingStatus) {
  if (status === "ready") return "Ready to prepare";
  if (status === "gear-pending") return "Gear review";
  if (status === "blocked") return "Operation blocked";
  return "Open order";
}

function getBlockers(reason: string, operationReady: boolean | undefined, gearWarnings: string[]) {
  const blockers: string[] = [];
  if (!operationReady) blockers.push(reason);
  blockers.push(...gearWarnings);
  return [...new Set(blockers)].slice(0, 3);
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
