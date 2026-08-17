import { combatSkills } from "../../data/combatSkills";
import type {
  BossIncomingPressureSegment,
  Character,
  CharacterAction,
  CombatAttackOutcome,
  CombatConditionDefinition,
  CombatConditionOutcome,
  CombatConditionSummary,
  CombatSkillEffectOptions,
  CombatSkillEffectSummary,
  CombatSkillPartyEffectSummary,
  CombatSkillTarget,
} from "../../shared/types";
import { simulateCombatSkillRotation } from "./simulateCombatSkillRotation";
import { calculateBossThreat } from "../boss/calculateBossThreat";
import { planBossInterrupts } from "../boss/planBossInterrupts";
import { planBossTelegraphDodges } from "../boss/planBossTelegraphDodges";
import { calculateBossDodgeTradeOffs } from "../boss/calculateBossDodgeTradeOffs";
import { calculateIncomingAttackCount } from "./calculateIncomingAttackCount";
import {
  calculateIncomingConditionDefense,
  calculatePartyIncomingConditionDefense,
  type IncomingConditionDefenseProfile,
} from "./calculateIncomingConditionDefense";

const MAX_ATTACK_BONUS_PERCENT = 8;
const MAX_DEATH_RISK_REDUCTION_PERCENT = 10;
const MAX_SUPPLY_REDUCTION_PERCENT = 8;
const MAX_CONDITION_ATTACK_BONUS_PERCENT = 3;
const MAX_CONDITION_RISK_REDUCTION_PERCENT = 2;
const MAX_CONDITION_DAMAGE_PERCENT = 25;

export function calculateCombatSkillEffects(
  character: Character,
  action: CharacterAction | undefined,
  elapsedMs: number,
  options: CombatSkillEffectOptions = {},
  incomingConditionDefenseOverride?: IncomingConditionDefenseProfile,
): CombatSkillEffectSummary {
  const durationMinutes = normalizeDurationMinutes(elapsedMs);
  const rotation = simulateCombatSkillRotation(character, action, elapsedMs);
  const incomingConditionDefense = incomingConditionDefenseOverride ?? calculateIncomingConditionDefense(
    character,
    rotation,
    elapsedMs,
    normalizeTargets(options.attackTargets),
    {
      incomingDamageMultiplier: options.incomingDamageMultiplierOverride,
      conditionChanceMultiplier: options.incomingConditionChanceMultiplierOverride,
    },
  );
  const defenseProfile = calculateDefenseProfile(character, durationMinutes, options);
  const combatBase = getCombatContributionBase(character);
  const entries = rotation.casts.flatMap((cast) => {
    const definition = combatSkills.find((skill) => skill.id === cast.skillId);
    if (!definition || cast.casts <= 0) return [];

    const criticalProfile = getCriticalProfile(character, definition.id, cast.casts, definition.category === "attack");
    const baseDamageDealt = contributionTotal(cast.casts, combatBase.damage, definition.effect.damage);
    const attackResolution = calculateAttackResolution(
      character,
      action,
      definition.id,
      definition.category,
      definition.damageType,
      baseDamageDealt,
      cast.casts,
      criticalProfile,
      definition.effect.armorPenetration,
      definition.effect.conditionResistancePenetration,
      definition.condition,
      elapsedMs,
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
      landedBaseDamageDealt: attackResolution.landedBaseDamage,
      damageAfterDefense: attackResolution.damageAfterDefense,
      defenseMitigationPercent: reductionPercent(attackResolution.landedBaseDamage, attackResolution.damageAfterDefense),
      armorPenetrationPercent: getArmorPenetrationPercent(character, definition.effect.armorPenetration),
      damageDealt: attackResolution.damage,
      elementalModifierPercent: modifierPercent(attackResolution.damageAfterDefense, attackResolution.damage),
      healingDone: contributionTotal(cast.casts, combatBase.healing, definition.effect.healing),
      damagePrevented: contributionTotal(cast.casts, combatBase.mitigation, definition.effect.mitigation),
      hits: attackResolution.hits,
      misses: attackResolution.misses,
      dodges: attackResolution.dodges,
      criticalHits: attackResolution.criticalHits,
      conditionType: definition.condition?.type,
      conditionApplications: attackResolution.conditionApplications,
      conditionTicks: attackResolution.conditionTicks,
      conditionDamage: attackResolution.conditionDamage,
      conditionUptimeSeconds: attackResolution.conditionUptimeSeconds,
      conditionPotencyPercent: boundedValue(definition.condition?.potencyPercent, 0, 60, 0),
      conditionEligibleHits: attackResolution.conditionEligibleHits,
      conditionResisted: attackResolution.conditionResisted,
      conditionImmuneHits: attackResolution.conditionImmuneHits,
      conditionResistanceTotal: attackResolution.conditionResistanceTotal,
      conditionResistancePenetrationTotal: attackResolution.conditionResistancePenetrationTotal,
      conditionEffectiveResistanceTotal: attackResolution.conditionEffectiveResistanceTotal,
      conditionEffectiveChanceTotal: attackResolution.conditionEffectiveChanceTotal,
      conditionsCleansed: incomingConditionDefense.cleansedBySkillId[definition.id] ?? 0,
      conditionProtectionPercent: boundedValue(definition.effect.conditionSupport.protectionPercent, 0, 35, 0),
      conditionProtectionUptimeSeconds: incomingConditionDefense.protectionUptimeSecondsBySkillId[definition.id] ?? 0,
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
      landedBaseDamage: sum.landedBaseDamage + entry.landedBaseDamageDealt,
      damageAfterDefense: sum.damageAfterDefense + entry.damageAfterDefense,
      damage: sum.damage + entry.damageDealt,
      healing: sum.healing + entry.healingDone,
      prevented: sum.prevented + entry.damagePrevented,
      hits: sum.hits + entry.hits,
      misses: sum.misses + entry.misses,
      dodges: sum.dodges + entry.dodges,
      criticalHits: sum.criticalHits + entry.criticalHits,
      conditionApplications: sum.conditionApplications + entry.conditionApplications,
      conditionTicks: sum.conditionTicks + entry.conditionTicks,
      conditionDamage: sum.conditionDamage + entry.conditionDamage,
    }),
    { baseDamage: 0, landedBaseDamage: 0, damageAfterDefense: 0, damage: 0, healing: 0, prevented: 0, hits: 0, misses: 0, dodges: 0, criticalHits: 0, conditionApplications: 0, conditionTicks: 0, conditionDamage: 0 },
  );
  const conditions = aggregateConditions(entries, durationMinutes);
  const slow = conditions.find((condition) => condition.type === "slow");
  const slowUptimePercent = slow?.uptimePercent ?? 0;
  const slowControlPercent = slowUptimePercent * (slow?.potencyPercent ?? 0) / 100;
  const conditionDamagePercent = positiveModifierPercent(contribution.damage, contribution.damage + contribution.conditionDamage);
  const conditionAttackBonusPercent = boundedPercent(conditionDamagePercent * 0.08 + slowControlPercent * 0.06, MAX_CONDITION_ATTACK_BONUS_PERCENT);
  const conditionRiskReductionPercent = boundedPercent(slowControlPercent * 0.08, MAX_CONDITION_RISK_REDUCTION_PERCENT);
  const entriesBySkillId = new Map(entries.map((entry) => [entry.skillId, entry]));
  const timelineEvents = rotation.timeline.events.flatMap((event) => {
    const definition = combatSkills.find((skill) => skill.id === event.skillId);
    const entry = entriesBySkillId.get(event.skillId);
    if (!definition || !entry) return [];
    const criticalProfile = getCriticalProfile(character, definition.id, entry.casts, definition.category === "attack");
    const target = getEventTarget(character, action, definition.category, event, options);
    const outcome: CombatAttackOutcome = definition.category === "attack"
      ? getAttackOutcome(character, target, definition.id, event.skillCastIndex)
      : "support";
    const critical = outcome === "hit" && isCriticalCast(criticalProfile, event.skillCastIndex);
    const baseDamageDealt = damageContributionAtCast(entry.baseDamageDealt, entry.casts, event.skillCastIndex, criticalProfile);
    const armorPenetrationPercent = getArmorPenetrationPercent(character, definition.effect.armorPenetration);
    const damageAfterDefense = outcome === "hit" ? applyTargetDefense(baseDamageDealt, target, armorPenetrationPercent) : 0;
    const damageDealt = outcome === "hit" ? applyElementalModifier(damageAfterDefense, target, definition.damageType) : 0;
    const condition = calculateConditionAtCast(
      character.id,
      target,
      definition.id,
      event.skillCastIndex,
      definition.condition,
      getConditionResistancePenetrationPercent(character, definition.effect.conditionResistancePenetration),
      damageDealt,
      Math.max(0, rotation.timeline.durationMs - event.occurredAtMs),
    );

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
      outcome,
      critical,
      manaCost: event.manaCost,
      damageType: definition.damageType,
      baseDamageDealt,
      damageAfterDefense,
      defenseMitigationPercent: reductionPercent(baseDamageDealt, damageAfterDefense),
      armorPenetrationPercent,
      damageDealt,
      elementalModifierPercent: getElementalModifierPercent(target, definition.damageType),
      healingDone: contributionAtCast(entry.healingDone, entry.casts, event.skillCastIndex),
      damagePrevented: contributionAtCast(entry.damagePrevented, entry.casts, event.skillCastIndex),
      conditionType: definition.condition?.type,
      conditionApplied: condition.applied,
      conditionTicks: condition.ticks,
      conditionDamage: condition.damage,
      conditionDurationSeconds: condition.durationSeconds,
      conditionPotencyPercent: condition.potencyPercent,
      conditionOutcome: condition.outcome,
      conditionResistancePercent: condition.resistancePercent,
      conditionResistancePenetrationPercent: condition.resistancePenetrationPercent,
      conditionEffectiveResistancePercent: condition.effectiveResistancePercent,
      conditionBaseChancePercent: condition.baseChancePercent,
      conditionEffectiveChancePercent: condition.effectiveChancePercent,
      conditionCleanseCount: definition.effect.conditionSupport.cleanseCount ?? 0,
      conditionProtectionPercent: definition.effect.conditionSupport.protectionPercent ?? 0,
      conditionProtectionDurationSeconds: definition.effect.conditionSupport.protectionDurationSeconds ?? 0,
    }];
  });
  const totalAttacks = contribution.hits + contribution.misses + contribution.dodges;
  const dodgeRiskReductionPercent = boundedPercent(safeNumber(character.attributes?.dodgePercent) * 0.4, 6);

  return {
    totalCasts: rotation.totalCasts,
    manaSpent: rotation.manaSpent,
    attackBonusPercent: boundedPercent(total.attack * avoidanceEffectiveness(contribution.baseDamage, contribution.landedBaseDamage) * defenseEffectiveness(contribution.landedBaseDamage, contribution.damageAfterDefense) * elementalEffectiveness(contribution.damageAfterDefense, contribution.damage) * 0.35 / durationMinutes + conditionAttackBonusPercent, MAX_ATTACK_BONUS_PERCENT),
    deathRiskReductionPercent: boundedPercent(total.survival * 0.9 / durationMinutes + dodgeRiskReductionPercent + defenseProfile.blockRiskReductionPercent + conditionRiskReductionPercent + incomingConditionDefense.riskReductionPercent, MAX_DEATH_RISK_REDUCTION_PERCENT),
    supplyReductionPercent: boundedPercent(total.supply * 0.7 / durationMinutes, MAX_SUPPLY_REDUCTION_PERCENT),
    dodgeRiskReductionPercent,
    ...defenseProfile,
    totalAttacks,
    totalHits: contribution.hits,
    totalMisses: contribution.misses,
    totalDodges: contribution.dodges,
    hitRatePercent: ratePercent(contribution.hits, totalAttacks),
    baseTotalDamage: contribution.baseDamage,
    landedBaseDamage: contribution.landedBaseDamage,
    avoidanceDamageDelta: contribution.landedBaseDamage - contribution.baseDamage,
    damageAfterDefense: contribution.damageAfterDefense,
    defenseDamageDelta: contribution.damageAfterDefense - contribution.landedBaseDamage,
    defenseMitigationPercent: reductionPercent(contribution.landedBaseDamage, contribution.damageAfterDefense),
    armorPenetrationPercent: weightedPenetration(entries),
    directDamage: contribution.damage,
    totalDamage: contribution.damage + contribution.conditionDamage,
    elementalDamageDelta: contribution.damage - contribution.damageAfterDefense,
    elementalModifierPercent: modifierPercent(contribution.damageAfterDefense, contribution.damage),
    totalHealing: contribution.healing,
    totalDamagePrevented: contribution.prevented,
    totalCriticalHits: contribution.criticalHits,
    totalConditionApplications: contribution.conditionApplications,
    totalConditionTicks: contribution.conditionTicks,
    totalConditionDamage: contribution.conditionDamage,
    conditionDamagePercent,
    slowUptimePercent,
    conditionAttackBonusPercent,
    conditionRiskReductionPercent,
    conditions,
    incomingConditionAttempts: incomingConditionDefense.attempts,
    incomingConditionApplications: incomingConditionDefense.applications,
    incomingConditionPrevented: incomingConditionDefense.prevented,
    incomingConditionsCleansed: incomingConditionDefense.cleansed,
    incomingConditionTicks: incomingConditionDefense.ticks,
    incomingConditionDamage: incomingConditionDefense.damage,
    incomingSlowUptimePercent: incomingConditionDefense.slowUptimePercent,
    conditionProtectionUptimePercent: incomingConditionDefense.protectionUptimePercent,
    averageConditionProtectionPercent: incomingConditionDefense.averageProtectionPercent,
    conditionDefenseRiskReductionPercent: incomingConditionDefense.riskReductionPercent,
    incomingConditions: incomingConditionDefense.conditions,
    damagePerMinute: perMinute(contribution.damage + contribution.conditionDamage, durationMinutes),
    healingPerMinute: perMinute(contribution.healing, durationMinutes),
    entries,
    timeline: {
      durationMs: rotation.timeline.durationMs,
      totalEvents: rotation.timeline.totalEvents,
      omittedEvents: Math.max(0, rotation.timeline.totalEvents - timelineEvents.length),
      totalHits: contribution.hits,
      totalMisses: contribution.misses,
      totalDodges: contribution.dodges,
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
  const rotations = new Map(characters.map((character) => [
    character.id,
    simulateCombatSkillRotation(character, character.currentAction, elapsedMs),
  ]));
  const attackTargets = normalizeTargets(options.attackTargets);
  const threat = calculateBossThreat(
    characters,
    options.partyRoles ?? {},
    elapsedMs,
    attackTargets,
    options.bossPhases,
  );
  const bossInterrupts = planBossInterrupts(
    characters.map((character) => ({ character, rotation: rotations.get(character.id)! })),
    threat.abilityCasts,
    elapsedMs,
  );
  const interruptedCastIds = new Set(bossInterrupts.filter((entry) => entry.interrupted).map((entry) => entry.castId));
  const dodgeEligibleCasts = threat.abilityCasts.filter((cast) => !interruptedCastIds.has(cast.castId));
  const bossTelegraphDodges = planBossTelegraphDodges(characters, dodgeEligibleCasts, elapsedMs);
  const bossDodgeTradeOffs = calculateBossDodgeTradeOffs(characters, dodgeEligibleCasts, bossTelegraphDodges);
  const dodgedCastIds = new Set(bossTelegraphDodges.filter((entry) => entry.dodged).map((entry) => entry.castId));
  const resolvedAbilityCasts = dodgeEligibleCasts.filter((cast) => !dodgedCastIds.has(cast.castId));
  const pressureSegmentsByCharacterId = Object.fromEntries(characters.map((character) => [
    character.id,
    threat.phases.map((phase) => ({
      phaseId: phase.phaseId,
      startPercent: phase.startPercent,
      endPercent: phase.endPercent,
      incomingAttacks: phase.members.find((member) => member.characterId === character.id)?.incomingAttacks ?? 0,
      incomingDamageMultiplier: phase.incomingDamageMultiplier,
      conditionChanceMultiplier: phase.conditionChanceMultiplier,
      phaseConditionCasts: phase.specialAbility?.conditionAttack
        ? phase.abilityCasts
          .filter((cast) => cast.targetCharacterId === character.id && !interruptedCastIds.has(cast.castId) && !dodgedCastIds.has(cast.castId))
          .map((cast) => ({
            castId: cast.castId,
            abilityId: cast.abilityId,
            abilityName: cast.abilityName,
            telegraphStartsAtMs: cast.telegraphStartsAtMs,
            occurredAtMs: cast.resolvesAtMs,
            targetCharacterId: cast.targetCharacterId!,
            targetCharacterName: cast.targetCharacterName!,
            conditionAttack: phase.specialAbility!.conditionAttack!,
          }))
        : undefined,
    })),
  ]));
  const partyConditionDefense = calculatePartyIncomingConditionDefense(
    characters.map((character) => ({
      character,
      rotation: rotations.get(character.id)!,
      targets: attackTargets,
      incomingAttackCount: threat.members.find((member) => member.characterId === character.id)?.incomingAttacks,
      incomingDamageMultiplier: threat.members.find((member) => member.characterId === character.id)?.incomingDamageMultiplier,
      conditionChanceMultiplier: threat.members.find((member) => member.characterId === character.id)?.conditionChanceMultiplier,
      pressureSegments: pressureSegmentsByCharacterId[character.id],
    })),
    elapsedMs,
    resolvedAbilityCasts,
  );
  const members = characters.map((character) => {
    const effects = calculateCombatSkillEffects(character, character.currentAction, elapsedMs, {
      ...options,
      supportTargets,
      incomingAttackCountOverride: threat.members.find((member) => member.characterId === character.id)?.incomingAttacks,
      incomingDamageMultiplierOverride: threat.members.find((member) => member.characterId === character.id)?.incomingDamageMultiplier,
      incomingConditionChanceMultiplierOverride: threat.members.find((member) => member.characterId === character.id)?.conditionChanceMultiplier,
      incomingPressureSegmentsOverride: pressureSegmentsByCharacterId[character.id],
    }, partyConditionDefense.profilesByCharacterId[character.id]);
    const positioningBonus = bossDodgeTradeOffs.find((entry) => entry.characterId === character.id)?.offensiveBonusPercent ?? 0;
    return {
      characterId: character.id,
      characterName: character.name,
      effects: {
        ...effects,
        attackBonusPercent: rounded(Math.min(10, effects.attackBonusPercent + positioningBonus)),
        entries: effects.entries.map((entry) => ({
          ...entry,
          conditionsCleansed: partyConditionDefense.cleansedBySourceSkillKey[`${character.id}::${entry.skillId}`] ?? 0,
          conditionProtectionUptimeSeconds: partyConditionDefense.protectionUptimeSecondsBySourceSkillKey[`${character.id}::${entry.skillId}`] ?? 0,
        })),
      },
    };
  });
  const divisor = Math.max(1, members.length);
  const positioningAttackBonusPercent = rounded(bossDodgeTradeOffs.reduce((sum, entry) => sum + entry.offensiveBonusPercent, 0) / divisor);
  const totalAttacks = members.reduce((sum, member) => sum + member.effects.totalAttacks, 0);
  const totalHits = members.reduce((sum, member) => sum + member.effects.totalHits, 0);
  const totalMisses = members.reduce((sum, member) => sum + member.effects.totalMisses, 0);
  const totalDodges = members.reduce((sum, member) => sum + member.effects.totalDodges, 0);
  const baseTotalDamage = members.reduce((sum, member) => sum + member.effects.baseTotalDamage, 0);
  const landedBaseDamage = members.reduce((sum, member) => sum + member.effects.landedBaseDamage, 0);
  const damageAfterDefense = members.reduce((sum, member) => sum + member.effects.damageAfterDefense, 0);
  const directDamage = members.reduce((sum, member) => sum + member.effects.directDamage, 0);
  const totalDamage = members.reduce((sum, member) => sum + member.effects.totalDamage, 0);
  const incomingAttacks = members.reduce((sum, member) => sum + member.effects.incomingAttacks, 0);
  const blockedAttacks = members.reduce((sum, member) => sum + member.effects.blockedAttacks, 0);
  const incomingDamage = members.reduce((sum, member) => sum + member.effects.incomingDamage, 0);
  const blockedDamage = members.reduce((sum, member) => sum + member.effects.blockedDamage, 0);
  const totalConditionApplications = members.reduce((sum, member) => sum + member.effects.totalConditionApplications, 0);
  const totalConditionTicks = members.reduce((sum, member) => sum + member.effects.totalConditionTicks, 0);
  const totalConditionDamage = members.reduce((sum, member) => sum + member.effects.totalConditionDamage, 0);
  const conditions = aggregatePartyConditions(members);
  const incomingConditions = aggregatePartyIncomingConditions(members);

  return {
    attackBonusPercent: rounded(members.reduce((sum, member) => sum + member.effects.attackBonusPercent, 0) / divisor),
    deathRiskReductionPercent: rounded(members.reduce((sum, member) => sum + member.effects.deathRiskReductionPercent, 0) / divisor),
    dodgeRiskReductionPercent: rounded(members.reduce((sum, member) => sum + member.effects.dodgeRiskReductionPercent, 0) / divisor),
    blockRiskReductionPercent: rounded(members.reduce((sum, member) => sum + member.effects.blockRiskReductionPercent, 0) / divisor),
    blockChancePercent: weightedMemberMetric(members, "blockChancePercent", "incomingAttacks"),
    blockMitigationPercent: weightedMemberMetric(members, "blockMitigationPercent", "blockedAttacks"),
    incomingAttacks,
    blockedAttacks,
    blockRatePercent: ratePercent(blockedAttacks, incomingAttacks),
    incomingDamage,
    blockedDamage,
    damageTakenAfterBlock: incomingDamage - blockedDamage,
    blockDamageReductionPercent: reductionPercent(incomingDamage, incomingDamage - blockedDamage),
    totalCasts: members.reduce((sum, member) => sum + member.effects.totalCasts, 0),
    manaSpent: members.reduce((sum, member) => sum + member.effects.manaSpent, 0),
    totalAttacks,
    totalHits,
    totalMisses,
    totalDodges,
    hitRatePercent: ratePercent(totalHits, totalAttacks),
    baseTotalDamage,
    landedBaseDamage,
    avoidanceDamageDelta: landedBaseDamage - baseTotalDamage,
    damageAfterDefense,
    defenseDamageDelta: damageAfterDefense - landedBaseDamage,
    defenseMitigationPercent: reductionPercent(landedBaseDamage, damageAfterDefense),
    armorPenetrationPercent: weightedPartyPenetration(members),
    directDamage,
    totalDamage,
    elementalDamageDelta: members.reduce((sum, member) => sum + member.effects.elementalDamageDelta, 0),
    elementalModifierPercent: modifierPercent(damageAfterDefense, directDamage),
    totalHealing: members.reduce((sum, member) => sum + member.effects.totalHealing, 0),
    totalDamagePrevented: members.reduce((sum, member) => sum + member.effects.totalDamagePrevented, 0),
    totalCriticalHits: members.reduce((sum, member) => sum + member.effects.totalCriticalHits, 0),
    totalConditionApplications,
    totalConditionTicks,
    totalConditionDamage,
    conditionDamagePercent: positiveModifierPercent(directDamage, totalDamage),
    slowUptimePercent: rounded(members.reduce((sum, member) => sum + member.effects.slowUptimePercent, 0) / divisor),
    conditionAttackBonusPercent: rounded(members.reduce((sum, member) => sum + member.effects.conditionAttackBonusPercent, 0) / divisor),
    conditionRiskReductionPercent: rounded(members.reduce((sum, member) => sum + member.effects.conditionRiskReductionPercent, 0) / divisor),
    conditions,
    incomingConditionAttempts: members.reduce((sum, member) => sum + member.effects.incomingConditionAttempts, 0),
    incomingConditionApplications: members.reduce((sum, member) => sum + member.effects.incomingConditionApplications, 0),
    incomingConditionPrevented: members.reduce((sum, member) => sum + member.effects.incomingConditionPrevented, 0),
    incomingConditionsCleansed: members.reduce((sum, member) => sum + member.effects.incomingConditionsCleansed, 0),
    incomingConditionTicks: members.reduce((sum, member) => sum + member.effects.incomingConditionTicks, 0),
    incomingConditionDamage: members.reduce((sum, member) => sum + member.effects.incomingConditionDamage, 0),
    incomingSlowUptimePercent: rounded(members.reduce((sum, member) => sum + member.effects.incomingSlowUptimePercent, 0) / divisor),
    conditionProtectionUptimePercent: rounded(members.reduce((sum, member) => sum + member.effects.conditionProtectionUptimePercent, 0) / divisor),
    averageConditionProtectionPercent: weightedMemberMetric(members, "averageConditionProtectionPercent", "incomingConditionAttempts"),
    conditionDefenseRiskReductionPercent: rounded(members.reduce((sum, member) => sum + member.effects.conditionDefenseRiskReductionPercent, 0) / divisor),
    incomingConditions,
    conditionSupportContributions: partyConditionDefense.contributions,
    bossDefensiveResponses: partyConditionDefense.responses,
    bossInterrupts,
    bossTelegraphDodges,
    bossDodgeTradeOffs,
    positioningAttackBonusPercent,
    threat,
    members,
  };
}

export function formatCombatSkillEffectLog(effects: CombatSkillEffectSummary) {
  const resisted = effects.conditions.reduce((sum, condition) => sum + condition.resisted, 0);
  const immune = effects.conditions.reduce((sum, condition) => sum + condition.immuneHits, 0);
  const conditionEligibleHits = effects.conditions.reduce((sum, condition) => sum + condition.eligibleHits, 0);
  const averageConditionPenetration = conditionEligibleHits > 0
    ? rounded(effects.conditions.reduce((sum, condition) => sum + condition.averageResistancePenetrationPercent * condition.eligibleHits, 0) / conditionEligibleHits)
    : 0;
  const conditionReport = effects.conditions.length > 0
    ? ` Conditions: ${effects.totalConditionApplications.toLocaleString("en-US")} applied, ${resisted.toLocaleString("en-US")} resisted, ${immune.toLocaleString("en-US")} immune, ${effects.totalConditionTicks.toLocaleString("en-US")} ticks, ${effects.totalConditionDamage.toLocaleString("en-US")} damage, ${averageConditionPenetration}% resistance penetration${effects.slowUptimePercent > 0 ? `, ${effects.slowUptimePercent}% slow uptime` : ""}.`
    : " Conditions: no eligible hits.";
  const incomingConditionReport = effects.incomingConditionAttempts > 0
    ? ` Condition defense: ${effects.incomingConditionApplications}/${effects.incomingConditionAttempts} applied, ${effects.incomingConditionPrevented} prevented, ${effects.incomingConditionsCleansed} cleansed, ${effects.incomingConditionDamage.toLocaleString("en-US")} residual damage, ${effects.averageConditionProtectionPercent}% protection at ${effects.conditionProtectionUptimePercent}% uptime.`
    : effects.conditionProtectionUptimePercent > 0 ? ` Condition defense: no hostile condition attempts, ${effects.averageConditionProtectionPercent}% protection at ${effects.conditionProtectionUptimePercent}% uptime.` : "";
  return `Skill effects: +${effects.attackBonusPercent}% clear speed, -${effects.deathRiskReductionPercent}% death risk, -${effects.supplyReductionPercent}% supplies. Combat report: ${effects.totalDamage.toLocaleString("en-US")} damage (${effects.totalConditionDamage.toLocaleString("en-US")} conditions, -${effects.defenseMitigationPercent}% defense, ${formatSignedPercent(effects.elementalModifierPercent)} elemental, ${effects.armorPenetrationPercent}% penetration), ${effects.totalHits.toLocaleString("en-US")}/${effects.totalAttacks.toLocaleString("en-US")} hits, ${effects.totalMisses.toLocaleString("en-US")} misses, ${effects.totalDodges.toLocaleString("en-US")} dodged, ${effects.totalCriticalHits.toLocaleString("en-US")} critical hits.${conditionReport} Defense report: ${effects.blockedAttacks.toLocaleString("en-US")}/${effects.incomingAttacks.toLocaleString("en-US")} blocks, ${effects.blockedDamage.toLocaleString("en-US")} damage blocked (${effects.blockDamageReductionPercent}% reduction).${incomingConditionReport}`;
}

function calculateAttackResolution(
  character: Character,
  action: CharacterAction | undefined,
  skillId: string,
  category: "attack" | "support",
  damageType: CombatSkillEffectSummary["entries"][number]["damageType"],
  baseTotal: number,
  casts: number,
  criticalProfile: CriticalProfile,
  skillArmorPenetrationPercent: number,
  skillConditionResistancePenetrationPercent: number,
  condition: CombatConditionDefinition | undefined,
  elapsedMs: number,
  options: CombatSkillEffectOptions,
) {
  let landedBaseDamage = 0;
  let damageAfterDefense = 0;
  let damage = 0;
  let hits = 0;
  let misses = 0;
  let dodges = 0;
  let criticalHits = 0;
  let conditionApplications = 0;
  let conditionTicks = 0;
  let conditionDamage = 0;
  let conditionUptimeSeconds = 0;
  let conditionEligibleHits = 0;
  let conditionResisted = 0;
  let conditionImmuneHits = 0;
  let conditionResistanceTotal = 0;
  let conditionResistancePenetrationTotal = 0;
  let conditionEffectiveResistanceTotal = 0;
  let conditionEffectiveChanceTotal = 0;
  if (category !== "attack") return { landedBaseDamage, damageAfterDefense, damage, hits, misses, dodges, criticalHits, conditionApplications, conditionTicks, conditionDamage, conditionUptimeSeconds, conditionEligibleHits, conditionResisted, conditionImmuneHits, conditionResistanceTotal, conditionResistancePenetrationTotal, conditionEffectiveResistanceTotal, conditionEffectiveChanceTotal };
  const armorPenetrationPercent = getArmorPenetrationPercent(character, skillArmorPenetrationPercent);
  const conditionResistancePenetrationPercent = getConditionResistancePenetrationPercent(character, skillConditionResistancePenetrationPercent);
  for (let skillCastIndex = 1; skillCastIndex <= casts; skillCastIndex += 1) {
    const target = getEventTarget(character, action, category, { skillId, skillCastIndex }, options);
    const baseDamage = damageContributionAtCast(baseTotal, casts, skillCastIndex, criticalProfile);
    const outcome = getAttackOutcome(character, target, skillId, skillCastIndex);
    if (outcome === "miss") {
      misses += 1;
      continue;
    }
    if (outcome === "dodged") {
      dodges += 1;
      continue;
    }
    hits += 1;
    landedBaseDamage += baseDamage;
    const defendedDamage = applyTargetDefense(baseDamage, target, armorPenetrationPercent);
    damageAfterDefense += defendedDamage;
    const dealtDamage = applyElementalModifier(defendedDamage, target, damageType);
    damage += dealtDamage;
    const occurredAtMs = casts <= 0 ? 0 : (skillCastIndex - 1) / casts * Math.max(0, elapsedMs);
    const conditionResult = calculateConditionAtCast(
      character.id,
      target,
      skillId,
      skillCastIndex,
      condition,
      conditionResistancePenetrationPercent,
      dealtDamage,
      Math.max(0, elapsedMs - occurredAtMs),
    );
    conditionApplications += conditionResult.applied ? 1 : 0;
    conditionTicks += conditionResult.ticks;
    conditionDamage += conditionResult.damage;
    conditionUptimeSeconds += conditionResult.durationSeconds;
    conditionEligibleHits += conditionResult.eligible ? 1 : 0;
    conditionResisted += conditionResult.outcome === "resisted" ? 1 : 0;
    conditionImmuneHits += conditionResult.outcome === "immune" ? 1 : 0;
    conditionResistanceTotal += conditionResult.eligible ? conditionResult.resistancePercent : 0;
    conditionResistancePenetrationTotal += conditionResult.eligible ? conditionResult.resistancePenetrationPercent : 0;
    conditionEffectiveResistanceTotal += conditionResult.eligible ? conditionResult.effectiveResistancePercent : 0;
    conditionEffectiveChanceTotal += conditionResult.eligible ? conditionResult.effectiveChancePercent : 0;
    if (isCriticalCast(criticalProfile, skillCastIndex)) criticalHits += 1;
  }
  conditionDamage = Math.min(conditionDamage, Math.round(damage * MAX_CONDITION_DAMAGE_PERCENT / 100));
  return { landedBaseDamage, damageAfterDefense, damage, hits, misses, dodges, criticalHits, conditionApplications, conditionTicks, conditionDamage, conditionUptimeSeconds, conditionEligibleHits, conditionResisted, conditionImmuneHits, conditionResistanceTotal, conditionResistancePenetrationTotal, conditionEffectiveResistanceTotal, conditionEffectiveChanceTotal };
}

interface ConditionCastResult {
  applied: boolean;
  eligible: boolean;
  outcome: CombatConditionOutcome;
  ticks: number;
  damage: number;
  durationSeconds: number;
  potencyPercent: number;
  resistancePercent: number;
  resistancePenetrationPercent: number;
  effectiveResistancePercent: number;
  baseChancePercent: number;
  effectiveChancePercent: number;
}

function calculateConditionAtCast(
  characterId: string,
  target: CombatSkillTarget,
  skillId: string,
  skillCastIndex: number,
  condition: CombatConditionDefinition | undefined,
  resistancePenetrationPercent: number,
  directDamage: number,
  remainingMs: number,
): ConditionCastResult {
  const empty: ConditionCastResult = {
    applied: false,
    eligible: false,
    outcome: "none",
    ticks: 0,
    damage: 0,
    durationSeconds: 0,
    potencyPercent: 0,
    resistancePercent: 0,
    resistancePenetrationPercent: 0,
    effectiveResistancePercent: 0,
    baseChancePercent: 0,
    effectiveChancePercent: 0,
  };
  if (!condition || directDamage <= 0) return empty;
  const baseChancePercent = rounded(boundedValue(condition.applicationChancePercent, 0, 100, 0));
  const resistancePercent = rounded(boundedValue(target.conditionResistances?.[condition.type], -50, 80, 0));
  const normalizedPenetrationPercent = rounded(boundedValue(resistancePenetrationPercent, 0, 40, 0));
  const effectiveResistancePercent = resistancePercent > 0
    ? rounded(Math.max(0, resistancePercent - normalizedPenetrationPercent))
    : resistancePercent;
  const immune = Array.isArray(target.conditionImmunities) && target.conditionImmunities.includes(condition.type);
  const effectiveChancePercent = immune ? 0 : rounded(Math.min(100, Math.max(0, baseChancePercent * (1 - effectiveResistancePercent / 100))));
  const profile = { ...empty, eligible: true, resistancePercent, resistancePenetrationPercent: normalizedPenetrationPercent, effectiveResistancePercent, baseChancePercent, effectiveChancePercent };
  if (immune) return { ...profile, outcome: "immune" };
  const roll = deterministicPercent(`${characterId}:${target.id}:${skillId}:${skillCastIndex}:${condition.type}:condition`);
  const applied = roll < effectiveChancePercent;
  if (!applied) {
    const resisted = resistancePercent > 0 && roll < baseChancePercent;
    return { ...profile, outcome: resisted ? "resisted" : "failed" };
  }
  const configuredDuration = boundedValue(condition.durationSeconds, 0, 60, 0);
  const durationSeconds = rounded(Math.min(configuredDuration, Math.max(0, remainingMs) / 1_000));
  if (durationSeconds <= 0) return { ...profile, outcome: "failed" };
  const potencyPercent = boundedValue(condition.potencyPercent, 0, 60, 0);
  if (condition.type === "slow") {
    return { ...profile, applied: true, outcome: "applied", ticks: 0, damage: 0, durationSeconds, potencyPercent };
  }
  const tickIntervalSeconds = boundedValue(condition.tickIntervalSeconds, 0.5, 30, 1);
  const ticks = Math.max(0, Math.floor(durationSeconds / tickIntervalSeconds));
  const damagePercentPerTick = boundedValue(condition.damagePercentPerTick, 0, 10, 0);
  const rawDamage = directDamage * damagePercentPerTick * ticks / 100;
  const damage = Math.round(Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Number.isFinite(rawDamage) ? rawDamage : 0)));
  return { ...profile, applied: true, outcome: "applied", ticks, damage, durationSeconds, potencyPercent };
}

function aggregateConditions(
  entries: CombatSkillEffectSummary["entries"],
  durationMinutes: number,
): CombatConditionSummary[] {
  return (["burn", "poison", "slow"] as const).flatMap((type) => {
    const matching = entries.filter((entry) => entry.conditionType === type);
    const eligibleHits = matching.reduce((sum, entry) => sum + entry.conditionEligibleHits, 0);
    const applications = matching.reduce((sum, entry) => sum + entry.conditionApplications, 0);
    if (eligibleHits <= 0) return [];
    const uptimeSeconds = matching.reduce((sum, entry) => sum + entry.conditionUptimeSeconds, 0);
    const potencyWeight = matching.reduce((sum, entry) => sum + entry.conditionUptimeSeconds * entry.conditionPotencyPercent, 0);
    return [{
      type,
      applications,
      ticks: matching.reduce((sum, entry) => sum + entry.conditionTicks, 0),
      damage: matching.reduce((sum, entry) => sum + entry.conditionDamage, 0),
      uptimePercent: rounded(Math.min(100, uptimeSeconds / Math.max(1, durationMinutes * 60) * 100)),
      potencyPercent: uptimeSeconds > 0 ? rounded(potencyWeight / uptimeSeconds) : 0,
      eligibleHits,
      resisted: matching.reduce((sum, entry) => sum + entry.conditionResisted, 0),
      immuneHits: matching.reduce((sum, entry) => sum + entry.conditionImmuneHits, 0),
      averageResistancePercent: rounded(matching.reduce((sum, entry) => sum + entry.conditionResistanceTotal, 0) / eligibleHits),
      averageResistancePenetrationPercent: rounded(matching.reduce((sum, entry) => sum + entry.conditionResistancePenetrationTotal, 0) / eligibleHits),
      averageEffectiveResistancePercent: rounded(matching.reduce((sum, entry) => sum + entry.conditionEffectiveResistanceTotal, 0) / eligibleHits),
      averageEffectiveChancePercent: rounded(matching.reduce((sum, entry) => sum + entry.conditionEffectiveChanceTotal, 0) / eligibleHits),
    }];
  });
}

function aggregatePartyConditions(
  members: CombatSkillPartyEffectSummary["members"],
): CombatConditionSummary[] {
  return (["burn", "poison", "slow"] as const).flatMap((type) => {
    const matching = members.flatMap((member) => member.effects.conditions.filter((condition) => condition.type === type));
    const eligibleHits = matching.reduce((sum, condition) => sum + condition.eligibleHits, 0);
    const applications = matching.reduce((sum, condition) => sum + condition.applications, 0);
    if (eligibleHits <= 0) return [];
    const uptimeWeight = matching.reduce((sum, condition) => sum + condition.uptimePercent, 0);
    return [{
      type,
      applications,
      ticks: matching.reduce((sum, condition) => sum + condition.ticks, 0),
      damage: matching.reduce((sum, condition) => sum + condition.damage, 0),
      uptimePercent: rounded(matching.reduce((sum, condition) => sum + condition.uptimePercent, 0) / Math.max(1, members.length)),
      potencyPercent: uptimeWeight > 0
        ? rounded(matching.reduce((sum, condition) => sum + condition.potencyPercent * condition.uptimePercent, 0) / uptimeWeight)
        : 0,
      eligibleHits,
      resisted: matching.reduce((sum, condition) => sum + condition.resisted, 0),
      immuneHits: matching.reduce((sum, condition) => sum + condition.immuneHits, 0),
      averageResistancePercent: rounded(matching.reduce((sum, condition) => sum + condition.averageResistancePercent * condition.eligibleHits, 0) / eligibleHits),
      averageResistancePenetrationPercent: rounded(matching.reduce((sum, condition) => sum + condition.averageResistancePenetrationPercent * condition.eligibleHits, 0) / eligibleHits),
      averageEffectiveResistancePercent: rounded(matching.reduce((sum, condition) => sum + condition.averageEffectiveResistancePercent * condition.eligibleHits, 0) / eligibleHits),
      averageEffectiveChancePercent: rounded(matching.reduce((sum, condition) => sum + condition.averageEffectiveChancePercent * condition.eligibleHits, 0) / eligibleHits),
    }];
  });
}

function aggregatePartyIncomingConditions(
  members: CombatSkillPartyEffectSummary["members"],
): CombatSkillPartyEffectSummary["incomingConditions"] {
  return (["burn", "poison", "slow"] as const).flatMap((type) => {
    const matching = members.flatMap((member) => member.effects.incomingConditions.filter((condition) => condition.type === type));
    const attempts = matching.reduce((sum, condition) => sum + condition.attempts, 0);
    if (attempts <= 0) return [];
    return [{
      type,
      attempts,
      applications: matching.reduce((sum, condition) => sum + condition.applications, 0),
      prevented: matching.reduce((sum, condition) => sum + condition.prevented, 0),
      cleansed: matching.reduce((sum, condition) => sum + condition.cleansed, 0),
      ticks: matching.reduce((sum, condition) => sum + condition.ticks, 0),
      damage: matching.reduce((sum, condition) => sum + condition.damage, 0),
      uptimePercent: rounded(matching.reduce((sum, condition) => sum + condition.uptimePercent, 0) / Math.max(1, members.length)),
    }];
  });
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

function getAttackOutcome(
  character: Character,
  target: CombatSkillTarget,
  skillId: string,
  skillCastIndex: number,
): "hit" | "miss" | "dodged" {
  const accuracyPercent = boundedValue(character.attributes?.accuracyPercent, 80, 100, 90);
  const accuracyRoll = deterministicPercent(`${character.id}:${skillId}:${skillCastIndex}:accuracy`);
  if (accuracyRoll >= accuracyPercent) return "miss";

  const evasionPercent = boundedValue(target.evasionPercent, 0, 25, 0);
  const evasionRoll = deterministicPercent(`${character.id}:${target.id}:${skillId}:${skillCastIndex}:evasion`);
  return evasionRoll < evasionPercent ? "dodged" : "hit";
}

function deterministicPercent(value: string) {
  return stableHash(value) % 10_000 / 100;
}

function calculateDefenseProfile(
  character: Character,
  durationMinutes: number,
  options: CombatSkillEffectOptions,
) {
  const targets = normalizeTargets(options.attackTargets);
  const blockChancePercent = boundedValue(character.attributes?.blockChancePercent, 0, 35, 0);
  const blockMitigationPercent = boundedValue(character.attributes?.blockMitigationPercent, 20, 55, 20);
  if (targets.length === 0) {
    return {
      blockRiskReductionPercent: 0,
      blockChancePercent,
      blockMitigationPercent,
      incomingAttacks: 0,
      blockedAttacks: 0,
      blockRatePercent: 0,
      incomingDamage: 0,
      blockedDamage: 0,
      damageTakenAfterBlock: 0,
      blockDamageReductionPercent: 0,
    };
  }

  const incomingAttacks = Number.isFinite(options.incomingAttackCountOverride)
    ? Math.max(0, Math.floor(options.incomingAttackCountOverride ?? 0))
    : calculateIncomingAttackCount(durationMinutes * 60_000, targets);
  let blockedAttacks = 0;
  let incomingDamage = 0;
  let blockedDamage = 0;
  const incomingDamageMultiplier = boundedValue(options.incomingDamageMultiplierOverride, 0.75, 1.5, 1);
  const pressureSegments = normalizeDefensePressureSegments(
    options.incomingPressureSegmentsOverride,
    incomingAttacks,
    incomingDamageMultiplier,
  );
  let attackIndex = 0;

  for (const segment of pressureSegments) {
    for (let localIndex = 0; localIndex < segment.incomingAttacks; localIndex += 1) {
      attackIndex += 1;
      const target = targets[stableHash(`${character.id}:${attackIndex}:incoming-target`) % targets.length];
      const targetLevel = boundedValue(target.level, 1, 500, 1);
      const minDamage = boundedValue(target.minDamage, 0, 1_000_000, targetLevel * 2);
      const maxDamage = Math.max(minDamage, boundedValue(target.maxDamage, 0, 1_000_000, targetLevel * 4));
      const rolledDamage = minDamage + (maxDamage - minDamage) * deterministicPercent(`${character.id}:${target.id}:${attackIndex}:incoming-damage`) / 100;
      const rawDamage = Math.round(rolledDamage * segment.incomingDamageMultiplier);
      incomingDamage += rawDamage;
      if (deterministicPercent(`${character.id}:${target.id}:${attackIndex}:block`) >= blockChancePercent) continue;
      blockedAttacks += 1;
      blockedDamage += Math.round(rawDamage * blockMitigationPercent / 100);
    }
  }

  const damageTakenAfterBlock = incomingDamage - blockedDamage;
  const blockDamageReductionPercent = reductionPercent(incomingDamage, damageTakenAfterBlock);
  return {
    blockRiskReductionPercent: boundedPercent(blockDamageReductionPercent * 0.5, 5),
    blockChancePercent: rounded(blockChancePercent),
    blockMitigationPercent: rounded(blockMitigationPercent),
    incomingAttacks,
    blockedAttacks,
    blockRatePercent: ratePercent(blockedAttacks, incomingAttacks),
    incomingDamage,
    blockedDamage,
    damageTakenAfterBlock,
    blockDamageReductionPercent,
  };
}

function normalizeDefensePressureSegments(
  segments: BossIncomingPressureSegment[] | undefined,
  incomingAttacks: number,
  fallbackDamageMultiplier: number,
) {
  const valid = (segments ?? []).filter((segment) => (
    Number.isFinite(segment.incomingAttacks)
    && segment.incomingAttacks >= 0
    && Number.isFinite(segment.incomingDamageMultiplier)
  ));
  const allocatedAttacks = valid.reduce((sum, segment) => sum + Math.floor(segment.incomingAttacks), 0);
  if (valid.length > 0 && allocatedAttacks === incomingAttacks) {
    return valid.map((segment) => ({
      incomingAttacks: Math.floor(segment.incomingAttacks),
      incomingDamageMultiplier: boundedValue(segment.incomingDamageMultiplier, 0.75, 1.5, 1),
    }));
  }
  return [{
    incomingAttacks,
    incomingDamageMultiplier: fallbackDamageMultiplier,
  }];
}

function getArmorPenetrationPercent(character: Character, skillBonus: number) {
  const base = boundedValue(character.attributes?.armorPenetrationPercent, 0, 25, 0);
  const bonus = boundedValue(skillBonus, 0, 20, 0);
  return rounded(Math.min(40, base + bonus));
}

function getConditionResistancePenetrationPercent(character: Character, skillBonus: number) {
  const base = boundedValue(character.attributes?.conditionResistancePenetrationPercent, 0, 30, 0);
  const bonus = boundedValue(skillBonus, 0, 20, 0);
  return rounded(Math.min(40, base + bonus));
}

function applyTargetDefense(
  baseDamage: number,
  target: CombatSkillTarget,
  armorPenetrationPercent: number,
) {
  if (baseDamage <= 0) return 0;
  const armor = boundedValue(target.armor, 0, 2_000, 0);
  const defense = boundedValue(target.defense, 0, 5_000, 0);
  const protectionScore = armor * 2 + defense;
  const rawMitigationPercent = Math.min(40, protectionScore / (protectionScore + 300) * 100);
  const effectiveMitigationPercent = rawMitigationPercent * (1 - boundedValue(armorPenetrationPercent, 0, 40, 0) / 100);
  return Math.round(baseDamage * (1 - effectiveMitigationPercent / 100));
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

function avoidanceEffectiveness(baseDamage: number, landedBaseDamage: number) {
  if (baseDamage <= 0) return 1;
  const value = landedBaseDamage / baseDamage;
  return Number.isFinite(value) ? Math.min(1, Math.max(0.5, value)) : 1;
}

function defenseEffectiveness(landedBaseDamage: number, damageAfterDefense: number) {
  if (landedBaseDamage <= 0) return 1;
  const value = damageAfterDefense / landedBaseDamage;
  return Number.isFinite(value) ? Math.min(1, Math.max(0.6, value)) : 1;
}

function reductionPercent(baseDamage: number, adjustedDamage: number) {
  if (baseDamage <= 0) return 0;
  return rounded(Math.min(100, Math.max(0, (1 - adjustedDamage / baseDamage) * 100)));
}

function weightedPenetration(entries: CombatSkillEffectSummary["entries"]) {
  const totalWeight = entries.reduce((sum, entry) => sum + entry.landedBaseDamageDealt, 0);
  if (totalWeight <= 0) return 0;
  return rounded(entries.reduce(
    (sum, entry) => sum + entry.armorPenetrationPercent * entry.landedBaseDamageDealt,
    0,
  ) / totalWeight);
}

function weightedPartyPenetration(members: CombatSkillPartyEffectSummary["members"]) {
  const totalWeight = members.reduce((sum, member) => sum + member.effects.landedBaseDamage, 0);
  if (totalWeight <= 0) return 0;
  return rounded(members.reduce(
    (sum, member) => sum + member.effects.armorPenetrationPercent * member.effects.landedBaseDamage,
    0,
  ) / totalWeight);
}

function weightedMemberMetric(
  members: CombatSkillPartyEffectSummary["members"],
  valueKey: "blockChancePercent" | "blockMitigationPercent" | "averageConditionProtectionPercent",
  weightKey: "incomingAttacks" | "blockedAttacks" | "incomingConditionAttempts",
) {
  const totalWeight = members.reduce((sum, member) => sum + member.effects[weightKey], 0);
  if (totalWeight <= 0) {
    return rounded(members.reduce((sum, member) => sum + member.effects[valueKey], 0) / Math.max(1, members.length));
  }
  return rounded(members.reduce(
    (sum, member) => sum + member.effects[valueKey] * member.effects[weightKey],
    0,
  ) / totalWeight);
}

function modifierPercent(baseDamage: number, adjustedDamage: number) {
  if (baseDamage <= 0) return 0;
  return rounded((adjustedDamage / baseDamage - 1) * 100);
}

function positiveModifierPercent(baseDamage: number, adjustedDamage: number) {
  return Math.max(0, modifierPercent(baseDamage, adjustedDamage));
}

function ratePercent(value: number, total: number) {
  if (total <= 0) return 100;
  return rounded(Math.min(100, Math.max(0, value / total * 100)));
}

function boundedValue(value: unknown, minimum: number, maximum: number, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : fallback;
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
