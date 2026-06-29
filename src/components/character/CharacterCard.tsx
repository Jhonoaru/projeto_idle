import type { Character } from "../../shared/types";
import { getMainSkill } from "../../game-engine/character/getMainSkill";
import { CHARACTER_STATUS_LABELS, SKILL_LABELS } from "../../shared/constants";

interface CharacterCardProps {
  character: Character;
  isSelected: boolean;
  onSelect: () => void;
}

export function CharacterCard({
  character,
  isSelected,
  onSelect,
}: CharacterCardProps) {
  const mainSkill = getMainSkill(character);
  const isBusy = character.status !== "idle" && character.status !== "dead";

  return (
    <button
      className={`character-card ${isSelected ? "is-selected" : ""} ${
        isBusy ? "is-busy" : "is-idle"
      }`.trim()}
      onClick={onSelect}
      type="button"
    >
      <span className="card-topline">
        <span className="card-name">{character.name}</span>
        <span className="status-dot" aria-label={isBusy ? "Busy" : "Idle"} />
      </span>
      <span className="card-meta">{character.vocation} / Lv {character.level}</span>
      <span className="card-meta">{character.city}</span>
      <span className="card-footer">
        <strong>
          {SKILL_LABELS[mainSkill.name]} {mainSkill.level}
        </strong>
        <small>{CHARACTER_STATUS_LABELS[character.status]}</small>
      </span>
      <span className="stamina-line">
        <span>Stamina</span>
        <strong>{character.staminaHours}h</strong>
      </span>
    </button>
  );
}
