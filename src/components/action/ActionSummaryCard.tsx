import { CHARACTER_STATUS_LABELS } from "../../shared/constants";
import { formatDuration, getClockRemainingMs } from "../../shared/time";
import type { Character } from "../../shared/types";

interface ActionSummaryCardProps {
  character: Character;
  onViewAction: () => void;
}

export function ActionSummaryCard({ character, onViewAction }: ActionSummaryCardProps) {
  const action = character.currentAction;
  const isDead = character.status === "dead" && character.deathState;

  return (
    <div className="action-summary-card">
      <div>
        <span>{CHARACTER_STATUS_LABELS[character.status]}</span>
        <strong>
          {isDead ? "Morto" : action?.label ?? "Nenhuma acao em andamento"}
        </strong>
        <p>
          {isDead
            ? `${character.name} aguarda recuperacao em ${character.deathState?.templeName}.`
            : action?.targetName
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
