import { combatSkills } from "../../data/combatSkills";
import type {
  Character,
  CharacterAction,
  CombatSkillEffectOptions,
  CombatSkillEffectSummary,
  CombatSkillPartyEffectSummary,
  CombatSkillTarget,
} from "../../shared/types";
import { simulateCombatSkillRotation } from "./simulateCombatSkillRotation";

const MAX_ATTACK_BONUS_PERCENT = 8;
const MAX_DEATH_RISK_REDUCTION_PERCENT = 10;
const MAX_SUPPLY_REDUCTION_PERCENT = 8;

export function calculateCombatSkillEffects(
  character: Character,
  action: CharacterAction | undefined,
  elapsedMs: number,
  options: CombatSkillEffectOptions = {},
): CombatSkillEffectSummary {
  const durationMinutes = normalizeDurationMinutes(elapsedMs);
  const rotation = simulateCombatSkillRotation(character, action, elapsedMs);
  const combatBase = getCombatContributionBase(character);
  const entries = rotation.casts.flatMap((cast) => {
    const definition = combatSkills.find((skill) => skill.id === cast.skillId);
    if (!definition || cast.casts <= 0) return [];

    const criticalProfile = getCriticalProfile(character, definition.id, cast.casts, definition.category === "attack");
    const baseDamageDealt = contributionTotal(cast.casts, combatBase.damage, definition.effect.damage);
    const damageDealt = calculateAdjustedDamageTotal(
      character,
      action,
      definition.id,
      definition.category,
      definition.damageType,
      baseDamageDealt,
      cast.casts,
      criticalProfile,
      options,
    );
    return [{
      skillId: definition.id,
      skillName: definition.name,
      casts: cast.casts,
      attackImpact: cast.casts * definition.effect.attack,
      survivalImpact: cast.casts * definition.effect.survival,
      supplyImpact: cast.casts * definition.effect.supply,
      damageType: definition.damageType,
      baseDamageDealt,
      damageDealt,
      elementalModifierPercent: modifierPercent(baseDamageDealt, damageDealt),
      healingDone: contributionTotal(cast.casts, combatBase.healing, definition.effect.healing),
      damagePrevented: contributionTotal(cast.casts, combatBase.mitigation, definition.effect.mitigation),
      criticalHits: criticalProfile.criticalHits,
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
      baseDamage: sum.baseDamage + entry.baseDamageDealt,
      damage: sum.damage + entry.damageDealt,
      healing: sum.healing + entry.healingDone,
      prevented: sum.prevented + entry.damagePrevented,
      criticalHits: sum.criticalHits + entry.criticalHits,
    }),
    { baseDamage: 0, damage: 0, healing: 0, prevented: 0, criticalHits: 0 },
  );
  const entriesBySkillId = new Map(entries.map((entry) => [entry.skillId, entry]));
  const timelineEvents = rotation.timeline.events.flatMap((event) => {
    const definition = combatSkills.find((skill) => skill.id === event.skillId);
    const entry = entriesBySkillId.get(event.skillId);
    if (!definition || !entry) return [];
    const criticalProfile = getCriticalProfile(character, definition.id, entry.casts, definition.category === "attack");
    const critical = isCriticalCast(criticalProfile, event.skillCastIndex);
    const target = getEventTarget(character, action, definition.category, event, options);
    const baseDamageDealt = damageContributionAtCast(entry.baseDamageDealt, entry.casts, event.skillCastIndex, criticalProfile);
    const damageDealt = applyElementalModifier(baseDamageDealt, target, definition.damageType);

    return [{
      sequence: event.sequence,
      occurredAtMs: event.occurredAtMs,
      progressPercent: progressPercent(event.occurredAtMs, rotation.timeline.durationMs),
      skillId: definition.id,
      skillName: definition.name,
      category: definition.category,
      targetId: target.id,
      targetName: target.name,
      targetKind: target.kind,
      critical,
      manaCost: event.manaCost,
      damageType: definition.damageType,
      baseDamageDealt,
      damageDealt,
      elementalModifierPercent: getElementalModifierPercent(target, definition.damageType),
      healingDone: contributionAtCast(entry.healingDone, entry.casts, event.skillCastIndex),
      damagePrevented: contributionAtCast(entry.damagePrevented, entry.casts, event.skillCastIndex),
    }];
  });

  return {
    totalCasts: rotation.totalCasts,
    manaSpent: rotation.manaSpent,
    attackBonusPercent: boundedPercent(total.attack * elementalEffectiveness(contribution.baseDamage, contribution.damage) * 0.35 / durationMinutes, MAX_ATTACK_BONUS_PERCENT),
    deathRiskReductionPercent: boundedPercent(total.survival * 0.9 / durationMinutes, MAX_DEATH_RISK_REDUCTION_PERCENT),
    supplyReductionPercent: boundedPercent(total.supply * 0.7 / durationMinutes, MAX_SUPPLY_REDUCTION_PERCENT),
    baseTotalDamage: contribution.baseDamage,
    totalDamage: contribution.damage,
    elementalDamageDelta: contribution.damage - contribution.baseDamage,
    elementalModifierPercent: modifierPercent(contribution.baseDamage, contribution.damage),
    totalHealing: contribution.healing,
    totalDamagePrevented: contribution.prevented,
    totalCriticalHits: contribution.criticalHits,
    damagePerMinute: perMinute(contribution.damage, durationMinutes),
    healingPerMinute: perMinute(contribution.healing, durationMinutes),
    entries,
    timeline: {
      durationMs: rotation.timeline.durationMs,
      totalEvents: rotation.timeline.totalEvents,
      omittedEvents: Math.max(0, rotation.timeline.totalEvents - timelineEvents.length),
      totalCriticalHits: contribution.criticalHits,
      events: timelineEvents,
    },
  };
}

export function calculatePartyCombatSkillEffects(
  characters: Character[],
  elapsedMs: number,
  options: CombatSkillEffectOptions = {},
): CombatSkillPartyEffectSummary {
  const supportTargets = normalizeTargets(options.supportTargets).length > 0
    ? options.supportTargets
    : characters.map((character) => ({ id: character.id, name: character.name, kind: "ally" as const }));
  const members = characters.map((character) => ({
    characterId: character.id,
    characterName: character.name,
    effects: calculateCombatSkillEffects(character, character.currentAction, elapsedMs, {
      ...options,
      supportTargets,
    }),
  }));
  const divisor = Math.max(1, members.length);

  return {
    attackBonusPercent: rounded(members.reduce((sum, member) => sum + member.effects.attackBonusPercent, 0) / divisor),
    deathRiskReductionPercent: rounded(members.reduce((sum, member) => sum + member.effects.deathRiskReductionPercent, 0) / divisor),
    totalCasts: members.reduce((sum, member) => sum + member.effects.totalCasts, 0),
    manaSpent: members.reduce((sum, member) => sum + member.effects.manaSpent, 0),
    baseTotalDamage: members.reduce((sum, member) => sum + member.effects.baseTotalDamage, 0),
    totalDamage: members.reduce((sum, member) => sum + member.effects.totalDamage, 0),
    elementalDamageDelta: members.reduce((sum, member) => sum + member.effects.elementalDamageDelta, 0),
    elementalModifierPercent: modifierPercent(
      members.reduce((sum, member) => sum + member.effects.baseTotalDamage, 0),
      members.reduce((sum, member) => sum + member.effects.totalDamage, 0),
    ),
    totalHealing: members.reduce((sum, member) => sum + member.effects.totalHealing, 0),
    totalDamagePrevented: members.reduce((sum, member) => sum + member.effects.totalDamagePrevented, 0),
    totalCriticalHits: members.reduce((sum, member) => sum + member.effects.totalCriticalHits, 0),
    members,
  };
}

export function formatCombatSkillEffectLog(effects: CombatSkillEffectSummary) {
  return `Skill effects: +${effects.attackBonusPercent}% clear speed, -${effects.deathRiskReductionPercent}% death risk, -${effects.supplyReductionPercent}% supplies. Combat report: ${effects.totalDamage.toLocaleString("en-US")} damage (${formatSignedPercent(effects.elementalModifierPercent)} elemental), ${effects.totalHealing.toLocaleString("en-US")} healing, ${effects.totalDamagePrevented.toLocaleString("en-US")} prevented, ${effects.totalCriticalHits.toLocaleString("en-US")} critical hits.`;
}

function calculateAdjustedDamageTotal(
  character: Character,
  action: CharacterAction | undefined,
  skillId: string,
  category: "attack" | "support",
  damageType: CombatSkillEffectSummary["entries"][number]["damageType"],
  baseTotal: number,
  casts: number,
  criticalProfile: CriticalProfile,
  options: CombatSkillEffectOptions,
) {
  let adjustedTotal = 0;
  for (let skillCastIndex = 1; skillCastIndex <= casts; skillCastIndex += 1) {
    const target = getEventTarget(character, action, category, { skillId, skillCastIndex }, options);
    const baseDamage = damageContributionAtCast(baseTotal, casts, skillCastIndex, criticalProfile);
    adjustedTotal += applyElementalModifier(baseDamage, target, damageType);
  }
  return adjustedTotal;
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

interface CriticalProfile {
  casts: number;
  criticalHits: number;
  bonusWeight: number;
  phase: number;
}

function getCriticalProfile(character: Character, skillId: string, casts: number, eligible: boolean): CriticalProfile {
  const normalizedCasts = Math.max(0, Math.floor(casts));
  if (!eligible || normalizedCasts <= 0) return { casts: normalizedCasts, criticalHits: 0, bonusWeight: 0, phase: 0 };
  const chance = Math.min(100, safeNumber(character.attributes?.critChancePercent));
  const criticalHits = Math.min(normalizedCasts, Math.round(normalizedCasts * chance / 100));
  const criticalDamage = Math.min(300, safeNumber(character.attributes?.critDamagePercent));
  return {
    casts: normalizedCasts,
    criticalHits,
    bonusWeight: 0.5 + criticalDamage / 100,
    phase: stableHash(`${character.id}:${skillId}:critical`) % normalizedCasts,
  };
}

function isCriticalCast(profile: CriticalProfile, castIndex: number) {
  if (profile.criticalHits <= 0 || castIndex <= 0 || castIndex > profile.casts) return false;
  return criticalCountThrough(profile, castIndex) > criticalCountThrough(profile, castIndex - 1);
}

function damageContributionAtCast(total: number, casts: number, castIndex: number, profile: CriticalProfile) {
  if (total <= 0 || casts <= 0 || castIndex <= 0) return 0;
  const criticalBefore = criticalCountThrough(profile, castIndex - 1);
  const criticalThrough = criticalCountThrough(profile, castIndex);
  const previousWeight = castIndex - 1 + criticalBefore * profile.bonusWeight;
  const currentWeight = castIndex + criticalThrough * profile.bonusWeight;
  const totalWeight = casts + profile.criticalHits * profile.bonusWeight;
  return Math.round(total * currentWeight / totalWeight) - Math.round(total * previousWeight / totalWeight);
}

function criticalCountThrough(profile: CriticalProfile, castIndex: number) {
  if (profile.casts <= 0 || profile.criticalHits <= 0 || castIndex <= 0) return 0;
  const boundedIndex = Math.min(profile.casts, Math.floor(castIndex));
  return Math.floor((boundedIndex * profile.criticalHits + profile.phase) / profile.casts);
}

function getEventTarget(
  character: Character,
  action: CharacterAction | undefined,
  category: "attack" | "support",
  event: { skillCastIndex: number; skillId: string },
  options: CombatSkillEffectOptions,
): CombatSkillTarget {
  const configuredTargets = normalizeTargets(category === "attack" ? options.attackTargets : options.supportTargets);
  const fallback = category === "attack"
    ? {
        id: action?.targetId ?? "combat-encounter",
        name: action?.targetName ?? "Combat Encounter",
        kind: "encounter" as const,
      }
    : { id: character.id, name: character.name, kind: "self" as const };
  const targets = configuredTargets.length > 0 ? configuredTargets : [fallback];
  const target = targets[stableHash(`${character.id}:${event.skillId}:${event.skillCastIndex}:target`) % targets.length];
  return target.id === character.id ? { ...target, kind: "self" } : target;
}

function applyElementalModifier(
  baseDamage: number,
  target: CombatSkillTarget,
  damageType: CombatSkillEffectSummary["entries"][number]["damageType"],
) {
  if (baseDamage <= 0 || !damageType) return baseDamage;
  return Math.round(baseDamage * (1 + getElementalModifierPercent(target, damageType) / 100));
}

function getElementalModifierPercent(
  target: CombatSkillTarget,
  damageType: CombatSkillEffectSummary["entries"][number]["damageType"],
) {
  if (!damageType) return 0;
  const rawResistance = target.resistances?.[damageType];
  const resistance = Number.isFinite(rawResistance) ? Math.min(25, Math.max(-25, Number(rawResistance))) : 0;
  return -resistance;
}

function elementalEffectiveness(baseDamage: number, adjustedDamage: number) {
  if (baseDamage <= 0) return 1;
  const value = adjustedDamage / baseDamage;
  return Number.isFinite(value) ? Math.min(1.25, Math.max(0.75, value)) : 1;
}

function modifierPercent(baseDamage: number, adjustedDamage: number) {
  if (baseDamage <= 0) return 0;
  return rounded((adjustedDamage / baseDamage - 1) * 100);
}

function formatSignedPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value}%`;
}

function normalizeTargets(targets: CombatSkillTarget[] | undefined) {
  if (!Array.isArray(targets)) return [];
  return targets.filter((target) => target && typeof target.id === "string" && target.id.length > 0 && typeof target.name === "string" && target.name.length > 0);
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
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
