import { combatSkills } from "../../data/combatSkills";
import type { Character, CharacterAction, CombatSkillRotationSummary } from "../../shared/types";
import { normalizeCombatSkillLoadout } from "./normalizeCombatSkillLoadout";

const GLOBAL_COOLDOWN_MS = 1_500;
const MAX_SIMULATION_MS = 8 * 60 * 60_000;

export function simulateCombatSkillRotation(
  character: Character,
  action: CharacterAction | undefined,
  elapsedMs: number,
): CombatSkillRotationSummary {
  const loadout = normalizeCombatSkillLoadout({
    vocation: character.vocation,
    level: character.level,
    combatSkillLoadout: action?.combatSkillLoadout ?? character.combatSkillLoadout,
  });
  const attacks = loadout.attackSkillIds
    .map((id) => combatSkills.find((skill) => skill.id === id))
    .filter((skill): skill is (typeof combatSkills)[number] => Boolean(skill));
  const support = combatSkills.find((skill) => skill.id === loadout.supportSkillId);
  const duration = Math.min(MAX_SIMULATION_MS, Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0));
  const counts = new Map<string, number>();
  const nextAvailable = new Map<string, number>();
  const manaMax = Math.max(0, Math.floor(character.attributes.maxMana));
  const manaRegenPerMs = Math.max(1, manaMax * 0.02) / 1_000;
  let mana = manaMax;
  let time = 0;
  let lastManaUpdate = 0;
  let attackIndex = 0;
  let supportAvailable = support ? 0 : Number.POSITIVE_INFINITY;
  let activeSkillId: string | undefined;
  let iterations = 0;

  while (attacks.length > 0 && time <= duration && iterations < 20_000) {
    iterations += 1;
    const attack = attacks[attackIndex % attacks.length];
    const attackAvailable = nextAvailable.get(attack.id) ?? 0;
    const supportManaAtAvailability = support
      ? Math.min(manaMax, mana + Math.max(0, supportAvailable - lastManaUpdate) * manaRegenPerMs)
      : 0;
    const useSupport = Boolean(
      support
      && supportAvailable <= attackAvailable
      && supportManaAtAvailability >= support.manaCost,
    );
    const skill = useSupport ? support! : attack;
    const availableAt = useSupport ? supportAvailable : attackAvailable;
    time = Math.max(time, availableAt);
    mana = Math.min(manaMax, mana + Math.max(0, time - lastManaUpdate) * manaRegenPerMs);
    lastManaUpdate = time;
    if (mana < skill.manaCost) {
      const waitMs = (skill.manaCost - mana) / manaRegenPerMs;
      time += waitMs;
      mana = Math.min(manaMax, mana + waitMs * manaRegenPerMs);
      lastManaUpdate = time;
    }
    if (time > duration) break;

    mana = Math.max(0, mana - skill.manaCost);
    counts.set(skill.id, (counts.get(skill.id) ?? 0) + 1);
    nextAvailable.set(skill.id, time + skill.cooldownSeconds * 1_000);
    activeSkillId = skill.id;
    if (useSupport) supportAvailable = time + skill.cooldownSeconds * 1_000;
    else attackIndex = (attackIndex + 1) % attacks.length;
    time += GLOBAL_COOLDOWN_MS;
  }

  const allSkills = support ? [...attacks, support] : attacks;
  const cooldownRemainingMs = Object.fromEntries(allSkills.map((skill) => [
    skill.id,
    Math.max(0, Math.ceil((nextAvailable.get(skill.id) ?? 0) - duration)),
  ]));
  const casts = allSkills.map((skill) => ({ skillId: skill.id, casts: counts.get(skill.id) ?? 0 }));
  const manaSpent = casts.reduce((sum, cast) => {
    const skill = allSkills.find((entry) => entry.id === cast.skillId);
    return sum + cast.casts * (skill?.manaCost ?? 0);
  }, 0);

  return {
    casts,
    totalCasts: casts.reduce((sum, cast) => sum + cast.casts, 0),
    manaSpent,
    remainingMana: Math.round(mana),
    activeSkillId,
    nextCastInMs: Math.max(0, Math.ceil(time - duration)),
    cooldownRemainingMs,
  };
}

export function formatCombatSkillRotationLog(character: Character, action: CharacterAction | undefined, elapsedMs: number) {
  const summary = simulateCombatSkillRotation(character, action, elapsedMs);
  return `Skill rotation: ${summary.totalCasts} casts, ${summary.manaSpent} mana cycled.`;
}
