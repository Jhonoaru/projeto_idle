import { Panel } from "../ui/Panel";
import { StatBox } from "../ui/StatBox";
import type { Character } from "../../shared/types";
import { CHARACTER_STATUS_LABELS } from "../../shared/constants";
import { calculateEquipmentBonuses } from "../../game-engine/equipment/calculateEquipmentBonuses";
import { experienceForLevel } from "../../game-engine/progression/experienceTable";
import { getAccessName } from "../../data/accesses";

interface CharacterDetailsProps {
  character: Character;
}

export function CharacterDetails({ character }: CharacterDetailsProps) {
  const equipmentBonuses = calculateEquipmentBonuses(character.equipment);
  const bonusSummary = [
    equipmentBonuses.attack ? `Atk +${equipmentBonuses.attack}` : undefined,
    equipmentBonuses.defense ? `Def +${equipmentBonuses.defense}` : undefined,
    equipmentBonuses.armor ? `Armor +${equipmentBonuses.armor}` : undefined,
    equipmentBonuses.magicPower ? `Magic +${equipmentBonuses.magicPower}` : undefined,
    equipmentBonuses.distancePower ? `Distance +${equipmentBonuses.distancePower}` : undefined,
    equipmentBonuses.fistPower ? `Fist +${equipmentBonuses.fistPower}` : undefined,
    equipmentBonuses.capacityBonus ? `Cap +${equipmentBonuses.capacityBonus}` : undefined,
  ].filter(Boolean);
  const currentLevelXp = experienceForLevel(character.level);
  const nextLevelXp = experienceForLevel(character.level + 1);
  const rawLevelProgress =
    nextLevelXp > currentLevelXp
      ? ((character.experience - currentLevelXp) / (nextLevelXp - currentLevelXp)) *
        100
      : 0;
  const levelProgress = Math.min(100, Math.max(0, Math.round(rawLevelProgress)));

  return (
    <Panel className="details-panel" title="Selected Adventurer">
      <div className="details-header">
        <div>
          <p className="eyebrow">{character.vocation}</p>
          <h2>{character.name}</h2>
          <p>
            Level {character.level} adventurer stationed in {character.city}.
          </p>
        </div>
        <StatBox
          label="Experience"
          value={character.experience.toLocaleString("en-US")}
          detail={`${character.experienceToNextLevel.toLocaleString("en-US")} to next`}
        />
      </div>

      <div className="level-progress-block">
        <div>
          <span>Level {character.level}</span>
          <strong>{levelProgress}%</strong>
        </div>
        <div className="level-progress-track" aria-hidden="true">
          <span style={{ width: `${levelProgress}%` }} />
        </div>
      </div>

      <div className="details-grid">
        <StatBox label="Status" value={CHARACTER_STATUS_LABELS[character.status]} />
        <StatBox label="City" value={character.city} />
        <StatBox label="Stamina" value={`${character.staminaHours}h`} />
        <StatBox
          label="Gold gerado"
          value={character.gold.toLocaleString("en-US")}
          detail="historico"
        />
        <StatBox label="Health" value={character.attributes.maxHealth} />
        <StatBox label="Mana" value={character.attributes.maxMana} />
        <StatBox label="Capacity" value={character.attributes.capacity} />
        <StatBox label="Attack" value={character.attributes.attackPower} />
        <StatBox label="Defense" value={character.attributes.defensePower} />
        <StatBox label="Armor" value={character.attributes.armor} />
        <StatBox
          label="Gear Bonus"
          value={bonusSummary.length > 0 ? bonusSummary.join(" / ") : "None"}
        />
        <StatBox label="Quests Done" value={character.completedQuestIds.length} />
        <StatBox label="Accesses" value={character.accessIds.length} />
        <StatBox
          label="Last Access"
          value={getAccessName(character.accessIds.at(-1)) ?? "None"}
        />
      </div>
    </Panel>
  );
}
