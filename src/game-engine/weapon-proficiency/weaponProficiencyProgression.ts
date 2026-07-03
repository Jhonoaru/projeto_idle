import type {
  WeaponProficiencyProgress,
  WeaponProficiencyState,
  WeaponProficiencyType,
} from "../../shared/types";
import {
  WEAPON_PROFICIENCY_MAX_LEVEL,
  WEAPON_PROFICIENCY_PERKS,
  WEAPON_PROFICIENCY_TYPES,
} from "./weaponProficiencyDefinitions";

export function weaponProficiencyExperienceForLevel(level: number) {
  if (level <= 1) return 0;

  return Math.round(80 * (level - 1) ** 2.15 + 120 * (level - 1));
}

export function weaponProficiencyExperienceToNextLevel(
  level: number,
  experience: number,
) {
  if (level >= WEAPON_PROFICIENCY_MAX_LEVEL) return 0;

  return Math.max(0, weaponProficiencyExperienceForLevel(level + 1) - experience);
}

export function getWeaponProficiencyProgressPercent(
  progress?: WeaponProficiencyProgress,
) {
  if (!progress) return 0;
  if (progress.level >= WEAPON_PROFICIENCY_MAX_LEVEL) return 100;

  const currentLevelXp = weaponProficiencyExperienceForLevel(progress.level);
  const nextLevelXp = weaponProficiencyExperienceForLevel(progress.level + 1);
  const span = Math.max(1, nextLevelXp - currentLevelXp);

  return Math.min(
    100,
    Math.max(0, ((progress.experience - currentLevelXp) / span) * 100),
  );
}

export function normalizeWeaponProficiencies(
  state?: Partial<Record<WeaponProficiencyType, Partial<WeaponProficiencyProgress>>> | null,
): WeaponProficiencyState {
  const normalized = {} as WeaponProficiencyState;

  for (const type of WEAPON_PROFICIENCY_TYPES) {
    const source = state?.[type];
    const rawLevel = Number(source?.level ?? 1);
    const level = Math.min(
      WEAPON_PROFICIENCY_MAX_LEVEL,
      Math.max(1, Number.isFinite(rawLevel) ? Math.floor(rawLevel) : 1),
    );
    const rawExperience = Number(source?.experience ?? 0);
    const experience = Math.max(
      0,
      Number.isFinite(rawExperience) ? Math.floor(rawExperience) : 0,
    );
    const allowedPerkIds = new Set(
      WEAPON_PROFICIENCY_PERKS[type]
        .filter((perk) => perk.requiredLevel <= level)
        .map((perk) => perk.id),
    );
    const unlockedPerkIds = Array.from(
      new Set(source?.unlockedPerkIds ?? []),
    ).filter((perkId) => allowedPerkIds.has(perkId));

    for (const perk of WEAPON_PROFICIENCY_PERKS[type]) {
      if (perk.requiredLevel <= level && !unlockedPerkIds.includes(perk.id)) {
        unlockedPerkIds.push(perk.id);
      }
    }

    normalized[type] = {
      type,
      level,
      experience,
      experienceToNextLevel: weaponProficiencyExperienceToNextLevel(level, experience),
      unlockedPerkIds,
    };
  }

  return normalized;
}

export function addWeaponProficiencyXp(
  state: WeaponProficiencyState | undefined,
  type: WeaponProficiencyType,
  amount: number,
) {
  const normalized = normalizeWeaponProficiencies(state);
  const current = normalized[type];
  const xpGain = Math.max(0, Math.round(Number.isFinite(amount) ? amount : 0));
  let level = current.level;
  let experience = current.experience + xpGain;
  const logs: string[] = [];
  const unlockedPerkIds = [...current.unlockedPerkIds];

  while (
    level < WEAPON_PROFICIENCY_MAX_LEVEL &&
    experience >= weaponProficiencyExperienceForLevel(level + 1)
  ) {
    level += 1;
    logs.push(`${labelForType(type)} reached level ${level}.`);

    for (const perk of WEAPON_PROFICIENCY_PERKS[type]) {
      if (perk.requiredLevel === level && !unlockedPerkIds.includes(perk.id)) {
        unlockedPerkIds.push(perk.id);
        logs.push(`Unlocked perk: ${perk.name}.`);
      }
    }
  }

  normalized[type] = {
    type,
    level,
    experience,
    experienceToNextLevel: weaponProficiencyExperienceToNextLevel(level, experience),
    unlockedPerkIds: Array.from(new Set(unlockedPerkIds)),
  };

  return {
    state: normalized,
    xpGain,
    logs,
  };
}

function labelForType(type: WeaponProficiencyType) {
  return `${type[0].toUpperCase()}${type.slice(1)} Mastery`;
}
