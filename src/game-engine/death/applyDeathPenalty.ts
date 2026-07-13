import { experienceToNextLevel } from "../progression/experienceTable";
import { createDeathState } from "./createDeathState";
import { getActiveBlessings } from "../../data/blessings";
import { calculateDeathPenalty } from "./calculateDeathPenalty";
import type {
  Character,
  DeathCause,
  HuntRisk,
} from "../../shared/types";

interface ApplyDeathPenaltyInput {
  character: Character;
  guildGold: number;
  risk: HuntRisk;
  cause: DeathCause;
  sourceId?: string;
  sourceName?: string;
  city?: string;
}

export function applyDeathPenalty({
  character,
  guildGold,
  risk,
  cause,
  sourceId,
  sourceName,
  city,
}: ApplyDeathPenaltyInput): { character: Character; goldLost: number; logs: string[] } {
  const activeBlessings = getActiveBlessings(character.blessings);
  const { penalty, recoverySeconds } = calculateDeathPenalty(
    character,
    guildGold,
    risk,
    activeBlessings,
  );
  const deathState = createDeathState({
    cause,
    sourceId,
    sourceName,
    city: city ?? character.city,
    penalty,
    recoverySeconds,
  });
  const consumedBlessingIds = new Set(penalty.consumedBlessingIds ?? []);
  const blessings = (character.blessings ?? []).filter(
    (blessingId) => !consumedBlessingIds.has(blessingId),
  );
  const experience = Math.max(0, character.experience - penalty.experienceLost);
  const updatedCharacter: Character = {
    ...character,
    experience,
    experienceToNextLevel: experienceToNextLevel({ level: character.level, experience }),
    status: "dead",
    currentAction: undefined,
    city: deathState.templeCity,
    deathState,
    blessings,
    deathCount: (character.deathCount ?? 0) + 1,
  };
  const logs = [
    `${character.name} morreu${sourceName ? ` em ${sourceName}` : ""}.`,
    `${character.name} perdeu ${penalty.experienceLost.toLocaleString("en-US")} XP e ${penalty.goldLost.toLocaleString("en-US")} gold.`,
    ...(activeBlessings.length > 0
      ? [`${activeBlessings.map((blessing) => blessing.name).join(", ")} reduziram as penalidades em ${penalty.blessProtectionPercent ?? 0}%.`]
      : []),
    `${character.name} foi levado para ${deathState.templeName}.`,
  ];

  return {
    character: updatedCharacter,
    goldLost: penalty.goldLost,
    logs,
  };
}
