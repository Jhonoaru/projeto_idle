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
      <div className="training-option-heading">
        <span>{option.type}</span>
        <h3>{option.label}</h3>
        <p>{SKILL_LABELS[targetSkill]} / {formatDuration(option.durationMinutes)}</p>
      </div>
      <div className="training-option-stats">
        <div><span>Cost</span><strong>{option.cost > 0 ? `${option.cost.toLocaleString("en-US")}g` : "Free"}</strong></div>
        <div><span>Expected</span><strong>+{expectedGain}%</strong></div>
      </div>
      <button disabled={disabled} onClick={onStart} type="button">
        Start training
      </button>
    </article>
  );
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  return `${minutes / 60}h`;
}
