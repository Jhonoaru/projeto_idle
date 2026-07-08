import { calculateMonsterFocusBonuses } from "../../game-engine/monster-focus/calculateMonsterFocusBonuses";
import type { Character, HuntArea } from "../../shared/types";
import { getAccessName } from "../../data/accesses";

interface HuntCardProps {
  character: Character;
  hunt: HuntArea;
  hasAccess: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

export function HuntCard({ character, hunt, hasAccess, isSelected, onSelect }: HuntCardProps) {
  const estimatedProfit =
    hunt.estimatedGoldPerHour - hunt.supplyCostPerHour;
  const focusBonuses = calculateMonsterFocusBonuses(character, hunt);
  const focusSummary = focusBonuses.applied[0];
  const hasLevel = character.level >= hunt.minLevel;
  const isLocked = !hasAccess || !hasLevel;

  return (
    <article className={`hunt-card ${isSelected ? "is-selected" : ""}`.trim()}>
      <div>
        <div className="hunt-title-row">
          <h3>{hunt.name}</h3>
          <span className={`risk risk-${hunt.risk}`}>{hunt.risk}</span>
        </div>
        <p>{hunt.description}</p>
        <div className="hunt-meta-grid">
          <span>{hunt.city}</span>
          <span>Lv {hunt.recommendedLevel}</span>
          <span>{hunt.estimatedXpPerHour.toLocaleString("en-US")} XP/h</span>
          <span>{hunt.estimatedGoldPerHour.toLocaleString("en-US")} gold/h</span>
          <span>{hunt.supplyCostPerHour.toLocaleString("en-US")} supplies/h</span>
          <span>{estimatedProfit.toLocaleString("en-US")} profit/h</span>
        </div>
        <small>{hunt.monsters.map((monster) => monster.name).join(", ")}</small>
        {focusSummary ? (
          <p className="focus-match-copy">
            Focus Match: {focusSummary.monsterName} / +{focusSummary.effectivePercent}%{" "}
            {focusSummary.bonusType}
          </p>
        ) : null}
        {!hasAccess ? (
          <p className="locked-copy">Requer acesso: {getAccessName(hunt.requiredAccess)}</p>
        ) : null}
        {!hasLevel ? (
          <p className="locked-copy">Requer level {hunt.minLevel}. {character.name} esta no level {character.level}.</p>
        ) : null}
        <div className="tag-list">
          {hunt.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <button
        className="hunt-select-button"
        disabled={isLocked}
        onClick={onSelect}
        type="button"
      >
        {isLocked ? "Bloqueado" : "Iniciar Hunt"}
      </button>
    </article>
  );
}
