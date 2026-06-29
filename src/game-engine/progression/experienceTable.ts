import type { Character } from "../../shared/types";

export function experienceForLevel(level: number) {
  if (level <= 1) return 0;

  return Math.floor((50 * level ** 3 - 150 * level ** 2 + 400 * level) / 3);
}

export function experienceToNextLevel(character: Pick<Character, "level" | "experience">) {
  return Math.max(0, experienceForLevel(character.level + 1) - character.experience);
}
