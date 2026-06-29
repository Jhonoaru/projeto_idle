import type { Boss, Character } from "../../shared/types";

export function applyBossCooldown(character: Character, boss: Boss, defeatedAt = new Date()) {
  const availableAt = new Date(defeatedAt.getTime() + boss.cooldownHours * 60 * 60_000);
  const cooldown = {
    bossId: boss.id,
    characterId: character.id,
    availableAt: availableAt.toISOString(),
    defeatedAt: defeatedAt.toISOString(),
  };

  return {
    ...character,
    bossCooldowns: [
      ...character.bossCooldowns.filter((entry) => entry.bossId !== boss.id),
      cooldown,
    ],
  };
}
