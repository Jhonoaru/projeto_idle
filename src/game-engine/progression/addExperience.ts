import { calculateCharacterAttributes } from "../character/calculateCharacterAttributes";
import { experienceForLevel, experienceToNextLevel } from "./experienceTable";
import type { Character, LevelUpResult } from "../../shared/types";

export function addExperience(character: Character, amount: number) {
  const oldLevel = character.level;
  const experience = character.experience + Math.max(0, Math.round(amount));
  let newLevel = oldLevel;

  while (experience >= experienceForLevel(newLevel + 1)) {
    newLevel += 1;
  }

  const characterWithLevel = {
    ...character,
    level: newLevel,
    experience,
  };
  const attributes = calculateCharacterAttributes(characterWithLevel);
  const updatedCharacter: Character = {
    ...characterWithLevel,
    attributes,
    capacityMax: attributes.capacity,
    experienceToNextLevel: experienceToNextLevel(characterWithLevel),
  };
  const result: LevelUpResult = {
    oldLevel,
    newLevel,
    experienceRemaining: updatedCharacter.experienceToNextLevel,
    levelsGained: newLevel - oldLevel,
  };

  return { character: updatedCharacter, result };
}
