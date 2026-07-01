import type { Character } from "../../shared/types";

export function canReviveCharacter(character: Character, now = Date.now()) {
  if (character.status !== "dead" || !character.deathState) return false;
  if (!character.deathState.recoveryEndsAt) return true;

  return new Date(character.deathState.recoveryEndsAt).getTime() <= now;
}

export function reviveCharacter(character: Character) {
  if (!canReviveCharacter(character)) {
    throw new Error("Aguardando recuperacao no templo.");
  }

  return {
    ...character,
    status: "idle" as const,
    currentAction: undefined,
    city: character.deathState?.templeCity ?? character.city,
    deathState: undefined,
  };
}
