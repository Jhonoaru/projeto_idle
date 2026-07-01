import { createInventoryItem } from "../data/inventoryFactory";
import { applyBossCooldown } from "../game-engine/boss/applyBossCooldown";
import { applyDeathPenalty } from "../game-engine/death/applyDeathPenalty";
import { canStartBoss } from "../game-engine/boss/canStartBoss";
import { simulateBossFight } from "../game-engine/boss/simulateBossFight";
import { mergeStackableItems } from "../game-engine/inventory/mergeStackableItems";
import { addExperience } from "../game-engine/progression/addExperience";
import { formatClock } from "../shared/time";
import type {
  Boss,
  BossParty,
  BossSimulationResult,
  Character,
  GuildDepot,
} from "../shared/types";

export function startBoss(characters: Character[], boss: Boss, party: BossParty) {
  const validation = canStartBoss(characters, boss, party);

  if (!validation.canStart) {
    throw new Error(validation.reason ?? `${boss.name} cannot be started.`);
  }

  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + boss.durationMinutes * 60_000);
  const memberIds = party.members.map((member) => member.characterId);
  const participantNames = characters
    .filter((character) => memberIds.includes(character.id))
    .map((character) => character.name);
  const updatedCharacters = characters.map((character) =>
    memberIds.includes(character.id)
      ? {
          ...character,
          status: "bossing" as const,
          currentAction: {
            type: "bossing" as const,
            label: boss.name,
            startedAt: formatClock(startedAt),
            endsAt: formatClock(endsAt),
            durationMinutes: boss.durationMinutes,
            targetId: boss.id,
            targetName: boss.name,
            risk: boss.risk,
            expectedXp: boss.reward.experience,
            expectedGold: boss.reward.goldMax,
            partyMemberIds: memberIds,
            partyMembers: party.members,
          },
        }
      : character,
  );

  return {
    characters: updatedCharacters,
    logs: [
      boss.type === "party"
        ? `Party iniciou ${boss.name} com ${participantNames.join(", ")}.`
        : `${participantNames[0]} iniciou ${boss.name}.`,
    ],
  };
}

export function finishBoss(
  characters: Character[],
  depot: GuildDepot,
  boss: Boss,
  party: BossParty,
  guildGold = 0,
) {
  const result = simulateBossFight(characters, party, boss);
  const participantIds = new Set(party.members.map((member) => member.characterId));
  let remainingGuildGold = guildGold;
  let guildGoldLost = 0;
  const deathPenalties: BossSimulationResult["deathPenalties"] = {};
  const deathLogs: string[] = [];
  const updatedCharacters = characters.map((character) => {
    if (!participantIds.has(character.id)) return character;

    const withExperience = addExperience(character, result.experienceGained);
    const withCooldown = applyBossCooldown(withExperience.character, boss);
    const died = result.diedCharacterIds.includes(character.id);

    if (died) {
      const death = applyDeathPenalty({
        character: withCooldown,
        guildGold: remainingGuildGold,
        risk: boss.risk,
        cause: "boss",
        sourceId: boss.id,
        sourceName: boss.name,
        city: boss.city || character.city,
      });
      remainingGuildGold = Math.max(0, remainingGuildGold - death.goldLost);
      guildGoldLost += death.goldLost;
      deathPenalties[character.id] = death.character.deathState!.penalty;
      deathLogs.push(...death.logs);

      return death.character;
    }

    return {
      ...withCooldown,
      status: "idle" as const,
      currentAction: undefined,
    };
  });
  const updatedDepot = addBossLootToDepot(depot, result);
  const resultWithDeath = {
    ...result,
    deathPenalties,
    logs: [...result.logs, ...deathLogs],
  };

  return {
    characters: updatedCharacters,
    depot: updatedDepot,
    result: resultWithDeath,
    guildRenownGained: result.renownGained,
    guildGoldLost,
    logs: resultWithDeath.logs,
  };
}

export function cancelBoss(characters: Character[], boss: Boss, party: BossParty) {
  const memberIds = new Set(party.members.map((member) => member.characterId));
  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + 10_000);
  const updatedCharacters = characters.map((character) =>
    memberIds.has(character.id) &&
    character.status === "bossing" &&
    character.currentAction?.targetId === boss.id
      ? {
          ...character,
          status: "traveling" as const,
          currentAction: {
            type: "traveling" as const,
            label: `Retornando para ${character.city}`,
            startedAt: formatClock(startedAt),
            endsAt: formatClock(endsAt),
            durationMinutes: 10_000 / 60_000,
            targetName: character.city,
          },
        }
      : character,
  );

  return {
    characters: updatedCharacters,
    logs: [`${boss.name} foi cancelado. Participantes estao retornando.`],
  };
}

function addBossLootToDepot(depot: GuildDepot, result: BossSimulationResult): GuildDepot {
  const lootItems = result.loot.map((loot) =>
    createInventoryItem(loot.itemId, loot.quantity, "guildDepot"),
  );

  return {
    ...depot,
    items: mergeStackableItems([...depot.items, ...lootItems]),
  };
}
