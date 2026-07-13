import { VOCATION_CONFIGS } from "../../data/vocations";
import { getMainSkill } from "../../game-engine/character/getMainSkill";
import { calculateWeaponProficiencyBonuses } from "../../game-engine/weapon-proficiency/calculateWeaponProficiencyBonuses";
import {
  WEAPON_PROFICIENCY_LABELS,
  WEAPON_PROFICIENCY_PERKS,
  WEAPON_PROFICIENCY_TYPES,
} from "../../game-engine/weapon-proficiency/weaponProficiencyDefinitions";
import {
  getWeaponProficiencyProgressPercent,
  normalizeWeaponProficiencies,
} from "../../game-engine/weapon-proficiency/weaponProficiencyProgression";
import { SKILL_LABELS } from "../../shared/constants";
import type { Character, Skill, SkillName } from "../../shared/types";

type SkillsRoute = "training" | "proficiency" | "destiny" | "action";

interface SkillsProgressionPanelProps {
  character: Character;
  onOpenTab: (tab: SkillsRoute) => void;
}

const skillDetails: Record<SkillName, { code: string; category: string; description: string }> = {
  sword: { code: "SW", category: "Melee", description: "Balanced weapon handling and reliable physical pressure." },
  axe: { code: "AX", category: "Melee", description: "Heavy strikes focused on raw offensive power." },
  club: { code: "CL", category: "Melee", description: "Crushing attacks with a defensive combat rhythm." },
  distance: { code: "DS", category: "Ranged", description: "Accuracy and damage with bows and ranged weapons." },
  fist: { code: "FS", category: "Melee", description: "Unarmed and fist weapon technique for agile fighters." },
  shielding: { code: "SH", category: "Defense", description: "Damage control and defensive stability with shields." },
  magic: { code: "MG", category: "Magic", description: "Spell power, magical pressure, and restorative potential." },
};

export function SkillsProgressionPanel({ character, onOpenTab }: SkillsProgressionPanelProps) {
  const skills = Object.values(character.skills) as Skill[];
  const mainSkill = getMainSkill(character);
  const vocation = VOCATION_CONFIGS[character.vocation];
  const proficiencyState = normalizeWeaponProficiencies(character.weaponProficiencies);
  const proficiencyBonuses = calculateWeaponProficiencyBonuses(character);
  const totalSkillLevels = skills.reduce((total, skill) => total + skill.level, 0);
  const averageSkill = Math.round(totalSkillLevels / Math.max(1, skills.length));
  const rankedProficiencies = WEAPON_PROFICIENCY_TYPES
    .map((type) => proficiencyState[type])
    .sort((first, second) => second.level - first.level || second.experience - first.experience)
    .slice(0, 4);
  const trainingSkill = character.currentAction?.targetSkill;

  return (
    <div className="skills-hall">
      <section className="skills-hall-hero">
        <div className="skills-hall-seal" aria-hidden="true">
          <span>{skillDetails[mainSkill.name].code}</span>
          <small>Lv {mainSkill.level}</small>
        </div>
        <div className="skills-hall-identity">
          <span>{character.vocation} / {vocation.role}</span>
          <h2>{character.name}'s Progression</h2>
          <p>{vocation.description}</p>
          <div className="skills-hall-tags">
            {vocation.mainSkills.map((skillName) => (
              <em key={skillName}>{SKILL_LABELS[skillName]} path</em>
            ))}
          </div>
        </div>
        <div className="skills-hall-summary">
          <SummaryStat label="Main skill" value={`${SKILL_LABELS[mainSkill.name]} ${mainSkill.level}`} />
          <SummaryStat label="Average" value={averageSkill.toString()} />
          <SummaryStat label="Combined" value={totalSkillLevels.toString()} />
          <SummaryStat label="Mastery perks" value={proficiencyBonuses.activePerks.length.toString()} />
        </div>
      </section>

      <nav className="skills-hall-actions" aria-label="Progression commands">
        <button onClick={() => onOpenTab("training")} type="button">Training Grounds</button>
        <button onClick={() => onOpenTab("proficiency")} type="button">Weapon Mastery</button>
        <button onClick={() => onOpenTab("destiny")} type="button">Path of Destiny</button>
        {character.currentAction ? (
          <button onClick={() => onOpenTab("action")} type="button">Current Action</button>
        ) : null}
      </nav>

      <div className="skills-hall-layout">
        <section className="skills-hall-section skills-hall-skills">
          <SectionHeading label="Combat Skills" detail="Permanent character progression" />
          <div className="skills-hall-grid">
            {skills.map((skill) => {
              const recommended = vocation.mainSkills.includes(skill.name);
              const isTraining = character.status === "training" && trainingSkill === skill.name;
              return (
                <article
                  className={`skills-hall-card ${recommended ? "is-recommended" : ""} ${isTraining ? "is-training" : ""}`.trim()}
                  key={skill.name}
                >
                  <div className="skills-hall-card-icon">{skillDetails[skill.name].code}</div>
                  <div className="skills-hall-card-copy">
                    <span>{skillDetails[skill.name].category}</span>
                    <h3>{SKILL_LABELS[skill.name]}</h3>
                    <p>{skillDetails[skill.name].description}</p>
                  </div>
                  <strong>{skill.level}</strong>
                  <div className="skills-hall-card-progress" aria-label={`${skill.progressPercent}% progress`}>
                    <i style={{ width: `${skill.progressPercent}%` }} />
                  </div>
                  <small>{skill.progressPercent}% to next level</small>
                  {recommended ? <em>Vocation path</em> : null}
                  {isTraining ? <em className="is-active">Training now</em> : null}
                </article>
              );
            })}
          </div>
        </section>

        <aside className="skills-hall-sidebar">
          <section className="skills-hall-section">
            <SectionHeading label="Development Plan" detail="Suggested from current vocation" />
            <div className="skills-hall-plan">
              <PlanItem
                code="01"
                label={`Advance ${SKILL_LABELS[mainSkill.name]}`}
                detail={`Primary ${character.vocation} scaling at level ${mainSkill.level}.`}
              />
              <PlanItem
                code="02"
                label="Maintain Shielding"
                detail={`Defensive skill currently at level ${character.skills.shielding.level}.`}
              />
              <PlanItem
                code="03"
                label="Develop Mastery"
                detail={proficiencyBonuses.activeTypes.length > 0
                  ? `Active: ${proficiencyBonuses.activeTypes.map((type) => WEAPON_PROFICIENCY_LABELS[type]).join(" / ")}.`
                  : "Equip a compatible weapon to activate mastery perks."}
              />
            </div>
          </section>

          <section className="skills-hall-section">
            <SectionHeading label="Training Status" detail={character.status === "training" ? "Active session" : "Ready"} />
            <div className={`skills-hall-training ${character.status === "training" ? "is-active" : ""}`}>
              <span>{character.status === "training" ? "Training in progress" : "No active training"}</span>
              <strong>
                {character.status === "training"
                  ? character.currentAction?.label ?? "Training"
                  : `${SKILL_LABELS[mainSkill.name]} is ready to train`}
              </strong>
              <p>
                {character.status === "training"
                  ? `Target: ${trainingSkill ? SKILL_LABELS[trainingSkill] : "Unknown skill"}`
                  : "Choose a skill and training duration in the Training Grounds."}
              </p>
              <button onClick={() => onOpenTab(character.status === "training" ? "action" : "training")} type="button">
                {character.status === "training" ? "View session" : "Open training"}
              </button>
            </div>
          </section>
        </aside>
      </div>

      <section className="skills-hall-section skills-hall-mastery">
        <SectionHeading label="Weapon Mastery" detail="Highest proficiency paths" />
        <div className="skills-hall-mastery-grid">
          {rankedProficiencies.map((progress) => {
            const progressPercent = Math.round(getWeaponProficiencyProgressPercent(progress));
            const nextPerk = WEAPON_PROFICIENCY_PERKS[progress.type].find(
              (perk) => perk.requiredLevel > progress.level,
            );
            const active = proficiencyBonuses.activeTypes.includes(progress.type);
            return (
              <article className={active ? "is-active" : ""} key={progress.type}>
                <span>{active ? "Equipped" : "Mastery"}</span>
                <h3>{WEAPON_PROFICIENCY_LABELS[progress.type]}</h3>
                <strong>Lv {progress.level}</strong>
                <div><i style={{ width: `${progressPercent}%` }} /></div>
                <small>{progressPercent}% / {progress.experienceToNextLevel.toLocaleString("en-US")} XP to next</small>
                <p>{nextPerk ? `Next: ${nextPerk.name} at level ${nextPerk.requiredLevel}` : "All listed perks unlocked"}</p>
              </article>
            );
          })}
        </div>
        <button className="skills-hall-link" onClick={() => onOpenTab("proficiency")} type="button">
          Open all weapon masteries
        </button>
      </section>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function SectionHeading({ label, detail }: { label: string; detail: string }) {
  return <header className="skills-hall-section-heading"><strong>{label}</strong><span>{detail}</span></header>;
}

function PlanItem({ code, label, detail }: { code: string; label: string; detail: string }) {
  return <div><span>{code}</span><div><strong>{label}</strong><p>{detail}</p></div></div>;
}
