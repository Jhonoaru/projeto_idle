import { getAccessName } from "../../data/accesses";
import type { Character, Quest, QuestStatus } from "../../shared/types";

interface QuestCardProps {
  character: Character;
  quest: Quest;
  status: QuestStatus;
  isCurrent: boolean;
  reason?: string;
  onStart: (quest: Quest) => void;
  onFinish: (quest: Quest) => void;
}

export function QuestCard({
  character,
  quest,
  status,
  isCurrent,
  reason,
  onStart,
  onFinish,
}: QuestCardProps) {
  const unlockedAccess = getAccessName(quest.unlocksAccess);
  const canStart = status === "available" && character.status === "idle";
  const canFinish = status === "in_progress" && isCurrent;
  const statusText = getStatusText(status);
  const blockReason = getQuestBlockReason(character, status, reason);

  return (
    <article className={`quest-card quest-${status}`}>
      <div>
        <div className="quest-title-row">
          <h3>{quest.name}</h3>
          <span className={`risk risk-${quest.risk}`}>{quest.risk}</span>
        </div>
        <p>{quest.description}</p>
        <div className="hunt-meta-grid">
          <span>{quest.city}</span>
          <span>Lv {quest.requiredLevel}</span>
          <span>{quest.totalDurationMinutes} min</span>
          <span>{quest.type}</span>
          <span>{statusText}</span>
          <span>{unlockedAccess ?? "No access"}</span>
        </div>
        <p className={`quest-status-badge quest-status-${status}`}>{statusText}</p>
        {blockReason ? <p className="action-block-reason">{blockReason}</p> : null}
        <div className="tag-list">
          {quest.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <div className="quest-actions">
        <button disabled={!canStart} onClick={() => onStart(quest)} type="button">
          Iniciar Quest
        </button>
        <button disabled={!canFinish} onClick={() => onFinish(quest)} type="button">
          Finalizar Quest
        </button>
      </div>
    </article>
  );
}

function getStatusText(status: QuestStatus) {
  if (status === "in_progress") return "In Progress";
  return `${status[0].toUpperCase()}${status.slice(1)}`;
}

function getQuestBlockReason(
  character: Character,
  status: QuestStatus,
  reason?: string,
) {
  if (status === "completed") {
    return "Este personagem ja completou esta quest.";
  }

  if (status === "locked") {
    return reason ?? "Requisitos pendentes.";
  }

  if (status === "available" && character.status !== "idle") {
    return `${character.name} esta ${character.status} e nao pode iniciar quest.`;
  }

  return undefined;
}
