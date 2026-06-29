import { getAccessName } from "../../data/accesses";
import type { Boss, BossStatus } from "../../shared/types";

interface BossCardProps {
  boss: Boss;
  status: BossStatus;
  reason?: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function BossCard({ boss, status, reason, isSelected, onSelect }: BossCardProps) {
  const accessText =
    boss.requirements.requiredAccessIds?.map(getAccessName).join(", ") ?? "No access";
  const roleText = boss.requirements.requiredRoles
    ? Object.entries(boss.requirements.requiredRoles)
        .map(([role, amount]) => `${amount} ${role}`)
        .join(", ")
    : "Flexible";

  return (
    <article className={`boss-card boss-${status} ${isSelected ? "is-selected" : ""}`.trim()}>
      <div>
        <div className="boss-title-row">
          <h3>{boss.name}</h3>
          <span className={`risk risk-${boss.risk}`}>{boss.risk}</span>
        </div>
        <p>{boss.description}</p>
        <div className="hunt-meta-grid">
          <span>{boss.city}</span>
          <span>{boss.type}</span>
          <span>Lv {boss.requirements.requiredLevel}</span>
          <span>{boss.durationMinutes} min</span>
          <span>{boss.cooldownHours}h cooldown</span>
          <span>{statusLabel(status)}</span>
          <span>{accessText}</span>
          <span>
            Party {boss.requirements.minPartySize}-{boss.requirements.maxPartySize}
          </span>
          <span>{roleText}</span>
        </div>
        {reason ? <p className="action-block-reason">{reason}</p> : null}
        <div className="tag-list">
          {boss.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <button className="hunt-select-button" onClick={onSelect} type="button">
        Selecionar
      </button>
    </article>
  );
}

function statusLabel(status: BossStatus) {
  if (status === "in_progress") return "In Progress";
  return `${status[0].toUpperCase()}${status.slice(1)}`;
}
