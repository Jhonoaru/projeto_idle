import type { Character, HuntSimulationResult } from "../../shared/types";
import { getEquippedWeaponProficiencyType } from "./getEquippedWeaponProficiencyType";
import { addWeaponProficiencyXp } from "./weaponProficiencyProgression";

export function applyWeaponProficiencyHuntProgress(
  character: Character,
  result: HuntSimulationResult,
) {
  const mainType = getEquippedWeaponProficiencyType(character.equipment.weapon);
  const shieldType = getEquippedWeaponProficiencyType(character.equipment.offhand);
  const baseXp = calculateProficiencyXp(result);
  let weaponProficiencies = character.weaponProficiencies;
  const logs: string[] = [];

  if (mainType && baseXp > 0) {
    const progress = addWeaponProficiencyXp(weaponProficiencies, mainType, baseXp);
    weaponProficiencies = progress.state;
    logs.push(
      `${character.name} gained ${progress.xpGain} ${formatType(mainType)} XP.`,
      ...progress.logs.map((log) => `${character.name} ${log}`),
    );
  } else if (baseXp > 0) {
    logs.push(`${character.name} gained no weapon mastery XP: no weapon type detected.`);
  }

  if (shieldType === "shield" && baseXp > 0) {
    const shieldXp = Math.max(1, Math.round(baseXp * 0.35));
    const progress = addWeaponProficiencyXp(weaponProficiencies, "shield", shieldXp);
    weaponProficiencies = progress.state;
    logs.push(
      `${character.name} gained ${progress.xpGain} Shield Mastery XP.`,
      ...progress.logs.map((log) => `${character.name} ${log}`),
    );
  }

  return {
    character: {
      ...character,
      weaponProficiencies,
    },
    logs,
  };
}

function calculateProficiencyXp(result: HuntSimulationResult) {
  const xpFromCreatures = Math.round((result.killedMonsters ?? 0) * 6);
  const xpFromReward = Math.round(Math.max(0, result.experienceGained) / 90);
  const deathMultiplier = result.died ? 0.65 : 1;

  return Math.max(0, Math.round((xpFromCreatures + xpFromReward) * deathMultiplier));
}

function formatType(type: string) {
  return `${type[0].toUpperCase()}${type.slice(1)} Mastery`;
}
