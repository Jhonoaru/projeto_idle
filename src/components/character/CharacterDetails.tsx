import { useEffect, useState } from "react";
import { Panel } from "../ui/Panel";
import { StatBox } from "../ui/StatBox";
import type { Character } from "../../shared/types";
import { CHARACTER_STATUS_LABELS } from "../../shared/constants";
import { calculateEquipmentBonuses } from "../../game-engine/equipment/calculateEquipmentBonuses";
import { getEstimatedExperiencePreview } from "../../game-engine/progression/experienceTable";
import { getAccessName } from "../../data/accesses";
import { getBlessingById } from "../../data/blessings";

interface CharacterDetailsProps {
  character: Character;
}

export function CharacterDetails({ character }: CharacterDetailsProps) {
  const [, setTick] = useState(0);
  const equipmentBonuses = calculateEquipmentBonuses(character.equipment);
  const hasForgeBonuses = Object.values(character.equipment).some(
    (item) => item && ((item.upgradeLevel ?? 0) > 0 || (item.tier ?? 0) > 0 || (item.imbuements ?? []).length > 0),
  );
  const bonusSummary = [
    equipmentBonuses.attack ? `Atk +${equipmentBonuses.attack}` : undefined,
    equipmentBonuses.defense ? `Def +${equipmentBonuses.defense}` : undefined,
    equipmentBonuses.armor ? `Armor +${equipmentBonuses.armor}` : undefined,
    equipmentBonuses.magicPower ? `Magic +${equipmentBonuses.magicPower}` : undefined,
    equipmentBonuses.distancePower ? `Distance +${equipmentBonuses.distancePower}` : undefined,
    equipmentBonuses.fistPower ? `Fist +${equipmentBonuses.fistPower}` : undefined,
    equipmentBonuses.capacityBonus ? `Cap +${equipmentBonuses.capacityBonus}` : undefined,
  ].filter(Boolean);
  useEffect(() => {
    if (!character.currentAction?.expectedXp) return undefined;

    const interval = window.setInterval(() => setTick((current) => current + 1), 1000);

    return () => window.clearInterval(interval);
  }, [character.currentAction]);

  const xpPreview = getEstimatedExperiencePreview(character);
  const levelProgress = Math.round(xpPreview.levelProgressPercent);
  const activeBlessing = getBlessingById(character.blessings?.[0]);

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
          detail={
            xpPreview.isEstimated
              ? `+${xpPreview.estimatedXpGained.toLocaleString("en-US")} estimated`
              : `${character.experienceToNextLevel.toLocaleString("en-US")} to next`
          }
        />
      </div>

      <div className="level-progress-block">
        <div>
          <span>
            Level {character.level}
            {xpPreview.isEstimated ? " - progresso estimado" : ""}
          </span>
          <strong>{levelProgress}%</strong>
        </div>
        <div className="level-progress-track" aria-hidden="true">
          <span style={{ width: `${levelProgress}%` }} />
        </div>
        {xpPreview.isEstimated ? (
          <p>
            XP atual: {character.experience.toLocaleString("en-US")} / XP estimado nesta acao:
            {" "}+{xpPreview.estimatedXpGained.toLocaleString("en-US")} / Progresso da acao:
            {" "}{xpPreview.actionProgressPercent}%
          </p>
        ) : null}
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
          detail={hasForgeBonuses ? "Includes Forge bonuses" : undefined}
        />
        <StatBox label="Quests Done" value={character.completedQuestIds.length} />
        <StatBox label="Accesses" value={character.accessIds.length} />
        <StatBox label="Deaths" value={character.deathCount ?? 0} />
        <StatBox label="Bless" value={activeBlessing?.name ?? "None"} />
        <StatBox
          label="Last Access"
          value={getAccessName(character.accessIds.at(-1)) ?? "None"}
        />
      </div>
    </Panel>
  );
}
