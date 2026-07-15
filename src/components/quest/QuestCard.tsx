import { getAccessName } from "../../data/accesses";
import type { Character, Quest, QuestStatus } from "../../shared/types";

interface QuestCardProps {
  character: Character;
  quest: Quest;
  status: QuestStatus;
  isCurrent: boolean;
  isFeatured?: boolean;
  questCatalog: Quest[];
  reason?: string;
  onStart: (quest: Quest) => void;
  onFinish: (quest: Quest) => void;
}

export function QuestCard({
  character,
  quest,
  status,
  isCurrent,
  isFeatured,
  questCatalog,
  reason,
  onStart,
  onFinish,
}: QuestCardProps) {
  const unlockedAccess = getAccessName(quest.unlocksAccess);
  const canStart = status === "available" && character.status === "idle";
  const canFinish = status === "in_progress" && isCurrent;
  const statusText = getStatusText(status);
  const blockReason = getQuestBlockReason(character, status, reason);
  const requiredQuestNames = (quest.requiredQuestIds ?? []).map(
    (questId) => questCatalog.find((entry) => entry.id === questId)?.name ?? questId,
  );

  return (
    <article className={`quest-card quest-${status} ${isFeatured ? "is-next" : ""}`.trim()}>
      <div>
        <div className="quest-title-row">
          <div>
            <span className="quest-contract-type">{quest.type.replace("_", " ")}</span>
            <h3>{quest.name}</h3>
          </div>
          <span className={`risk risk-${quest.risk}`}>{quest.risk}</span>
        </div>
        <p>{quest.description}</p>
        <div className="hunt-meta-grid">
          <span>{quest.city}</span>
          <span>Lv {quest.requiredLevel}</span>
          <span>{quest.totalDurationMinutes} min</span>
          <span>{quest.steps.length} step{quest.steps.length === 1 ? "" : "s"}</span>
          <span>{statusText}</span>
          <span>{unlockedAccess ?? "No access"}</span>
        </div>
        <p className={`quest-status-badge quest-status-${status}`}>{statusText}</p>
        {blockReason ? <p className="action-block-reason">{blockReason}</p> : null}
        {requiredQuestNames.length > 0 ? (
          <p className="quest-prerequisite">After: {requiredQuestNames.join(" / ")}</p>
        ) : null}
        <div className="quest-reward-strip">
          <span>{quest.rewards.gold?.toLocaleString("en-US") ?? 0}g</span>
          <span>{quest.rewards.experience?.toLocaleString("en-US") ?? 0} XP</span>
          <span>{quest.rewards.renown ?? 0} renown</span>
        </div>
        <div className="tag-list">
          {quest.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <div className="quest-actions">
        {canFinish ? (
          <button onClick={() => onFinish(quest)} type="button">Collect contract</button>
        ) : status === "completed" ? (
          <span className="quest-recorded">Recorded</span>
        ) : (
          <button disabled={!canStart} onClick={() => onStart(quest)} type="button">
            {status === "locked" ? "Requirements pending" : "Start contract"}
          </button>
        )}
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
