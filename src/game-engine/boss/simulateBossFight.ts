import { getItemById } from "../../data/items";
import { createSeededRandom } from "../hunt/random";
import { applyBossCooldown } from "./applyBossCooldown";
import { calculateBossRisk } from "./calculateBossRisk";
import { calculatePartyCombatSkillEffects } from "../combat-skills/calculateCombatSkillEffects";
import { normalizeBossDodgeBehavior } from "../combat-skills/normalizeCombatSkillLoadout";
import type {
  Boss,
  BossLootResult,
  BossParty,
  BossSimulationResult,
  BossTelegraphDodgeSummary,
  Character,
} from "../../shared/types";

export function simulateBossFight(
  characters: Character[],
  party: BossParty,
  boss: Boss,
): BossSimulationResult {
  const participants = party.members
    .map((member) => characters.find((character) => character.id === member.characterId))
    .filter((character): character is Character => Boolean(character));
  const seed = `${boss.id}-${participants.map((character) => character.id).join("-")}-${Date.now()}`;
  const random = createSeededRandom(seed);
  const combatSkillEffects = calculatePartyCombatSkillEffects(
    participants,
    boss.durationMinutes * 60_000,
    {
      attackTargets: [{ id: boss.id, name: boss.name, kind: "boss", resistances: boss.resistances, conditionResistances: boss.conditionResistances, conditionImmunities: boss.conditionImmunities, conditionAttacks: boss.conditionAttacks, evasionPercent: boss.evasionPercent, armor: boss.armor, defense: boss.defense, level: boss.requirements.requiredLevel, minDamage: boss.minDamage, maxDamage: boss.maxDamage }],
      supportTargets: participants.map((character) => ({
        id: character.id,
        name: character.name,
        kind: "ally",
      })),
      partyRoles: Object.fromEntries(party.members.map((member) => [member.characterId, member.role])),
      bossPhases: boss.phases,
    },
  );
  const risk = calculateBossRisk(characters, party, boss, combatSkillEffects);
  const defeated = random() <= risk.successChance;
  const diedCharacterIds = participants
    .filter((character) => random() <= (risk.deathChanceByCharacterId[character.id] ?? risk.deathChance))
    .map((character) => character.id);
  const goldGained = defeated
    ? randomInt(random, boss.reward.goldMin, boss.reward.goldMax)
    : Math.round(randomInt(random, boss.reward.goldMin, boss.reward.goldMax) * 0.18);
  const experienceGained = defeated
    ? boss.reward.experience
    : Math.round(boss.reward.experience * 0.15);
  const loot = defeated ? rollBossLoot(random, boss) : [];
  const renownGained = defeated ? boss.reward.renown ?? 0 : 0;
  const now = new Date();
  const cooldownsApplied = participants.map((character) => {
    const withCooldown = applyBossCooldown(character, boss, now);
    return withCooldown.bossCooldowns.find((entry) => entry.bossId === boss.id)!;
  });
  const participantNames = participants.map((character) => character.name).join(", ");
  const resistedConditions = combatSkillEffects.conditions.reduce((sum, condition) => sum + condition.resisted, 0);
  const immuneConditions = combatSkillEffects.conditions.reduce((sum, condition) => sum + condition.immuneHits, 0);
  const conditionEligibleHits = combatSkillEffects.conditions.reduce((sum, condition) => sum + condition.eligibleHits, 0);
  const averageConditionPenetration = conditionEligibleHits > 0
    ? rounded(combatSkillEffects.conditions.reduce((sum, condition) => sum + condition.averageResistancePenetrationPercent * condition.eligibleHits, 0) / conditionEligibleHits)
    : 0;
  const sharedConditionSupport = combatSkillEffects.conditionSupportContributions
    .filter((contribution) => contribution.cleansed > 0 || contribution.protectionUptimeSeconds > 0 || contribution.telegraphResponses > 0)
    .map((contribution) => `${contribution.characterName}: ${contribution.telegraphResponses} telegraph responses, ${contribution.cleansed} cleansed, ${Math.round(contribution.protectionUptimeSeconds)}s ward coverage`)
    .join("; ");
  const threatReport = combatSkillEffects.threat.members
    .map((member) => `${member.characterName} (${member.role}) ${member.threatPercent}% / ${member.incomingAttacks} attacks`)
    .join("; ");
  const phaseReport = combatSkillEffects.threat.phases
    .map((phase) => {
      const target = phase.members.find((member) => member.primaryTarget);
      const ability = phase.specialAbility
        ? `, ability ${phase.specialAbility.name}${phase.specialAbility.conditionAttack ? ` [${phase.specialAbility.conditionAttack.type}]` : ""}, ${phase.specialAbility.telegraphProfile} profile at ${phase.specialAbility.dodgeDifficultyPercent}% dodge difficulty, ${phase.abilityCasts.length} casts at ${phase.specialAbility.castTimeSeconds}s / ${phase.specialAbility.cooldownSeconds}s cooldown`
        : "";
      return `${phase.phaseName}: ${target?.characterName ?? "no target"} (${phase.incomingAttacks} attacks, ${phase.attackRateMultiplier}x rate, ${phase.incomingDamageMultiplier}x damage, ${phase.conditionChanceMultiplier}x condition${ability})`;
    })
    .join("; ");
  const logs = [
    `${boss.name} started by ${participantNames}.`,
    defeated ? `${boss.name} was defeated.` : `${boss.name} survived the attempt.`,
    ...diedCharacterIds.map((characterId) => {
      const character = participants.find((candidate) => candidate.id === characterId);
      return `${character?.name ?? "A party member"} morreu durante ${boss.name}.`;
    }),
    ...risk.warnings,
    `Party skill effects: +${combatSkillEffects.attackBonusPercent}% success power, -${combatSkillEffects.deathRiskReductionPercent}% death risk. Combat report: ${combatSkillEffects.totalDamage.toLocaleString("en-US")} damage (${combatSkillEffects.totalConditionDamage.toLocaleString("en-US")} conditions, -${combatSkillEffects.defenseMitigationPercent}% defense, ${combatSkillEffects.armorPenetrationPercent}% penetration, ${combatSkillEffects.elementalModifierPercent > 0 ? "+" : ""}${combatSkillEffects.elementalModifierPercent}% elemental), ${combatSkillEffects.totalHits.toLocaleString("en-US")}/${combatSkillEffects.totalAttacks.toLocaleString("en-US")} hits, ${combatSkillEffects.totalMisses.toLocaleString("en-US")} misses, ${combatSkillEffects.totalDodges.toLocaleString("en-US")} dodged, ${combatSkillEffects.totalCriticalHits.toLocaleString("en-US")} critical hits. Conditions: ${combatSkillEffects.totalConditionApplications.toLocaleString("en-US")} applied, ${resistedConditions.toLocaleString("en-US")} resisted, ${immuneConditions.toLocaleString("en-US")} immune, ${combatSkillEffects.totalConditionTicks.toLocaleString("en-US")} ticks, ${averageConditionPenetration}% resistance penetration${combatSkillEffects.slowUptimePercent > 0 ? `, ${combatSkillEffects.slowUptimePercent}% slow uptime` : ""}. Defense report: ${combatSkillEffects.blockedAttacks.toLocaleString("en-US")}/${combatSkillEffects.incomingAttacks.toLocaleString("en-US")} blocks, ${combatSkillEffects.blockedDamage.toLocaleString("en-US")} damage blocked (${combatSkillEffects.blockDamageReductionPercent}% reduction). Condition defense: ${combatSkillEffects.incomingConditionApplications}/${combatSkillEffects.incomingConditionAttempts} applied, ${combatSkillEffects.incomingConditionPrevented} prevented, ${combatSkillEffects.incomingConditionsCleansed} cleansed, ${combatSkillEffects.incomingConditionDamage.toLocaleString("en-US")} residual damage, ${combatSkillEffects.averageConditionProtectionPercent}% protection at ${combatSkillEffects.conditionProtectionUptimePercent}% uptime.`,
    ...(sharedConditionSupport ? [`Shared condition support: ${sharedConditionSupport}.`] : []),
    ...(combatSkillEffects.bossDefensiveResponses.length > 0 ? [`Automatic Boss responses: ${combatSkillEffects.bossDefensiveResponses.length} telegraphs answered with reserved support casts.`] : []),
    ...(combatSkillEffects.bossInterrupts.length > 0 ? [`Boss interrupts: ${combatSkillEffects.bossInterrupts.filter((entry) => entry.interrupted).length}/${combatSkillEffects.bossInterrupts.length} casts interrupted with reserved attack events.`] : []),
    ...(combatSkillEffects.bossTelegraphDodges.length > 0 ? [`Boss telegraph dodges: ${combatSkillEffects.bossTelegraphDodges.filter((entry) => entry.dodged).length}/${combatSkillEffects.bossTelegraphDodges.length} targeted casts avoided (${formatDodgeProfiles(combatSkillEffects.bossTelegraphDodges)}).`] : []),
    `Boss dodge behaviors: ${participants.map((character) => `${character.name} ${formatDodgeBehavior(normalizeBossDodgeBehavior(character.currentAction?.combatSkillLoadout?.bossDodgeBehavior ?? character.combatSkillLoadout?.bossDodgeBehavior))}`).join("; ")}.`,
    ...(threatReport ? [`Aggro report: ${threatReport}. Tank control ${combatSkillEffects.threat.tankAggroControlPercent}% (-${combatSkillEffects.threat.aggroRiskReductionPercent}% party death risk).`] : []),
    ...(phaseReport ? [`Boss phases: ${phaseReport}. ${combatSkillEffects.threat.targetSwitchCount} target switches.`] : []),
    `Boss loot enviado para o Guild Depot.`,
    ...participants.map(
      (character) => `${character.name} recebeu cooldown de ${boss.cooldownHours}h em ${boss.name}.`,
    ),
  ];

  return {
    success: defeated,
    diedCharacterIds,
    defeated,
    bossId: boss.id,
    bossName: boss.name,
    durationMinutes: boss.durationMinutes,
    experienceGained,
    goldGained,
    loot,
    renownGained,
    cooldownsApplied,
    combatSkillEffects,
    logs,
  };
}

function rollBossLoot(
  random: () => number,
  boss: Boss,
): BossLootResult[] {
  return boss.reward.lootTable.flatMap((lootEntry) => {
    if (random() > lootEntry.chance) return [];

    const item = getItemById(lootEntry.itemId);
    const quantity = randomInt(random, lootEntry.minQuantity, lootEntry.maxQuantity);

    return [
      {
        itemId: item.id,
        itemName: item.name,
        quantity,
        totalValue: quantity * item.value,
        rarity: item.rarity,
        weightTotal: Number((quantity * item.weight).toFixed(2)),
        item,
      },
    ];
  });
}

function randomInt(random: () => number, min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function rounded(value: number) {
  return Number(value.toFixed(2));
}

function formatDodgeProfiles(entries: BossTelegraphDodgeSummary[]) {
  return (["quick", "focused", "heavy"] as const)
    .map((profile) => {
      const attempts = entries.filter((entry) => entry.telegraphProfile === profile);
      const dodged = attempts.filter((entry) => entry.dodged).length;
      return attempts.length > 0 ? `${profile} ${dodged}/${attempts.length}` : "";
    })
    .filter(Boolean)
    .join(", ");
}

function formatDodgeBehavior(value: "automatic" | "safe_windows" | "hold_position" | undefined) {
  return value === "safe_windows" ? "Safe Windows" : value === "hold_position" ? "Hold Position" : "Automatic";
}
