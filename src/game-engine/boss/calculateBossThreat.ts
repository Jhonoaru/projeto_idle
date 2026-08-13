import type {
  Boss,
  BossParty,
  BossPhaseDefinition,
  BossThreatMemberSummary,
  BossThreatPhaseSummary,
  BossThreatSummary,
  Character,
  CombatSkillTarget,
  PartyRole,
} from "../../shared/types";
import { calculateIncomingAttackCount } from "../combat-skills/calculateIncomingAttackCount";

const ROLE_THREAT: Record<PartyRole, number> = {
  tank: 4,
  damage: 2,
  healer: 1.25,
  support: 1.25,
};

const DEFAULT_PHASE: BossPhaseDefinition = {
  id: "encounter",
  name: "Encounter",
  durationPercent: 100,
  description: "The Boss follows the party's standard threat order.",
};

export function calculateBossPartyThreat(characters: Character[], party: BossParty, boss: Boss) {
  const participants = party.members
    .map((member) => characters.find((character) => character.id === member.characterId))
    .filter((character): character is Character => Boolean(character));
  return calculateBossThreat(
    participants,
    Object.fromEntries(party.members.map((member) => [member.characterId, member.role])),
    boss.durationMinutes * 60_000,
    [{ id: boss.id, name: boss.name, kind: "boss", level: boss.requirements.requiredLevel }],
    boss.phases,
  );
}

export function calculateBossThreat(
  characters: Character[],
  partyRoles: Partial<Record<string, PartyRole>>,
  durationMs: number,
  targets: CombatSkillTarget[],
  bossPhases?: BossPhaseDefinition[],
): BossThreatSummary {
  const totalIncomingAttacks = calculateIncomingAttackCount(durationMs, targets);
  if (characters.length === 0) {
    return {
      totalIncomingAttacks,
      tankAggroControlPercent: 0,
      aggroRiskReductionPercent: 0,
      targetSwitchCount: 0,
      phases: [],
      members: [],
    };
  }

  const participants = characters.map((character) => ({
    character,
    role: partyRoles[character.id] ?? "damage" as PartyRole,
  }));
  const phases = normalizePhases(bossPhases);
  const phaseAttackCounts = allocateInteger(
    phases.map((phase) => ({ id: phase.id, weight: phase.durationPercent })),
    totalIncomingAttacks,
  );
  let elapsedPercent = 0;
  const phaseSummaries: BossThreatPhaseSummary[] = phases.map((phase) => {
    const phaseAttacks = phaseAttackCounts[phase.id] ?? 0;
    const hasPreferredRole = phase.targetRole
      ? participants.some((participant) => participant.role === phase.targetRole)
      : false;
    const weighted = participants.map((participant) => ({
      ...participant,
      weight: ROLE_THREAT[participant.role] * (
        hasPreferredRole && participant.role === phase.targetRole
          ? normalizeMultiplier(phase.targetThreatMultiplier)
          : 1
      ),
    }));
    const allocations = allocateInteger(
      weighted.map((entry) => ({ id: entry.character.id, weight: entry.weight })),
      phaseAttacks,
    );
    const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0);
    const phaseMembers = weighted.map((entry) => ({
      characterId: entry.character.id,
      characterName: entry.character.name,
      role: entry.role,
      threatPercent: rounded(totalWeight > 0 ? entry.weight / totalWeight * 100 : 0),
      incomingAttacks: allocations[entry.character.id] ?? 0,
      primaryTarget: false,
    }));
    const primary = [...phaseMembers].sort(compareThreatMembers)[0];
    if (primary) primary.primaryTarget = true;
    const startPercent = rounded(elapsedPercent);
    elapsedPercent += phase.durationPercent;
    return {
      phaseId: phase.id,
      phaseName: phase.name,
      description: phase.description,
      startPercent,
      endPercent: rounded(Math.min(100, elapsedPercent)),
      incomingAttacks: phaseAttacks,
      targetRole: hasPreferredRole ? phase.targetRole : undefined,
      primaryTargetCharacterId: primary?.characterId,
      members: phaseMembers,
    };
  });

  const equalSharePercent = 100 / characters.length;
  const members: BossThreatMemberSummary[] = participants.map((participant) => {
    const incomingAttacks = phaseSummaries.reduce((sum, phase) => (
      sum + (phase.members.find((member) => member.characterId === participant.character.id)?.incomingAttacks ?? 0)
    ), 0);
    const threatPercent = rounded(totalIncomingAttacks > 0 ? incomingAttacks / totalIncomingAttacks * 100 : 0);
    const weightedThreatScore = phaseSummaries.reduce((sum, phase) => {
      const member = phase.members.find((entry) => entry.characterId === participant.character.id);
      return sum + (member?.threatPercent ?? 0) * Math.max(0, phase.endPercent - phase.startPercent) / 100;
    }, 0);
    return {
      characterId: participant.character.id,
      characterName: participant.character.name,
      role: participant.role,
      threatScore: rounded(weightedThreatScore),
      threatPercent,
      incomingAttacks,
      deathRiskMultiplier: rounded(clamp(Math.sqrt(threatPercent / equalSharePercent), 0.55, 1.65)),
      primaryTarget: false,
    };
  });
  const primary = [...members].sort(compareThreatMembers)[0];
  if (primary) primary.primaryTarget = true;
  const tankAttacks = members
    .filter((member) => member.role === "tank")
    .reduce((sum, member) => sum + member.incomingAttacks, 0);
  const tankAggroControlPercent = rounded(totalIncomingAttacks > 0 ? tankAttacks / totalIncomingAttacks * 100 : 0);
  const aggroRiskReductionPercent = rounded(Math.min(4, tankAggroControlPercent * 0.06));
  const phaseTargets = phaseSummaries
    .map((phase) => phase.primaryTargetCharacterId)
    .filter((characterId): characterId is string => Boolean(characterId));
  const targetSwitchCount = phaseTargets.reduce((count, characterId, index) => (
    index > 0 && phaseTargets[index - 1] !== characterId ? count + 1 : count
  ), 0);

  return {
    totalIncomingAttacks,
    primaryTargetCharacterId: primary?.characterId,
    tankAggroControlPercent,
    aggroRiskReductionPercent,
    targetSwitchCount,
    phases: phaseSummaries,
    members,
  };
}

function normalizePhases(phases?: BossPhaseDefinition[]) {
  const valid: BossPhaseDefinition[] = [];
  const phaseIds = new Set<string>();
  for (const phase of phases ?? []) {
    if (!phase
      || typeof phase.id !== "string"
      || phase.id.length === 0
      || phaseIds.has(phase.id)
      || !Number.isFinite(phase.durationPercent)
      || phase.durationPercent <= 0
    ) continue;
    phaseIds.add(phase.id);
    valid.push(phase);
  }
  if (valid.length === 0) return [DEFAULT_PHASE];
  const total = valid.reduce((sum, phase) => sum + phase.durationPercent, 0);
  return valid.map((phase) => ({
    ...phase,
    name: typeof phase.name === "string" && phase.name.trim() ? phase.name.trim() : "Boss Phase",
    description: typeof phase.description === "string" ? phase.description : "The Boss changes its target priority.",
    durationPercent: phase.durationPercent / total * 100,
  }));
}

function normalizeMultiplier(value?: number) {
  return typeof value === "number" && Number.isFinite(value) ? clamp(value, 1, 4) : 1;
}

function allocateInteger(entries: Array<{ id: string; weight: number }>, total: number) {
  const allocations: Record<string, number> = {};
  const totalWeight = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
  const remainders = entries.map((entry) => {
    const raw = totalWeight > 0 ? total * Math.max(0, entry.weight) / totalWeight : 0;
    const base = Math.floor(raw);
    allocations[entry.id] = base;
    return { id: entry.id, remainder: raw - base };
  }).sort((left, right) => right.remainder - left.remainder || left.id.localeCompare(right.id));
  let remaining = total - Object.values(allocations).reduce((sum, value) => sum + value, 0);
  for (let index = 0; remaining > 0 && remainders.length > 0; index += 1, remaining -= 1) {
    allocations[remainders[index % remainders.length].id] += 1;
  }
  return allocations;
}

function compareThreatMembers(
  left: { characterId: string; threatPercent: number; incomingAttacks: number },
  right: { characterId: string; threatPercent: number; incomingAttacks: number },
) {
  return right.incomingAttacks - left.incomingAttacks
    || right.threatPercent - left.threatPercent
    || left.characterId.localeCompare(right.characterId);
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function rounded(value: number) {
  return Number(value.toFixed(2));
}
