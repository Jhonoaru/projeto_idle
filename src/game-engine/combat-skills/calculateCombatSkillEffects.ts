import { combatSkills } from "../../data/combatSkills";
import type {
  Character,
  CharacterAction,
  CombatSkillEffectSummary,
  CombatSkillPartyEffectSummary,
} from "../../shared/types";
import { simulateCombatSkillRotation } from "./simulateCombatSkillRotation";

const MAX_ATTACK_BONUS_PERCENT = 8;
const MAX_DEATH_RISK_REDUCTION_PERCENT = 10;
const MAX_SUPPLY_REDUCTION_PERCENT = 8;

export function calculateCombatSkillEffects(
  character: Character,
  action: CharacterAction | undefined,
  elapsedMs: number,
): CombatSkillEffectSummary {
  const durationMinutes = normalizeDurationMinutes(elapsedMs);
  const rotation = simulateCombatSkillRotation(character, action, elapsedMs);
  const combatBase = getCombatContributionBase(character);
  const entries = rotation.casts.flatMap((cast) => {
    const definition = combatSkills.find((skill) => skill.id === cast.skillId);
    if (!definition || cast.casts <= 0) return [];

    return [{
      skillId: definition.id,
      skillName: definition.name,
      casts: cast.casts,
      attackImpact: cast.casts * definition.effect.attack,
      survivalImpact: cast.casts * definition.effect.survival,
      supplyImpact: cast.casts * definition.effect.supply,
      damageDealt: contributionTotal(cast.casts, combatBase.damage, definition.effect.damage),
      healingDone: contributionTotal(cast.casts, combatBase.healing, definition.effect.healing),
      damagePrevented: contributionTotal(cast.casts, combatBase.mitigation, definition.effect.mitigation),
    }];
  });
  const total = entries.reduce(
    (sum, entry) => ({
      attack: sum.attack + entry.attackImpact,
      survival: sum.survival + entry.survivalImpact,
      supply: sum.supply + entry.supplyImpact,
    }),
    { attack: 0, survival: 0, supply: 0 },
  );
  const contribution = entries.reduce(
    (sum, entry) => ({
      damage: sum.damage + entry.damageDealt,
      healing: sum.healing + entry.healingDone,
      prevented: sum.prevented + entry.damagePrevented,
    }),
    { damage: 0, healing: 0, prevented: 0 },
  );
  const entriesBySkillId = new Map(entries.map((entry) => [entry.skillId, entry]));
  const timelineEvents = rotation.timeline.events.flatMap((event) => {
    const definition = combatSkills.find((skill) => skill.id === event.skillId);
    const entry = entriesBySkillId.get(event.skillId);
    if (!definition || !entry) return [];

    return [{
      sequence: event.sequence,
      occurredAtMs: event.occurredAtMs,
      progressPercent: progressPercent(event.occurredAtMs, rotation.timeline.durationMs),
      skillId: definition.id,
      skillName: definition.name,
      category: definition.category,
      manaCost: event.manaCost,
      damageDealt: contributionAtCast(entry.damageDealt, entry.casts, event.skillCastIndex),
      healingDone: contributionAtCast(entry.healingDone, entry.casts, event.skillCastIndex),
      damagePrevented: contributionAtCast(entry.damagePrevented, entry.casts, event.skillCastIndex),
    }];
  });

  return {
    totalCasts: rotation.totalCasts,
    manaSpent: rotation.manaSpent,
    attackBonusPercent: boundedPercent(total.attack * 0.35 / durationMinutes, MAX_ATTACK_BONUS_PERCENT),
    deathRiskReductionPercent: boundedPercent(total.survival * 0.9 / durationMinutes, MAX_DEATH_RISK_REDUCTION_PERCENT),
    supplyReductionPercent: boundedPercent(total.supply * 0.7 / durationMinutes, MAX_SUPPLY_REDUCTION_PERCENT),
    totalDamage: contribution.damage,
    totalHealing: contribution.healing,
    totalDamagePrevented: contribution.prevented,
    damagePerMinute: perMinute(contribution.damage, durationMinutes),
    healingPerMinute: perMinute(contribution.healing, durationMinutes),
    entries,
    timeline: {
      durationMs: rotation.timeline.durationMs,
      totalEvents: rotation.timeline.totalEvents,
      omittedEvents: Math.max(0, rotation.timeline.totalEvents - timelineEvents.length),
      events: timelineEvents,
    },
  };
}

export function calculatePartyCombatSkillEffects(
  characters: Character[],
  elapsedMs: number,
): CombatSkillPartyEffectSummary {
  const members = characters.map((character) => ({
    characterId: character.id,
    characterName: character.name,
    effects: calculateCombatSkillEffects(character, character.currentAction, elapsedMs),
  }));
  const divisor = Math.max(1, members.length);

  return {
    attackBonusPercent: rounded(members.reduce((sum, member) => sum + member.effects.attackBonusPercent, 0) / divisor),
    deathRiskReductionPercent: rounded(members.reduce((sum, member) => sum + member.effects.deathRiskReductionPercent, 0) / divisor),
    totalCasts: members.reduce((sum, member) => sum + member.effects.totalCasts, 0),
    manaSpent: members.reduce((sum, member) => sum + member.effects.manaSpent, 0),
    totalDamage: members.reduce((sum, member) => sum + member.effects.totalDamage, 0),
    totalHealing: members.reduce((sum, member) => sum + member.effects.totalHealing, 0),
    totalDamagePrevented: members.reduce((sum, member) => sum + member.effects.totalDamagePrevented, 0),
    members,
  };
}

export function formatCombatSkillEffectLog(effects: CombatSkillEffectSummary) {
  return `Skill effects: +${effects.attackBonusPercent}% clear speed, -${effects.deathRiskReductionPercent}% death risk, -${effects.supplyReductionPercent}% supplies. Combat report: ${effects.totalDamage.toLocaleString("en-US")} damage, ${effects.totalHealing.toLocaleString("en-US")} healing, ${effects.totalDamagePrevented.toLocaleString("en-US")} prevented.`;
}

function getCombatContributionBase(character: Character) {
  const attackPower = safeNumber(character.attributes?.attackPower);
  const defensePower = safeNumber(character.attributes?.defensePower);
  const maxHealth = safeNumber(character.attributes?.maxHealth);
  const maxMana = safeNumber(character.attributes?.maxMana);
  const level = safeNumber(character.level);
  const critChance = Math.min(100, safeNumber(character.attributes?.critChancePercent));
  const critDamage = Math.min(300, safeNumber(character.attributes?.critDamagePercent));
  const expectedCritMultiplier = 1 + (critChance / 100) * (0.5 + critDamage / 100);

  return {
    damage: Math.max(1, (attackPower * 0.85 + level * 1.5) * expectedCritMultiplier),
    healing: Math.max(1, maxHealth * 0.025 + maxMana * 0.015 + level * 0.6),
    mitigation: Math.max(1, defensePower * 0.18 + maxHealth * 0.006),
  };
}

function contributionTotal(casts: number, base: number, scale: number) {
  const value = casts * base * scale;
  return Math.round(Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Number.isFinite(value) ? value : 0)));
}

function contributionAtCast(total: number, casts: number, castIndex: number) {
  if (total <= 0 || casts <= 0 || castIndex <= 0) return 0;
  const base = Math.floor(total / casts);
  const remainder = total % casts;
  return base + (castIndex <= remainder ? 1 : 0);
}

function progressPercent(occurredAtMs: number, durationMs: number) {
  if (durationMs <= 0) return 0;
  return Number(Math.min(100, Math.max(0, occurredAtMs / durationMs * 100)).toFixed(1));
}

function perMinute(total: number, durationMinutes: number) {
  return Math.round(total / Math.max(1, durationMinutes));
}

function safeNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function normalizeDurationMinutes(elapsedMs: number) {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return 1;
  return Math.max(1, elapsedMs / 60_000);
}

function boundedPercent(value: number, maximum: number) {
  return rounded(Math.min(maximum, Math.max(0, Number.isFinite(value) ? value : 0)));
}

function rounded(value: number) {
  return Number(value.toFixed(2));
}
