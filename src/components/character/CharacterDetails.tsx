import { useEffect, useState } from "react";
import { GuildBriefing } from "./GuildBriefing";
import { ItemIcon } from "../items/ItemIcon";
import { CHARACTER_STATUS_LABELS, SKILL_LABELS } from "../../shared/constants";
import { calculateEquipmentBonuses } from "../../game-engine/equipment/calculateEquipmentBonuses";
import { getActiveCharacterCosmetics } from "../../game-engine/collections/getActiveCharacterCosmetics";
import { calculateDestinyBonuses, formatDestinyBonusSummary } from "../../game-engine/destiny/calculateDestinyBonuses";
import { normalizeDestinyState } from "../../game-engine/destiny/normalizeDestinyState";
import { getMainSkill } from "../../game-engine/character/getMainSkill";
import { getEstimatedExperiencePreview } from "../../game-engine/progression/experienceTable";
import { calculateWeaponProficiencyBonuses } from "../../game-engine/weapon-proficiency/calculateWeaponProficiencyBonuses";
import { getEquippedWeaponProficiencyType } from "../../game-engine/weapon-proficiency/getEquippedWeaponProficiencyType";
import { WEAPON_PROFICIENCY_LABELS } from "../../game-engine/weapon-proficiency/weaponProficiencyDefinitions";
import {
  getWeaponProficiencyProgressPercent,
  normalizeWeaponProficiencies,
} from "../../game-engine/weapon-proficiency/weaponProficiencyProgression";
import { getAccessName } from "../../data/accesses";
import { getActiveBlessings } from "../../data/blessings";
import { calculateBlessingsProtection } from "../../game-engine/death/calculateBlessProtection";
import type { ActivityLogEntry, Character, EquipmentSlot, Guild, Skill } from "../../shared/types";

type CharacterRoute = "action" | "hunts" | "inventory" | "skills" | "proficiency" | "destiny" | "blessings" | "market" | "quests" | "headquarters" | "contracts" | "staff";

interface CharacterDetailsProps {
  character: Character;
  characters: Character[];
  guild: Guild;
  logs: ActivityLogEntry[];
  onOpenTab: (tab: CharacterRoute) => void;
  onSelectCharacter: (characterId: string) => void;
}

const equipmentSlots: Array<{ slot: EquipmentSlot; label: string }> = [
  { slot: "helmet", label: "Helmet" },
  { slot: "amulet", label: "Amulet" },
  { slot: "backpack", label: "Backpack" },
  { slot: "weapon", label: "Weapon" },
  { slot: "armor", label: "Armor" },
  { slot: "offhand", label: "Offhand" },
  { slot: "ring", label: "Ring" },
  { slot: "legs", label: "Legs" },
  { slot: "boots", label: "Boots" },
];

export function CharacterDetails({
  character,
  characters,
  guild,
  logs,
  onOpenTab,
  onSelectCharacter,
}: CharacterDetailsProps) {
  const [, setTick] = useState(0);
  const xpPreview = getEstimatedExperiencePreview(character);
  const levelProgress = Math.round(xpPreview.levelProgressPercent);
  const equipmentBonuses = calculateEquipmentBonuses(character.equipment);
  const weaponProficiencies = normalizeWeaponProficiencies(character.weaponProficiencies);
  const activeWeaponType = getEquippedWeaponProficiencyType(character.equipment.weapon);
  const activeMastery = activeWeaponType ? weaponProficiencies[activeWeaponType] : undefined;
  const masteryBonuses = calculateWeaponProficiencyBonuses(character);
  const destiny = normalizeDestinyState(character);
  const destinyBonuses = calculateDestinyBonuses(character);
  const activeCosmetics = getActiveCharacterCosmetics(character, guild.collections);
  const activeBlessings = getActiveBlessings(character.blessings);
  const blessingProtection = Math.round(calculateBlessingsProtection(activeBlessings) * 100);
  const mainSkill = getMainSkill(character);
  const capacityPercent = Math.min(100, Math.round((character.capacityUsed / Math.max(1, character.capacityMax)) * 100));

  useEffect(() => {
    if (!character.currentAction?.expectedXp) return undefined;
    const interval = window.setInterval(() => setTick((current) => current + 1), 1000);
    return () => window.clearInterval(interval);
  }, [character.currentAction]);

  return (
    <div className="character-hall">
      <section className="character-hall-roster" aria-label="Guild adventurers">
        <div className="character-hall-roster-heading">
          <div>
            <span>Guild Roster</span>
            <strong>{characters.length} adventurers</strong>
          </div>
          <small>Select an adventurer to manage</small>
        </div>
        <div className="character-hall-roster-list">
          {characters.map((candidate) => {
            const candidateMainSkill = getMainSkill(candidate);
            const selected = candidate.id === character.id;
            return (
              <button
                aria-pressed={selected}
                className={`character-hall-roster-card ${selected ? "is-selected" : ""}`.trim()}
                key={candidate.id}
                onClick={() => onSelectCharacter(candidate.id)}
                type="button"
              >
                <span className={`character-hall-status status-${candidate.status}`} />
                <span className="character-hall-roster-avatar">{candidate.name.slice(0, 1).toUpperCase()}</span>
                <span className="character-hall-roster-copy">
                  <strong>{candidate.name}</strong>
                  <small>{candidate.vocation} / Lv {candidate.level}</small>
                  <em>{SKILL_LABELS[candidateMainSkill.name]} {candidateMainSkill.level}</em>
                </span>
                <span className="character-hall-roster-state">{CHARACTER_STATUS_LABELS[candidate.status]}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="character-hall-profile">
        <div className="character-hall-identity">
          <div className="character-hall-portrait">
            <span>{activeCosmetics.avatar?.previewValue ?? character.name.slice(0, 1).toUpperCase()}</span>
            <small>Level {character.level}</small>
          </div>
          <div className="character-hall-title">
            <span>{character.vocation}</span>
            <h2>{character.name}</h2>
            <p>{character.city} / {CHARACTER_STATUS_LABELS[character.status]}</p>
            <small>{activeCosmetics.outfit?.name ?? "No outfit"} / {activeCosmetics.mount?.name ?? "No mount"}</small>
          </div>
          <div className="character-hall-vitals">
            <Vital label="Health" value={character.attributes.maxHealth} tone="health" />
            <Vital label="Mana" value={character.attributes.maxMana} tone="mana" />
            <Vital label="Stamina" value={`${character.staminaHours}h`} tone="stamina" />
          </div>
        </div>

        <div className="character-hall-xp">
          <div>
            <span>Experience</span>
            <strong>{character.experience.toLocaleString("en-US")}</strong>
            <small>{character.experienceToNextLevel.toLocaleString("en-US")} to next level</small>
          </div>
          <div className="character-hall-progress" aria-label={`${levelProgress}% experience progress`}>
            <span style={{ width: `${levelProgress}%` }} />
          </div>
          <strong>{levelProgress}%</strong>
        </div>

        <div className="character-hall-command-row">
          <button onClick={() => onOpenTab(character.currentAction ? "action" : "hunts")} type="button">
            {character.currentAction ? "View Current Action" : "Choose Activity"}
          </button>
          <button onClick={() => onOpenTab("inventory")} type="button">Inventory</button>
          <button onClick={() => onOpenTab("skills")} type="button">Skills</button>
          <button onClick={() => onOpenTab("destiny")} type="button">Destiny</button>
          <button onClick={() => onOpenTab("headquarters")} type="button">Guild Hall</button>
          <button onClick={() => onOpenTab("contracts")} type="button">Contracts</button>
          <button onClick={() => onOpenTab("staff")} type="button">Staff</button>
        </div>
      </section>

      <GuildBriefing character={character} guild={guild} logs={logs} onNavigate={onOpenTab} />

      <div className="character-hall-content">
        <section className="character-hall-section character-hall-overview">
          <SectionHeading label="Combat Overview" detail="Current derived attributes" />
          <div className="character-hall-stat-grid">
            <Stat label="Attack" value={character.attributes.attackPower} />
            <Stat label="Defense" value={character.attributes.defensePower} />
            <Stat label="Armor" value={character.attributes.armor} />
            <Stat label="Capacity" value={`${character.capacityUsed}/${character.capacityMax}`} />
            <Stat label="Crit Chance" value={`${character.attributes.critChancePercent ?? 0}%`} />
            <Stat label="Crit Damage" value={`${character.attributes.critDamagePercent ?? 0}%`} />
          </div>
          <div className="character-hall-capacity">
            <span>Capacity used</span>
            <div><i style={{ width: `${capacityPercent}%` }} /></div>
            <strong>{capacityPercent}%</strong>
          </div>
          <dl className="character-hall-details-list">
            <Detail label="Main skill" value={`${SKILL_LABELS[mainSkill.name]} ${mainSkill.level}`} />
            <Detail
              label="Weapon mastery"
              value={activeWeaponType && activeMastery
                ? `${WEAPON_PROFICIENCY_LABELS[activeWeaponType]} Lv ${activeMastery.level} (${Math.round(getWeaponProficiencyProgressPercent(activeMastery))}%)`
                : "None"}
            />
            <Detail label="Mastery perks" value={masteryBonuses.activePerks.join(" / ") || "None"} />
            <Detail
              label="Blessings"
              value={activeBlessings.length > 0
                ? `${activeBlessings.length} active / ${blessingProtection}% protection`
                : "None"}
            />
          </dl>
        </section>

        <section className="character-hall-section character-hall-equipment">
          <SectionHeading label="Equipment" detail="Currently equipped gear" />
          <div className="character-hall-equipment-grid">
            {equipmentSlots.map(({ slot, label }) => {
              const item = character.equipment[slot];
              return (
                <div className={`character-hall-equipment-slot ${item ? `rarity-${item.item.rarity}` : "is-empty"}`} key={slot}>
                  <span>{label}</span>
                  <ItemIcon inventoryItem={item} equipped size="medium" showQuantity={false} />
                  <strong>{item?.item.name ?? "Empty"}</strong>
                  {item ? <small>{formatEnhancement(item.upgradeLevel, item.tier)}</small> : null}
                </div>
              );
            })}
          </div>
          <button className="character-hall-link" onClick={() => onOpenTab("inventory")} type="button">Manage equipment</button>
        </section>

        <section className="character-hall-section character-hall-skills">
          <SectionHeading label="Skills" detail="Training progress" />
          <div className="character-hall-skill-list">
            {(Object.values(character.skills) as Skill[]).map((skill) => (
              <div className={skill.name === mainSkill.name ? "is-main" : ""} key={skill.name}>
                <span>{SKILL_LABELS[skill.name]}</span>
                <strong>{skill.level}</strong>
                <i><b style={{ width: `${skill.progressPercent}%` }} /></i>
                <small>{skill.progressPercent}%</small>
              </div>
            ))}
          </div>
          <button className="character-hall-link" onClick={() => onOpenTab("skills")} type="button">Open skill details</button>
        </section>

        <section className="character-hall-section character-hall-record">
          <SectionHeading label="Guild Record" detail="Account progression" />
          <dl className="character-hall-details-list">
            <Detail label="Destiny" value={`${destiny.availablePoints} points / ${destiny.unlockedNodeIds.length} nodes`} />
            <Detail label="Destiny bonuses" value={formatDestinyBonusSummary(destinyBonuses)} />
            <Detail label="Completed quests" value={character.completedQuestIds.length.toString()} />
            <Detail label="Accesses" value={character.accessIds.length.toString()} />
            <Detail label="Last access" value={getAccessName(character.accessIds.at(-1)) ?? "None"} />
            <Detail label="Deaths" value={(character.deathCount ?? 0).toString()} />
            <Detail label="Gold generated" value={`${character.gold.toLocaleString("en-US")}g`} />
            <Detail label="Gear bonus" value={formatEquipmentBonus(equipmentBonuses)} />
          </dl>
        </section>
      </div>
    </div>
  );
}

function SectionHeading({ label, detail }: { label: string; detail: string }) {
  return <header className="character-hall-section-heading"><strong>{label}</strong><span>{detail}</span></header>;
}

function Vital({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return <div className={`character-hall-vital vital-${tone}`}><span>{label}</span><strong>{value}</strong></div>;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}

function formatEnhancement(upgradeLevel?: number, tier?: number) {
  const parts = [upgradeLevel ? `+${upgradeLevel}` : undefined, tier ? `Tier ${tier}` : undefined].filter(Boolean);
  return parts.join(" / ") || "Equipped";
}

function formatEquipmentBonus(bonuses: ReturnType<typeof calculateEquipmentBonuses>) {
  const parts = [
    bonuses.attack ? `Atk +${bonuses.attack}` : undefined,
    bonuses.defense ? `Def +${bonuses.defense}` : undefined,
    bonuses.armor ? `Armor +${bonuses.armor}` : undefined,
    bonuses.magicPower ? `Magic +${bonuses.magicPower}` : undefined,
    bonuses.distancePower ? `Distance +${bonuses.distancePower}` : undefined,
    bonuses.fistPower ? `Fist +${bonuses.fistPower}` : undefined,
    bonuses.capacityBonus ? `Cap +${bonuses.capacityBonus}` : undefined,
  ].filter(Boolean);
  return parts.join(" / ") || "None";
}
