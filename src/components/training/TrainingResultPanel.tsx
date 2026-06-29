import { SKILL_LABELS } from "../../shared/constants";
import type { TrainingResult } from "../../game-services/trainingService";

interface TrainingResultPanelProps {
  result?: TrainingResult;
}

export function TrainingResultPanel({ result }: TrainingResultPanelProps) {
  if (!result) return null;

  return (
    <div className="training-result-panel">
      <div className="result-title-row">
        <strong>{SKILL_LABELS[result.targetSkill]}</strong>
        <span>{result.trainingType}</span>
        <em>+{result.progressGain}%</em>
      </div>
      <div className="result-grid">
        <div>
          <span>Old Level</span>
          <strong>{result.skillGain.oldLevel}</strong>
        </div>
        <div>
          <span>New Level</span>
          <strong>{result.skillGain.newLevel}</strong>
        </div>
        <div>
          <span>Progress</span>
          <strong>{result.skillGain.newProgressPercent}%</strong>
        </div>
        <div>
          <span>Cost</span>
          <strong>{result.cost.toLocaleString("en-US")}g</strong>
        </div>
      </div>
    </div>
  );
}
