import { CHARACTER_STATUS_LABELS } from "../../shared/constants";
import { formatDuration, getClockRemainingMs } from "../../shared/time";
import type { Character } from "../../shared/types";

interface ActionSummaryCardProps {
  character: Character;
  onViewAction: () => void;
}

export function ActionSummaryCard({ character, onViewAction }: ActionSummaryCardProps) {
  const action = character.currentAction;

  return (
    <div className="action-summary-card">
      <div>
        <span>{CHARACTER_STATUS_LABELS[character.status]}</span>
        <strong>{action?.label ?? "Nenhuma acao em andamento"}</strong>
        <p>
          {action?.targetName
            ? `${action.targetName} - ${formatDuration(getClockRemainingMs(action.endsAt))} restantes`
            : "Escolha uma atividade nas abas correspondentes."}
        </p>
      </div>
      <button onClick={onViewAction} type="button">
        Ver Acao
      </button>
    </div>
  );
}
