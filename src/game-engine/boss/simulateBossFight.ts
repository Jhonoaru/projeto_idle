import { getItemById } from "../../data/items";
import { createSeededRandom } from "../hunt/random";
import { applyBossCooldown } from "./applyBossCooldown";
import { calculateBossRisk } from "./calculateBossRisk";
import type {
  Boss,
  BossLootResult,
  BossParty,
  BossSimulationResult,
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
  const risk = calculateBossRisk(characters, party, boss);
  const defeated = random() <= risk.successChance;
  const diedCharacterIds = participants
    .filter(() => random() <= risk.deathChance)
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
  const logs = [
    `${boss.name} started by ${participantNames}.`,
    defeated ? `${boss.name} was defeated.` : `${boss.name} survived the attempt.`,
    ...diedCharacterIds.map((characterId) => {
      const character = participants.find((candidate) => candidate.id === characterId);
      return `${character?.name ?? "A party member"} morreu durante ${boss.name}.`;
    }),
    ...risk.warnings,
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
