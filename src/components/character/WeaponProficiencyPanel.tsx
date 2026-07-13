import { useMemo, useState } from "react";
import { calculateWeaponProficiencyBonuses } from "../../game-engine/weapon-proficiency/calculateWeaponProficiencyBonuses";
import { getEquippedWeaponProficiencyType } from "../../game-engine/weapon-proficiency/getEquippedWeaponProficiencyType";
import {
  WEAPON_PROFICIENCY_LABELS,
  WEAPON_PROFICIENCY_PERKS,
  WEAPON_PROFICIENCY_TYPES,
} from "../../game-engine/weapon-proficiency/weaponProficiencyDefinitions";
import {
  getWeaponProficiencyProgressPercent,
  normalizeWeaponProficiencies,
} from "../../game-engine/weapon-proficiency/weaponProficiencyProgression";
import type { Character, WeaponProficiencyType } from "../../shared/types";

type MasteryFilter = "all" | "equipped" | "melee" | "ranged" | "magic" | "defense";

const masteryCodes: Record<WeaponProficiencyType, string> = {
  sword: "SW",
  axe: "AX",
  club: "CL",
  bow: "BW",
  wand: "WN",
  staff: "ST",
  fist: "FS",
  shield: "SH",
};

const masteryGroups: Record<Exclude<MasteryFilter, "all" | "equipped">, WeaponProficiencyType[]> = {
  melee: ["sword", "axe", "club", "fist"],
  ranged: ["bow"],
  magic: ["wand", "staff"],
  defense: ["shield"],
};

export function WeaponProficiencyPanel({
  character,
  onOpenSkills,
}: {
  character: Character;
  onOpenSkills: () => void;
}) {
  const [filter, setFilter] = useState<MasteryFilter>("all");
  const proficiencies = normalizeWeaponProficiencies(character.weaponProficiencies);
  const bonuses = calculateWeaponProficiencyBonuses(character);
  const activeWeaponType = getEquippedWeaponProficiencyType(character.equipment.weapon);
  const activeShieldType = getEquippedWeaponProficiencyType(character.equipment.offhand);
  const activeTypes = [activeWeaponType, activeShieldType].filter(Boolean) as WeaponProficiencyType[];
  const totalLevels = WEAPON_PROFICIENCY_TYPES.reduce((total, type) => total + proficiencies[type].level, 0);
  const unlockedPerks = WEAPON_PROFICIENCY_TYPES.reduce(
    (total, type) => total + proficiencies[type].unlockedPerkIds.length,
    0,
  );
  const visibleTypes = useMemo(() => {
    if (filter === "all") return WEAPON_PROFICIENCY_TYPES;
    if (filter === "equipped") return WEAPON_PROFICIENCY_TYPES.filter((type) => activeTypes.includes(type));
    return masteryGroups[filter];
  }, [activeTypes, filter]);
  const bonusEntries = Object.entries(bonuses.bonus).filter(([, value]) => value > 0);

  return (
    <div className="mastery-hall">
      <section className="mastery-hall-hero">
        <div className="mastery-hall-crest" aria-hidden="true">
          <span>{activeWeaponType ? masteryCodes[activeWeaponType] : "--"}</span>
          <small>Mastery</small>
        </div>
        <div className="mastery-hall-title">
          <span>{character.vocation} / Weapon discipline</span>
          <h2>{character.name}'s Mastery Hall</h2>
          <p>Weapon use during hunts advances each discipline and unlocks permanent equipment-specific perks.</p>
          <button onClick={onOpenSkills} type="button">Return to Skill Hall</button>
        </div>
        <div className="mastery-hall-summary">
          <MasterySummary label="Main equipment" value={activeWeaponType ? WEAPON_PROFICIENCY_LABELS[activeWeaponType] : "Unarmed"} />
          <MasterySummary label="Offhand" value={activeShieldType === "shield" ? "Shield Mastery" : "No shield"} />
          <MasterySummary label="Combined levels" value={totalLevels.toString()} />
          <MasterySummary label="Unlocked perks" value={unlockedPerks.toString()} />
        </div>
      </section>

      <section className="mastery-hall-active">
        <header>
          <div><span>Active loadout</span><strong>Bonuses applied now</strong></div>
          <em>{bonuses.activePerks.length} active perks</em>
        </header>
        <div className="mastery-hall-active-grid">
          {activeTypes.length > 0 ? activeTypes.map((type) => (
            <div key={type}>
              <span>{masteryCodes[type]}</span>
              <strong>{WEAPON_PROFICIENCY_LABELS[type]}</strong>
              <small>Level {proficiencies[type].level}</small>
            </div>
          )) : <p>Equip a compatible weapon or shield to activate mastery bonuses.</p>}
          <div className="mastery-hall-bonuses">
            {bonusEntries.length > 0
              ? bonusEntries.map(([key, value]) => <span key={key}>{formatBonusName(key)} +{value}%</span>)
              : <span>No active percentage bonus yet</span>}
          </div>
        </div>
      </section>

      <nav className="mastery-hall-filters" aria-label="Mastery filters">
        {(["all", "equipped", "melee", "ranged", "magic", "defense"] as MasteryFilter[]).map((value) => (
          <button className={filter === value ? "is-selected" : ""} key={value} onClick={() => setFilter(value)} type="button">
            {value}
          </button>
        ))}
      </nav>

      <section className="mastery-hall-grid">
        {visibleTypes.length > 0 ? visibleTypes.map((type) => {
          const progress = proficiencies[type];
          const progressPercent = Math.round(getWeaponProficiencyProgressPercent(progress));
          const active = activeTypes.includes(type);

          return (
            <article className={`mastery-path-card ${active ? "is-active" : ""}`.trim()} key={type}>
              <header>
                <span className="mastery-path-code">{masteryCodes[type]}</span>
                <div><small>{active ? "Equipped discipline" : "Weapon discipline"}</small><h3>{WEAPON_PROFICIENCY_LABELS[type]}</h3></div>
                <strong>Lv {progress.level}</strong>
              </header>
              <div className="mastery-path-progress"><i style={{ width: `${progressPercent}%` }} /></div>
              <p>{progressPercent}% to next level / {progress.experience.toLocaleString("en-US")} total XP</p>
              <div className="mastery-path-perks">
                {WEAPON_PROFICIENCY_PERKS[type].map((perk) => {
                  const unlocked = progress.unlockedPerkIds.includes(perk.id);
                  return (
                    <div className={unlocked ? "is-unlocked" : ""} key={perk.id}>
                      <span>{unlocked ? "Unlocked" : `Level ${perk.requiredLevel}`}</span>
                      <strong>{perk.name}</strong>
                      <small>{perk.description}</small>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        }) : <div className="mastery-hall-empty">No equipped mastery is available for the current loadout.</div>}
      </section>
    </div>
  );
}

function MasterySummary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function formatBonusName(value: string) {
  return value.replace(/Percent$/, "").replace(/([A-Z])/g, " $1").trim();
}
