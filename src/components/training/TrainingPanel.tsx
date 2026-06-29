import { useMemo, useState } from "react";
import { trainingOptions } from "../../data/trainingOptions";
import { calculateTrainingGain } from "../../game-engine/progression/calculateTrainingGain";
import { SKILL_LABELS } from "../../shared/constants";
import { TrainingOptionCard } from "./TrainingOptionCard";
import { TrainingResultPanel } from "./TrainingResultPanel";
import type { TrainingResult } from "../../game-services/trainingService";
import type { Character, TrainingTarget } from "../../shared/types";

const trainingTargets: TrainingTarget[] = [
  "sword",
  "axe",
  "club",
  "distance",
  "fist",
  "shielding",
  "magic",
];

interface TrainingPanelProps {
  character: Character;
  lastResult?: TrainingResult;
  onStartTraining: (
    targetSkill: TrainingTarget,
    type: "offline" | "exercise" | "dummy",
    durationMinutes: number,
    cost: number,
  ) => void;
  onFinishTraining: () => void;
}

export function TrainingPanel({
  character,
  lastResult,
  onStartTraining,
  onFinishTraining,
}: TrainingPanelProps) {
  const [targetSkill, setTargetSkill] = useState<TrainingTarget>("sword");
  const isTraining = character.status === "training";
  const currentTrainingSkill = character.currentAction?.targetSkill;
  const selectedSkill = currentTrainingSkill ?? targetSkill;
  const optionsWithGain = useMemo(
    () =>
      trainingOptions.map((option) => ({
        option,
        expectedGain: calculateTrainingGain(
          character,
          selectedSkill,
          option.durationMinutes,
          option.type,
        ),
      })),
    [character, selectedSkill],
  );

  return (
    <div className="training-panel">
      <div className="training-target-row">
        {trainingTargets.map((skillName) => (
          <button
            className={selectedSkill === skillName ? "is-selected" : ""}
            disabled={isTraining}
            key={skillName}
            onClick={() => setTargetSkill(skillName)}
            type="button"
          >
            {SKILL_LABELS[skillName]}
          </button>
        ))}
      </div>

      {isTraining ? (
        <div className="current-training-card">
          <div>
            <span>Training active</span>
            <strong>{character.currentAction?.label}</strong>
            <p>
              {character.currentAction?.startedAt} - {character.currentAction?.endsAt}
            </p>
          </div>
          <button onClick={onFinishTraining} type="button">
            Finalizar Treino Simulado
          </button>
        </div>
      ) : null}

      <div className="training-options-grid">
        {optionsWithGain.map(({ option, expectedGain }) => (
          <TrainingOptionCard
            disabled={isTraining}
            expectedGain={expectedGain}
            key={option.id}
            onStart={() =>
              onStartTraining(
                selectedSkill,
                option.type,
                option.durationMinutes,
                option.cost,
              )
            }
            option={option}
            targetSkill={selectedSkill}
          />
        ))}
      </div>

      <TrainingResultPanel result={lastResult} />
    </div>
  );
}
