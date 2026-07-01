import type { Character } from "../../shared/types";
import { getClockElapsedMs } from "../../shared/time";

export function experienceForLevel(level: number) {
  if (level <= 1) return 0;

  return Math.floor((50 * level ** 3 - 150 * level ** 2 + 400 * level) / 3);
}

export function experienceToNextLevel(character: Pick<Character, "level" | "experience">) {
  return Math.max(0, experienceForLevel(character.level + 1) - character.experience);
}

export function getLevelProgressPercent(
  character: Pick<Character, "level" | "experience">,
  experience = character.experience,
) {
  const currentLevelXp = experienceForLevel(character.level);
  const nextLevelXp = experienceForLevel(character.level + 1);
  const levelSpan = nextLevelXp - currentLevelXp;

  if (levelSpan <= 0) return 0;

  // Older mock saves can have level and total XP out of sync; keep their bar useful.
  if (experience < currentLevelXp) {
    return Math.min(100, Math.max(0, (experience / Math.max(1, nextLevelXp)) * 100));
  }

  return Math.min(
    100,
    Math.max(0, ((experience - currentLevelXp) / levelSpan) * 100),
  );
}

export function getEstimatedExperiencePreview(character: Character) {
  const action = character.currentAction;

  if (
    !action ||
    !["hunting", "training", "questing", "bossing"].includes(action.type) ||
    !action.expectedXp ||
    action.expectedXp <= 0
  ) {
    return {
      isEstimated: false,
      actionProgressPercent: 0,
      estimatedXpGained: 0,
      previewExperience: character.experience,
      levelProgressPercent: getLevelProgressPercent(character),
    };
  }

  const totalMs = Math.max(1, (action.durationMinutes ?? 1) * 60_000);
  const elapsedMs = getClockElapsedMs(action.startedAt);
  const actionProgress = Math.min(1, Math.max(0, elapsedMs / totalMs));
  const estimatedXpGained = Math.round(action.expectedXp * actionProgress);
  const previewExperience = character.experience + estimatedXpGained;

  return {
    isEstimated: true,
    actionProgressPercent: Math.round(actionProgress * 100),
    estimatedXpGained,
    previewExperience,
    levelProgressPercent: getLevelProgressPercent(character, previewExperience),
  };
}
