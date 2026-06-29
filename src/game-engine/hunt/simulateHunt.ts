import { getMainSkill } from "../character/getMainSkill";
import { calculateHuntPower } from "./calculateHuntPower";
import { calculateHuntRisk } from "./calculateHuntRisk";
import { createSeededRandom, randomInt } from "./random";
import { rollLoot } from "./rollLoot";
import type {
  HuntLootResult,
  HuntSimulationInput,
  HuntSimulationResult,
  Monster,
  SkillName,
} from "../../shared/types";

export function simulateHunt({
  character,
  hunt,
  durationMinutes,
}: HuntSimulationInput): HuntSimulationResult {
  const seed = `${character.id}-${hunt.id}-${durationMinutes}-${character.experience}`;
  const random = createSeededRandom(seed);
  const risk = calculateHuntRisk(character, hunt);
  const died = random() < risk.deathChance;
  const effectiveDuration = died
    ? Math.max(5, Math.round(durationMinutes * (0.25 + random() * 0.45)))
    : durationMinutes;
  const durationFactor = effectiveDuration / 60;
  const power = calculateHuntPower(character);
  const levelRatio = character.level / Math.max(1, hunt.recommendedLevel);
  const overLevelXpPenalty = levelRatio > 1.25 ? Math.max(0.62, 1 - (levelRatio - 1.25) * 0.18) : 1;
  const underLevelEfficiency = levelRatio < 1 ? Math.max(0.45, levelRatio) : 1;
  const killBudget = Math.max(
    1,
    Math.round(
      durationFactor *
        58 *
        power.clearSpeed *
        underLevelEfficiency *
        (died ? 0.75 : 1),
    ),
  );
  const killedMonstersByType = distributeKills(hunt.monsters, killBudget, random);
  const killedMonsters = killedMonstersByType.reduce(
    (sum, entry) => sum + entry.kills,
    0,
  );

  const experienceGained = Math.round(
    killedMonstersByType.reduce(
      (sum, entry) => sum + entry.monster.experience * entry.kills,
      0,
    ) * overLevelXpPenalty,
  );
  const goldGained = killedMonstersByType.reduce((sum, entry) => {
    let monsterGold = 0;

    for (let kill = 0; kill < entry.kills; kill += 1) {
      monsterGold += randomInt(random, entry.monster.goldMin, entry.monster.goldMax);
    }

    return sum + monsterGold;
  }, 0);
  const loot = mergeLoot(
    killedMonstersByType.flatMap((entry) =>
      rollLoot(entry.monster, entry.kills, `${seed}-${entry.monster.id}`),
    ),
  );
  const goldLoot = loot.find((item) => item.itemId === "gold-coin");
  const lootItems = loot.filter((item) => item.itemId !== "gold-coin");
  const goldFromLoot = goldLoot?.quantity ?? 0;
  const totalLootValue = lootItems.reduce((sum, item) => sum + item.totalValue, 0);
  const totalLootWeight = Number(
    lootItems.reduce((sum, item) => sum + item.weightTotal, 0).toFixed(2),
  );
  const totalGoldGained = goldGained + goldFromLoot;
  const supplyCost = Math.round(hunt.supplyCostPerHour * durationFactor * (died ? 0.82 : 1));
  const netProfit = totalGoldGained + totalLootValue - supplyCost;
  const mainSkill = getMainSkill(character);
  const skillProgress = calculateSkillProgress(
    mainSkill.name,
    character.vocation,
    killedMonsters,
    durationFactor,
  );

  const logs = [
    `${character.name} hunted in ${hunt.name} for ${effectiveDuration} minutes.`,
    `${character.name} defeated ${killedMonsters} creatures.`,
    `${character.name} gained ${experienceGained.toLocaleString("en-US")} XP.`,
    `${character.name} ${netProfit >= 0 ? "profited" : "lost"} ${Math.abs(
      netProfit,
    ).toLocaleString("en-US")} gold after supplies.`,
    ...lootItems
      .filter((item) => item.rarity !== "common")
      .map((item) => `${character.name} found ${item.itemName} x${item.quantity}.`),
  ];

  if (died) {
    logs.push(
      `${character.name} died in ${hunt.name} after ${effectiveDuration} minutes.`,
    );
  }

  return {
    success: !died,
    died,
    durationMinutes: effectiveDuration,
    killedMonsters,
    experienceGained,
    goldGained: totalGoldGained,
    lootItems,
    totalLootValue,
    totalLootWeight,
    supplyCost,
    netProfit,
    loot: lootItems,
    skillProgress,
    deathReason: died
      ? `${hunt.name} overwhelmed ${character.name} at ${risk.label.toLowerCase()} risk.`
      : undefined,
    logs,
  };
}

function distributeKills(
  monsters: Monster[],
  totalKills: number,
  random: () => number,
) {
  const entries = monsters.map((monster) => ({ monster, kills: 0 }));

  for (let kill = 0; kill < totalKills; kill += 1) {
    const index = Math.floor(random() * monsters.length);
    entries[index].kills += 1;
  }

  return entries;
}

function mergeLoot(loot: HuntLootResult[]) {
  const byItem = new Map<string, HuntLootResult>();

  for (const item of loot) {
    const existing = byItem.get(item.itemId);

    if (!existing) {
      byItem.set(item.itemId, item);
      continue;
    }

    existing.quantity += item.quantity;
    existing.totalValue += item.totalValue;
    existing.weightTotal = Number((existing.weightTotal + item.weightTotal).toFixed(2));
  }

  return [...byItem.values()];
}

function calculateSkillProgress(
  mainSkillName: SkillName,
  vocation: string,
  killedMonsters: number,
  durationFactor: number,
) {
  const mainProgress = Number(
    Math.min(45, killedMonsters * 0.08 + durationFactor * 4).toFixed(2),
  );
  const secondaryProgress = Number(
    Math.min(18, killedMonsters * 0.025 + durationFactor * 1.5).toFixed(2),
  );
  const secondarySkillName: SkillName | undefined =
    vocation === "Arcanist" || vocation === "Warden"
      ? "magic"
      : vocation === "Guardian" || vocation === "Ranger" || vocation === "Monk"
        ? "shielding"
        : undefined;

  return {
    [mainSkillName]: mainProgress,
    ...(secondarySkillName && secondarySkillName !== mainSkillName && secondaryProgress > 0
      ? { [secondarySkillName]: secondaryProgress }
      : {}),
  };
}
