import { calculateCharacterAttributes } from "../game-engine/character/calculateCharacterAttributes";
import { simulateHunt } from "../game-engine/hunt/simulateHunt";
import { addLootToInventory } from "../game-engine/inventory/addLootToInventory";
import { addExperience } from "../game-engine/progression/addExperience";
import { addSkillProgress } from "../game-engine/progression/addSkillProgress";
import type {
  Character,
  CharacterStatus,
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
): Character {
  if (blockedStatuses.includes(character.status)) {
    throw new Error(`${character.name} cannot start a hunt while ${character.status}.`);
  }

  if (hunt.requiredAccess && !character.accessIds.includes(hunt.requiredAccess)) {
    throw new Error(`${character.name} does not have access for ${hunt.name}.`);
  }

  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + durationMinutes * 60_000);

  return {
    ...character,
    status: "hunting",
    currentAction: {
      type: "hunting",
      label: `Hunting at ${hunt.name}`,
      startedAt: formatTime(startedAt),
      endsAt: formatTime(endsAt),
      targetId: hunt.id,
      targetName: hunt.name,
      risk: hunt.risk,
      expectedXp: Math.round((hunt.estimatedXpPerHour / 60) * durationMinutes),
      expectedGold: Math.round((hunt.estimatedGoldPerHour / 60) * durationMinutes),
    },
  };
}

export function finishHunt(
  character: Character,
  hunt: HuntArea,
  durationMinutes: number,
): { character: Character; result: HuntSimulationResult } {
  const result = simulateHunt({ character, hunt, durationMinutes });
  const inventoryResult = addLootToInventory(character, result.lootItems);
  const characterAfterStatus: Character = {
    ...inventoryResult.character,
    gold: Math.max(0, character.gold + result.netProfit),
    status: result.died ? "dead" : "idle",
    currentAction: undefined,
  };
  const experienceResult = addExperience(
    characterAfterStatus,
    result.experienceGained,
  );
  let characterAfterRewards = experienceResult.character;
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
  const resultWithRejectedLoot = {
    ...result,
    rejectedLoot: inventoryResult.rejectedLoot,
    logs: [...result.logs, ...progressionLogs],
  };
  const attributes = calculateCharacterAttributes(characterAfterRewards);

  return {
    character: {
      ...characterAfterRewards,
      attributes,
      capacityMax: attributes.capacity,
    },
    result: resultWithRejectedLoot,
  };
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
