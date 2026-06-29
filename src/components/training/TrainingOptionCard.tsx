import { SKILL_LABELS } from "../../shared/constants";
import type { TrainingOption } from "../../data/trainingOptions";
import type { TrainingTarget } from "../../shared/types";

interface TrainingOptionCardProps {
  option: TrainingOption;
  targetSkill: TrainingTarget;
  expectedGain: number;
  disabled: boolean;
  onStart: () => void;
}

export function TrainingOptionCard({
  option,
  targetSkill,
  expectedGain,
  disabled,
  onStart,
}: TrainingOptionCardProps) {
  return (
    <article className="training-option-card">
      <div>
        <h3>{option.label}</h3>
        <p>{SKILL_LABELS[targetSkill]} / {option.durationMinutes} min</p>
      </div>
      <div className="training-option-stats">
        <span>{option.cost.toLocaleString("en-US")} gold</span>
        <strong>+{expectedGain}%</strong>
      </div>
      <button disabled={disabled} onClick={onStart} type="button">
        Iniciar
      </button>
    </article>
  );
}
