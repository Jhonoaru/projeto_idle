import { getCombatSkills, getPrimaryCombatSkill } from "../../data/combatSkills";
import type { CombatSkillDefinition } from "../../data/combatSkills";
import type { BossDefensiveResponsePriority, BossDodgeBehavior, Character } from "../../shared/types";
import { CombatSkillIcon } from "../combat-skills/CombatSkillIcon";
import { normalizeCombatSkillLoadout } from "../../game-engine/combat-skills/normalizeCombatSkillLoadout";
import type { HuntSceneSlotType } from "./HuntSceneHotbar";

interface HuntSceneSlotWindowProps {
  character: Character;
  slot: HuntSceneSlotType;
  onClose: () => void;
  onToggleSkill?: (skillId: string) => void;
  onChangeDefensiveResponsePriority?: (priority: BossDefensiveResponsePriority) => void;
  onChangeBossDodgeBehavior?: (behavior: BossDodgeBehavior) => void;
}

interface HuntSceneSlotEntry {
  icon: string;
  skill?: CombatSkillDefinition;
  name: string;
  meta: string;
  state: "available" | "selected" | "locked";
  lock?: string;
}

interface HuntSceneSlotWindowConfig {
  title: string;
  count: string;
  subtitle: string;
  rule: string;
  threshold: string;
  entries: HuntSceneSlotEntry[];
}

const staticWindowConfig: Record<Exclude<HuntSceneSlotType, "attack" | "support">, HuntSceneSlotWindowConfig> = {
  heal: {
    title: "Curas",
    count: "3 / 19",
    subtitle: "Selecione uma cura",
    rule: "Usar cura quando vida <=",
    threshold: "80%",
    entries: [
      { icon: "HP", name: "Small Health Potion", meta: "Nivel 0 / 0 gold", state: "available" },
      { icon: "HP", name: "Health Potion", meta: "Nivel 0 / 50 gold", state: "available" },
      { icon: "HP", name: "Strong Health Potion", meta: "Nivel 50 / 115 gold", state: "locked", lock: "Bloqueado" },
    ],
  },
  mana: {
    title: "Mana Potions",
    count: "2 / 3",
    subtitle: "Selecione sua pocao de mana",
    rule: "Usar mana potion quando mana <=",
    threshold: "50%",
    entries: [
      { icon: "OFF", name: "Nao usar", meta: "Nunca consumir mana potion automaticamente", state: "selected" },
      { icon: "MP", name: "Mana Potion", meta: "Nivel 0 / 75-125 mana / 56 gold", state: "available" },
      { icon: "MP", name: "Strong Mana Potion", meta: "Nivel 50 / 115-185 mana / 108 gold", state: "locked", lock: "Bloqueado" },
    ],
  },
  utility: {
    title: "Loot Preview",
    count: "Auto",
    subtitle: "Drops comuns desta rota",
    rule: "Venda segura fica no NPC Sell",
    threshold: "",
    entries: [
      { icon: "RT", name: "Creature Products", meta: "Loot comum entra no inventario", state: "available" },
      { icon: "NPC", name: "Venda Rapida NPC", meta: "Venda local imediata de loot", state: "available" },
      { icon: "BZR", name: "Bazar Rotativo", meta: "6 ofertas locais / rotacao de 10 min", state: "available" },
    ],
  },
};

const defensivePriorities: Array<{
  value: BossDefensiveResponsePriority;
  label: string;
  detail: string;
}> = [
  { value: "automatic", label: "Automatic", detail: "Use wards first, then cleanses." },
  { value: "prevent", label: "Prevent", detail: "Prefer wards during telegraphs." },
  { value: "recover", label: "Recover", detail: "Prefer cleanses after impact." },
];

const dodgeBehaviors: Array<{
  value: BossDodgeBehavior;
  label: string;
  detail: string;
}> = [
  { value: "automatic", label: "Automatic", detail: "Attempt every telegraph. Full mobility, no positioning bonus." },
  { value: "safe_windows", label: "Safe Windows", detail: "Skip quick casts. +0.75% success power while targeted." },
  { value: "hold_position", label: "Hold Position", detail: "Never dodge. +1.5% success power while targeted." },
];

export function HuntSceneSlotWindow({ character, slot, onClose, onToggleSkill, onChangeDefensiveResponsePriority, onChangeBossDodgeBehavior }: HuntSceneSlotWindowProps) {
  const config = getWindowConfig(character, slot);
  const loadout = normalizeCombatSkillLoadout(character);

  return (
    <div className="hunt-slot-overlay" role="dialog" aria-label={`${config.title} configuration`}>
      <div className={`hunt-slot-window${slot === "attack" || slot === "support" ? " has-response-priority" : ""}`} onClick={(event) => event.stopPropagation()}>
        <button className="hunt-slot-close" onClick={onClose} type="button">X</button>
        <header>
          <div>
            <h3>{config.title} <span>{config.count}</span></h3>
            <p>{config.subtitle}</p>
          </div>
          <small>{character.name} / Lv {character.level}</small>
        </header>

        <div className="hunt-slot-rule">
          <strong>{config.rule}</strong>
          {config.threshold ? (
            <div>
              <button type="button">-</button>
              <span>{config.threshold}</span>
              <button type="button">+</button>
            </div>
          ) : (
            <button type="button">Limpar slot</button>
          )}
        </div>

        {slot === "support" ? (
          <section className="hunt-response-priority" aria-label="Boss response priority">
            <div>
              <strong>Boss Response</strong>
              <small>Saved for the next deployment. Existing action snapshots do not change.</small>
            </div>
            <div className="hunt-response-priority-options">
              {defensivePriorities.map((priority) => (
                <button
                  aria-pressed={loadout.defensiveResponsePriority === priority.value}
                  className={loadout.defensiveResponsePriority === priority.value ? "is-active" : ""}
                  key={priority.value}
                  onClick={() => onChangeDefensiveResponsePriority?.(priority.value)}
                  title={priority.detail}
                  type="button"
                >
                  <strong>{priority.label}</strong>
                  <span>{priority.detail}</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {slot === "attack" ? (
          <section className="hunt-response-priority hunt-dodge-behavior" aria-label="Boss dodge behavior">
            <div>
              <strong>Boss Dodge</strong>
              <small>Saved for the next deployment. Active action snapshots stay unchanged.</small>
            </div>
            <div className="hunt-response-priority-options">
              {dodgeBehaviors.map((behavior) => (
                <button
                  aria-pressed={loadout.bossDodgeBehavior === behavior.value}
                  className={loadout.bossDodgeBehavior === behavior.value ? "is-active" : ""}
                  key={behavior.value}
                  onClick={() => onChangeBossDodgeBehavior?.(behavior.value)}
                  title={behavior.detail}
                  type="button"
                >
                  <strong>{behavior.label}</strong>
                  <span>{behavior.detail}</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <div className="hunt-slot-list">
          {config.entries.map((entry) => (
            <button
              className={`hunt-slot-entry is-${entry.state}`}
              disabled={entry.state === "locked"}
              key={entry.name}
              onClick={() => entry.skill && onToggleSkill?.(entry.skill.id)}
              type="button"
            >
              {entry.skill ? (
                <CombatSkillIcon skill={entry.skill} locked={entry.state === "locked"} size="large" />
              ) : <span>{entry.icon}</span>}
              <div>
                <strong>{entry.name}</strong>
                <small>{entry.meta}</small>
              </div>
              {entry.lock ? <em>{entry.lock}</em> : null}
            </button>
          ))}
        </div>

        <footer>
          <button onClick={onClose} type="button">Concluir</button>
        </footer>
      </div>
    </div>
  );
}

function getWindowConfig(character: Character, slot: HuntSceneSlotType): HuntSceneSlotWindowConfig {
  if (slot !== "attack" && slot !== "support") return staticWindowConfig[slot];

  const skills = getCombatSkills(character.vocation, slot);
  const unlocked = skills.filter((entry) => character.level >= entry.levelRequired);
  const loadout = normalizeCombatSkillLoadout(character);

  return {
    title: slot === "attack" ? "Combat Skills" : "Support Skills",
    count: `${unlocked.length} / ${skills.length}`,
    subtitle: `${character.vocation} ${slot === "attack" ? "next deployment order" : "next deployment support"}`,
    rule: slot === "attack" ? "Click an active skill to rotate its priority" : "Click to select or disable support",
    threshold: "",
    entries: skills.map((entry) => {
      const isUnlocked = character.level >= entry.levelRequired;
      return {
        icon: entry.code,
        skill: entry,
        name: entry.name,
        meta: `Level ${entry.levelRequired} / Mana ${entry.manaCost} / CD ${entry.cooldownSeconds}s${entry.effect.interruptPowerPercent > 0 ? ` / Interrupt ${entry.effect.interruptPowerPercent}%` : ""}${entry.effect.conditionResistancePenetration > 0 ? ` / Cond Pen +${entry.effect.conditionResistancePenetration}%` : ""}${entry.effect.conditionSupport.cleanseCount ? ` / Cleanse ${entry.effect.conditionSupport.cleanseCount}` : ""}${entry.effect.conditionSupport.protectionPercent ? ` / Ward ${entry.effect.conditionSupport.protectionPercent}% for ${entry.effect.conditionSupport.protectionDurationSeconds}s` : ""} / ${entry.description}`,
        state: !isUnlocked
          ? "locked"
          : slot === "attack"
            ? loadout.attackSkillIds.includes(entry.id) ? "selected" : "available"
            : loadout.supportSkillId === entry.id ? "selected" : "available",
        lock: !isUnlocked
          ? `Requires level ${entry.levelRequired}`
          : slot === "attack" && loadout.attackSkillIds.includes(entry.id)
            ? `Priority ${loadout.attackSkillIds.indexOf(entry.id) + 1}`
            : slot === "support" && loadout.supportSkillId === entry.id ? "Active" : undefined,
      };
    }),
  };
}
