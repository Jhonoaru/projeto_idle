import { useEffect, useState } from "react";
import { getTravelRemainingMs } from "../../game-services/actionService";
import { CHARACTER_STATUS_LABELS, SKILL_LABELS } from "../../shared/constants";
import { formatDuration } from "../../shared/time";
import type { Character } from "../../shared/types";

interface CurrentActionBoxProps {
  character: Character;
  onCancelAction?: () => void;
  onFinishTravel?: () => void;
}

export function CurrentActionBox({
  character,
  onCancelAction,
  onFinishTravel,
}: CurrentActionBoxProps) {
  const action = character.currentAction;
  const [remainingMs, setRemainingMs] = useState(getTravelRemainingMs(character));

  useEffect(() => {
    if (character.status !== "traveling") return undefined;

    setRemainingMs(getTravelRemainingMs(character));
    const interval = window.setInterval(() => {
      setRemainingMs(getTravelRemainingMs(character));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [character]);

  if (!action) {
    return (
      <div className="current-action-box is-idle">
        <div>
          <span>Idle</span>
          <strong>No active action</strong>
        </div>
        <p>{character.name} is waiting for a new assignment.</p>
      </div>
    );
  }

  return (
    <div className="current-action-box is-active">
      <div className="action-heading">
        <span>{CHARACTER_STATUS_LABELS[action.type]}</span>
        <strong>{action.label}</strong>
      </div>

      <div className="action-grid">
        {action.targetName ? <Detail label="Target" value={action.targetName} /> : null}
        <Detail label="Started" value={action.startedAt} />
        <Detail label="Ends" value={action.endsAt} />
        {action.durationMinutes ? (
          <Detail label="Duration" value={`${action.durationMinutes} min`} />
        ) : null}
        {action.trainingType ? <Detail label="Training" value={action.trainingType} /> : null}
        {action.targetSkill ? (
          <Detail label="Skill" value={SKILL_LABELS[action.targetSkill]} />
        ) : null}
        {action.cost ? (
          <Detail label="Cost" value={`${action.cost.toLocaleString("en-US")}g`} />
        ) : null}
        {action.expectedGainPercent ? (
          <Detail label="Expected Gain" value={`+${action.expectedGainPercent}%`} />
        ) : null}
        {action.risk ? <Detail label="Risk" value={action.risk} /> : null}
        {action.expectedXp ? (
          <Detail label="Expected XP" value={action.expectedXp.toLocaleString("en-US")} />
        ) : null}
        {action.expectedGold ? (
          <Detail label="Expected Gold" value={action.expectedGold.toLocaleString("en-US")} />
        ) : null}
        {character.status === "traveling" ? (
          <Detail label="Remaining" value={formatDuration(remainingMs)} />
        ) : null}
      </div>

      {["hunting", "training", "questing", "bossing"].includes(character.status) &&
      onCancelAction ? (
        <button className="action-command-button" onClick={onCancelAction} type="button">
          Cancelar e Retornar
        </button>
      ) : null}

      {character.status === "traveling" && onFinishTravel ? (
        <button className="action-command-button" onClick={onFinishTravel} type="button">
          Finalizar Viagem
        </button>
      ) : null}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
