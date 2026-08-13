import type {
  BossThreatMemberSummary,
  BossThreatSummary,
  Boss,
  BossParty,
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

export function calculateBossPartyThreat(characters: Character[], party: BossParty, boss: Boss) {
  const participants = party.members
    .map((member) => characters.find((character) => character.id === member.characterId))
    .filter((character): character is Character => Boolean(character));
  return calculateBossThreat(
    participants,
    Object.fromEntries(party.members.map((member) => [member.characterId, member.role])),
    boss.durationMinutes * 60_000,
    [{ id: boss.id, name: boss.name, kind: "boss", level: boss.requirements.requiredLevel }],
  );
}

export function calculateBossThreat(
  characters: Character[],
  partyRoles: Partial<Record<string, PartyRole>>,
  durationMs: number,
  targets: CombatSkillTarget[],
): BossThreatSummary {
  const totalIncomingAttacks = calculateIncomingAttackCount(durationMs, targets);
  if (characters.length === 0) {
    return {
      totalIncomingAttacks,
      tankAggroControlPercent: 0,
      aggroRiskReductionPercent: 0,
      members: [],
    };
  }

  const weighted = characters.map((character) => {
    const role = partyRoles[character.id] ?? "damage";
    return {
      character,
      role,
      threatScore: ROLE_THREAT[role],
    };
  });
  const totalThreat = weighted.reduce((sum, entry) => sum + entry.threatScore, 0);
  const allocations = allocateAttacks(weighted, totalThreat, totalIncomingAttacks);
  const equalSharePercent = 100 / characters.length;
  const members: BossThreatMemberSummary[] = weighted.map((entry) => {
    const threatPercent = rounded(entry.threatScore / totalThreat * 100);
    return {
      characterId: entry.character.id,
      characterName: entry.character.name,
      role: entry.role,
      threatScore: entry.threatScore,
      threatPercent,
      incomingAttacks: allocations[entry.character.id] ?? 0,
      deathRiskMultiplier: rounded(clamp(Math.sqrt(threatPercent / equalSharePercent), 0.55, 1.65)),
      primaryTarget: false,
    };
  });
  const primary = [...members].sort((left, right) => (
    right.threatPercent - left.threatPercent
    || left.characterId.localeCompare(right.characterId)
  ))[0];
  if (primary) primary.primaryTarget = true;
  const tankAggroControlPercent = rounded(members
    .filter((member) => member.role === "tank")
    .reduce((sum, member) => sum + member.threatPercent, 0));
  const aggroRiskReductionPercent = rounded(Math.min(4, tankAggroControlPercent * 0.06));

  return {
    totalIncomingAttacks,
    primaryTargetCharacterId: primary?.characterId,
    tankAggroControlPercent,
    aggroRiskReductionPercent,
    members,
  };
}

function allocateAttacks(
  entries: Array<{ character: Character; threatScore: number }>,
  totalThreat: number,
  totalIncomingAttacks: number,
) {
  const allocations: Record<string, number> = {};
  const remainders = entries.map((entry) => {
    const raw = totalThreat > 0 ? totalIncomingAttacks * entry.threatScore / totalThreat : 0;
    const base = Math.floor(raw);
    allocations[entry.character.id] = base;
    return { characterId: entry.character.id, remainder: raw - base };
  }).sort((left, right) => right.remainder - left.remainder || left.characterId.localeCompare(right.characterId));
  let remaining = totalIncomingAttacks - Object.values(allocations).reduce((sum, value) => sum + value, 0);
  for (let index = 0; remaining > 0 && remainders.length > 0; index += 1, remaining -= 1) {
    const characterId = remainders[index % remainders.length].characterId;
    allocations[characterId] += 1;
  }
  return allocations;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function rounded(value: number) {
  return Number(value.toFixed(2));
}
