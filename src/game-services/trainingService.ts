import { addSkillProgress } from "../game-engine/progression/addSkillProgress";
import { calculateTrainingGain } from "../game-engine/progression/calculateTrainingGain";
import type {
  Character,
  CharacterStatus,
  SkillGainResult,
  TrainingSession,
  TrainingTarget,
  TrainingType,
} from "../shared/types";

const blockedStatuses: CharacterStatus[] = [
  "hunting",
  "questing",
  "bossing",
  "traveling",
  "dead",
  "training",
];

export function startTraining(
  character: Character,
  trainingType: TrainingType,
  targetSkill: TrainingTarget,
  durationMinutes: number,
  cost: number,
  headquartersBonusPercent = 0,
) {
  if (blockedStatuses.includes(character.status)) {
    throw new Error(`${character.name} cannot train while ${character.status}.`);
  }

  const baseGainPercent = calculateTrainingGain(
    character,
    targetSkill,
    durationMinutes,
    trainingType,
  );
  const safeBonusPercent = Number.isFinite(headquartersBonusPercent)
    ? Math.min(25, Math.max(0, Math.floor(headquartersBonusPercent)))
    : 0;
  const expectedGainPercent = Math.round(baseGainPercent * (1 + safeBonusPercent / 100) * 100) / 100;
  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + durationMinutes * 60_000);
  const session: TrainingSession = {
    id: `training-${character.id}-${Date.now()}`,
    characterId: character.id,
    type: trainingType,
    targetSkill,
    startedAt: formatTime(startedAt),
    endsAt: formatTime(endsAt),
    durationMinutes,
    cost,
    expectedGainPercent,
    label: `${formatTrainingType(trainingType)} ${formatSkillName(targetSkill)}`,
  };

  return {
    ...character,
    status: "training" as const,
    currentAction: {
      type: "training" as const,
      label: session.label,
      startedAt: session.startedAt,
      endsAt: session.endsAt,
      durationMinutes,
      trainingType,
      targetSkill,
      cost,
      expectedGainPercent,
    },
  };
}

export function finishTraining(character: Character) {
  const action = character.currentAction;

  if (!action || action.type !== "training" || !action.targetSkill) {
    throw new Error(`${character.name} is not training.`);
  }

  const progressGain =
    action.expectedGainPercent ??
    calculateTrainingGain(
      character,
      action.targetSkill,
      action.durationMinutes ?? 30,
      action.trainingType ?? "offline",
    );
  const skillResult = addSkillProgress(character, action.targetSkill, progressGain);
  const updatedCharacter = {
    ...skillResult.character,
    status: "idle" as const,
    currentAction: undefined,
  };

  return {
    character: updatedCharacter,
    result: {
      skillGain: skillResult.result,
      progressGain,
      cost: action.cost ?? 0,
      durationMinutes: action.durationMinutes ?? 0,
      trainingType: action.trainingType ?? "offline",
      targetSkill: action.targetSkill,
    },
  };
}

export function formatSkillName(skillName: TrainingTarget) {
  if (skillName === "magic") return "Magic Level";
  if (skillName === "distance") return "Distance Fighting";
  return `${skillName[0].toUpperCase()}${skillName.slice(1)} Fighting`;
}

function formatTrainingType(trainingType: TrainingType) {
  if (trainingType === "exercise") return "Exercise Training";
  if (trainingType === "dummy") return "Dummy Training";
  return "Offline Training";
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export interface TrainingResult {
  skillGain: SkillGainResult;
  progressGain: number;
  cost: number;
  durationMinutes: number;
  trainingType: TrainingType;
  targetSkill: TrainingTarget;
}
