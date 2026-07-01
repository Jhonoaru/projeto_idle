import { getTempleForCity } from "../../data/temples";
import type {
  CharacterDeathState,
  DeathCause,
  DeathPenalty,
} from "../../shared/types";

interface CreateDeathStateInput {
  cause: DeathCause;
  sourceId?: string;
  sourceName?: string;
  city: string;
  penalty: DeathPenalty;
  recoverySeconds: number;
  diedAt?: Date;
}

export function createDeathState({
  cause,
  sourceId,
  sourceName,
  city,
  penalty,
  recoverySeconds,
  diedAt = new Date(),
}: CreateDeathStateInput): CharacterDeathState {
  const temple = getTempleForCity(city);
  const recoveryEndsAt = new Date(diedAt.getTime() + recoverySeconds * 1_000);

  return {
    diedAt: diedAt.toISOString(),
    cause,
    sourceId,
    sourceName,
    templeCity: temple.city,
    templeName: temple.name,
    recoveryEndsAt: recoveryEndsAt.toISOString(),
    penalty,
  };
}
