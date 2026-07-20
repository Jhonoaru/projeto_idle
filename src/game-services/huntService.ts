import { calculateCharacterAttributes } from "../game-engine/character/calculateCharacterAttributes";
import { calculateCharmBonusesForHunt } from "../game-engine/bestiary/calculateCharmBonusesForHunt";
import { calculateDestinyBonuses } from "../game-engine/destiny/calculateDestinyBonuses";
import { calculateActiveImbuementBonuses } from "../game-engine/forge/calculateActiveImbuementBonuses";
import { decrementHuntImbuements } from "../game-engine/forge/removeExpiredImbuements";
import { simulateHunt } from "../game-engine/hunt/simulateHunt";
import { addLootToInventory } from "../game-engine/inventory/addLootToInventory";
import { applyDeathPenalty } from "../game-engine/death/applyDeathPenalty";
import { addExperience } from "../game-engine/progression/addExperience";
import { addSkillProgress } from "../game-engine/progression/addSkillProgress";
import { calculateSupplyUsage } from "../game-engine/supplies/calculateSupplyUsage";
import { checkHuntSupplies } from "../game-engine/supplies/checkHuntSupplies";
import { consumeSupplies } from "../game-engine/supplies/consumeSupplies";
import { calculateMonsterFocusBonuses } from "../game-engine/monster-focus/calculateMonsterFocusBonuses";
import { consumeMonsterFocusCharge } from "../game-engine/monster-focus/consumeMonsterFocusCharge";
import { applyWeaponProficiencyHuntProgress } from "../game-engine/weapon-proficiency/applyWeaponProficiencyHuntProgress";
import {
  calculateWeaponProficiencyBonuses,
  getSupplyReductionForUsage,
} from "../game-engine/weapon-proficiency/calculateWeaponProficiencyBonuses";
import type {
  Character,
  CharacterStatus,
  GuildBestiaryState,
  HuntArea,
  HuntSimulationResult,
  SkillName,
} from "../shared/types";

const blockedStatuses: CharacterStatus[] = [
  "dead",
  "hunting",
  "questing",
  "bossing",
  "training",
  "traveling",
];

export function startHunt(
  character: Character,
  hunt: HuntArea,
  durationMinutes: number,
  guildXpBonusPercent = 0,
): Character {
  if (blockedStatuses.includes(character.status)) {
    throw new Error(`${character.name} cannot start a hunt while ${character.status}.`);
  }

  if (hunt.requiredAccess && !character.accessIds.includes(hunt.requiredAccess)) {
    throw new Error(`${character.name} does not have access for ${hunt.name}.`);
  }

  if (character.level < hunt.minLevel) {
    throw new Error(`${character.name} precisa estar no level ${hunt.minLevel} para iniciar ${hunt.name}.`);
  }

  const supplyCheck = checkHuntSupplies(character, hunt, durationMinutes);

  if (!supplyCheck.hasRequiredSupplies) {
    throw new Error(
      `Supplies insuficientes: ${supplyCheck.missingSupplies
        .map((entry) => `faltam ${entry.missingQuantity} ${entry.itemName}`)
        .join(", ")}.`,
    );
  }

  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + durationMinutes * 60_000);
  const appliedGuildXpBonus = normalizeGuildBonus(guildXpBonusPercent);

  return {
    ...character,
    status: "hunting",
    currentAction: {
      type: "hunting",
      label: `Hunting at ${hunt.name}`,
      startedAt: formatTime(startedAt),
      endsAt: formatTime(endsAt),
      durationMinutes,
      targetId: hunt.id,
      targetName: hunt.name,
      risk: hunt.risk,
      expectedXp: Math.round(
        (hunt.estimatedXpPerHour / 60) * durationMinutes *
        (1 + appliedGuildXpBonus / 100),
      ),
      guildXpBonusPercent: appliedGuildXpBonus,
      expectedGold: Math.round((hunt.estimatedGoldPerHour / 60) * durationMinutes),
    },
  };
}

export function finishHunt(
  character: Character,
  hunt: HuntArea,
  durationMinutes: number,
  guildGold = 0,
  bestiary?: GuildBestiaryState,
  guildXpBonusPercent = 0,
): { character: Character; result: HuntSimulationResult; guildGoldLost: number } {
  const appliedGuildXpBonus = normalizeGuildBonus(character.currentAction?.guildXpBonusPercent ?? guildXpBonusPercent);
  const charmBonuses = calculateCharmBonusesForHunt(bestiary, hunt);
  const imbuementBonuses = calculateActiveImbuementBonuses(character);
  const proficiencyBonuses = calculateWeaponProficiencyBonuses(character);
  const destinyBonuses = calculateDestinyBonuses(character);
  const focusRiskBonuses = calculateMonsterFocusBonuses(character, hunt);
  const baseResult = simulateHunt({
    character,
    hunt,
    durationMinutes,
    deathRiskMultiplier: charmBonuses.deathRiskMultiplier * focusRiskBonuses.deathRiskMultiplier,
  });
  const result = applyCharmBonusesToResult(baseResult, charmBonuses);
  const focusBonuses = calculateMonsterFocusBonuses(character, hunt, result);
  result.experienceGained = Math.round(
    result.experienceGained *
      (1 + imbuementBonuses.xpBonusPercent / 100) *
      (1 + proficiencyBonuses.bonus.xpBonusPercent / 100) *
      (1 + (destinyBonuses.xpBonusPercent ?? 0) / 100) *
      focusBonuses.experienceMultiplier *
      (1 + appliedGuildXpBonus / 100),
  );
  result.goldGained = Math.round(result.goldGained * (1 + (destinyBonuses.goldBonusPercent ?? 0) / 100) * focusBonuses.goldMultiplier);
  result.totalLootValue = Math.round(result.totalLootValue * (1 + (destinyBonuses.lootBonusPercent ?? 0) / 100) * focusBonuses.lootMultiplier);
  const expectedUsage = calculateSupplyUsage(character, hunt, result.durationMinutes).map((usage) => ({
    ...usage,
    quantityUsed: Math.max(0, Math.ceil(usage.quantityUsed * charmBonuses.supplyMultiplier * focusBonuses.supplyMultiplier * getSupplyMultiplier(character, usage.supplyType, imbuementBonuses.supplyReductionPercent, destinyBonuses.supplyReductionPercent ?? 0))),
    valueUsed: Math.max(0, Math.ceil(usage.valueUsed * charmBonuses.supplyMultiplier * focusBonuses.supplyMultiplier * getSupplyMultiplier(character, usage.supplyType, imbuementBonuses.supplyReductionPercent, destinyBonuses.supplyReductionPercent ?? 0))),
  }));
  const supplyConsumption = consumeSupplies(character, expectedUsage);
  const supplyValueUsed = supplyConsumption.suppliesUsed.reduce(
    (sum, usage) => sum + usage.valueUsed,
    0,
  );
  const inventoryResult = addLootToInventory(supplyConsumption.character, result.lootItems);
  const characterAfterStatus: Character = {
    ...inventoryResult.character,
    status: result.died ? "dead" : "idle",
    currentAction: undefined,
  };
  const experienceResult = addExperience(
    characterAfterStatus,
    result.experienceGained,
  );
  let characterAfterRewards = experienceResult.character;
  const masteryProgress = applyWeaponProficiencyHuntProgress(
    characterAfterRewards,
    result,
  );
  characterAfterRewards = masteryProgress.character;
  const focusConsumption = consumeMonsterFocusCharge(
    characterAfterRewards,
    hunt,
    result,
  );
  characterAfterRewards = focusConsumption.character;
  const imbuementTick = decrementHuntImbuements(characterAfterRewards);
  characterAfterRewards = imbuementTick.character;
  const progressionLogs: string[] = [];

  if (experienceResult.result.levelsGained > 0) {
    progressionLogs.push(
      `${character.name} avancou do level ${experienceResult.result.oldLevel} para o level ${experienceResult.result.newLevel}.`,
    );
  }

  for (const [skillName, progress] of Object.entries(result.skillProgress)) {
    const skillResult = addSkillProgress(
      characterAfterRewards,
      skillName as SkillName,
      progress ?? 0,
    );
    characterAfterRewards = skillResult.character;

    if (skillResult.result.levelsGained > 0) {
      progressionLogs.push(
        `${character.name} avancou em ${formatSkillName(skillName as SkillName)}: ${skillResult.result.oldLevel} -> ${skillResult.result.newLevel}.`,
      );
    } else if ((progress ?? 0) > 0) {
      progressionLogs.push(
        `${character.name} ganhou ${progress}% de progresso em ${formatSkillName(skillName as SkillName)}.`,
      );
    }
  }
  let characterAfterDeath = characterAfterRewards;
  let guildGoldLost = 0;
  let deathLogs: string[] = [];

  if (result.died) {
    const death = applyDeathPenalty({
      character: characterAfterRewards,
      guildGold,
      risk: hunt.risk,
      cause: "hunt",
      sourceId: hunt.id,
      sourceName: hunt.name,
      city: hunt.city || character.city,
    });
    characterAfterDeath = death.character;
    guildGoldLost = death.goldLost;
    deathLogs = death.logs;
  }

  const netProfit = result.goldGained - supplyValueUsed - guildGoldLost;
  const resultWithRejectedLoot = {
    ...result,
    suppliesUsed: supplyConsumption.suppliesUsed,
    supplyCost: supplyValueUsed,
    supplyValueUsed,
    netProfit,
    rejectedLoot: inventoryResult.rejectedLoot,
    deathPenalty: characterAfterDeath.deathState?.penalty,
    charmBonusesApplied: charmBonuses.logs,
    monsterFocusBonusesApplied: focusBonuses.logs,
    logs: [
      ...result.logs,
      ...charmBonuses.logs,
      ...(imbuementBonuses.xpBonusPercent > 0 ? [`Forge bonus applied: +${imbuementBonuses.xpBonusPercent}% XP.`] : []),
      ...(imbuementBonuses.supplyReductionPercent > 0 ? [`Forge bonus applied: -${imbuementBonuses.supplyReductionPercent}% supplies.`] : []),
      ...(proficiencyBonuses.bonus.xpBonusPercent > 0 ? [`Weapon proficiency bonus applied: +${proficiencyBonuses.bonus.xpBonusPercent}% XP.`] : []),
      ...(proficiencyBonuses.bonus.supplyReductionPercent > 0 ? [`Weapon proficiency bonus available: up to -${proficiencyBonuses.bonus.supplyReductionPercent}% supplies by type.`] : []),
      ...formatDestinyLogs(destinyBonuses),
      ...(appliedGuildXpBonus > 0
        ? [`Guild bonus applied: +${appliedGuildXpBonus}% hunt XP.`]
        : []),
      ...focusBonuses.logs,
      ...supplyConsumption.logs,
      ...deathLogs,
      `Hunt finalizada. Ouro liquido apos supplies: ${netProfit >= 0 ? "+" : ""}${netProfit.toLocaleString("en-US")} gold. Loot fica no inventario para venda.`,
      ...progressionLogs,
      ...masteryProgress.logs,
      ...focusConsumption.logs,
      ...imbuementTick.logs,
    ],
  };
  const attributes = calculateCharacterAttributes(characterAfterDeath);

  return {
    character: {
      ...characterAfterDeath,
      attributes,
      capacityMax: attributes.capacity,
    },
    result: resultWithRejectedLoot,
    guildGoldLost,
  };
}

function getSupplyMultiplier(
  character: Character,
  supplyType: string,
  imbuementReductionPercent: number,
  destinyReductionPercent: number,
) {
  const proficiencyReductionPercent = getSupplyReductionForUsage(character, supplyType);
  const totalReductionPercent = Math.min(
    75,
    Math.max(0, imbuementReductionPercent + proficiencyReductionPercent + destinyReductionPercent),
  );

  return Math.max(0, 1 - totalReductionPercent / 100);
}

function formatDestinyLogs(destinyBonuses: ReturnType<typeof calculateDestinyBonuses>) {
  const logs = [];

  if (destinyBonuses.xpBonusPercent) logs.push(`Destiny bonus applied: +${destinyBonuses.xpBonusPercent}% XP.`);
  if (destinyBonuses.goldBonusPercent) logs.push(`Destiny bonus applied: +${destinyBonuses.goldBonusPercent}% gold.`);
  if (destinyBonuses.lootBonusPercent) logs.push(`Destiny bonus applied: +${destinyBonuses.lootBonusPercent}% loot value.`);
  if (destinyBonuses.supplyReductionPercent) logs.push(`Destiny bonus applied: -${destinyBonuses.supplyReductionPercent}% supplies.`);
  if (destinyBonuses.deathRiskReductionPercent) logs.push(`Destiny bonus active: -${destinyBonuses.deathRiskReductionPercent}% death risk.`);

  return logs;
}

function applyCharmBonusesToResult(
  result: HuntSimulationResult,
  charmBonuses: ReturnType<typeof calculateCharmBonusesForHunt>,
): HuntSimulationResult {
  if (charmBonuses.logs.length === 0) return result;

  const experienceGained = Math.round(result.experienceGained * charmBonuses.xpMultiplier);
  const goldGained = Math.round(result.goldGained * charmBonuses.goldMultiplier);
  const totalLootValue = Math.round(result.totalLootValue * charmBonuses.lootMultiplier);

  return {
    ...result,
    experienceGained,
    goldGained,
    totalLootValue,
    netProfit: goldGained,
  };
}

function normalizeGuildBonus(value: number) {
  return Number.isFinite(value) ? Math.min(25, Math.max(0, Math.floor(value))) : 0;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatSkillName(skillName: SkillName) {
  if (skillName === "magic") return "Magic Level";
  if (skillName === "distance") return "Distance Fighting";
  return `${skillName[0].toUpperCase()}${skillName.slice(1)} Fighting`;
}
