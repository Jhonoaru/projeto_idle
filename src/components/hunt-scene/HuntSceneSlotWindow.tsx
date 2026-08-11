import { getCombatSkills, getPrimaryCombatSkill } from "../../data/combatSkills";
import type { CombatSkillDefinition } from "../../data/combatSkills";
import type { Character } from "../../shared/types";
import { CombatSkillIcon } from "../combat-skills/CombatSkillIcon";
import type { HuntSceneSlotType } from "./HuntSceneHotbar";

interface HuntSceneSlotWindowProps {
  character: Character;
  slot: HuntSceneSlotType;
  onClose: () => void;
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

export function HuntSceneSlotWindow({ character, slot, onClose }: HuntSceneSlotWindowProps) {
  const config = getWindowConfig(character, slot);

  return (
    <div className="hunt-slot-overlay" role="dialog" aria-label={`${config.title} configuration`}>
      <div className="hunt-slot-window" onClick={(event) => event.stopPropagation()}>
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

        <div className="hunt-slot-list">
          {config.entries.map((entry) => (
            <button
              className={`hunt-slot-entry is-${entry.state}`}
              disabled={entry.state === "locked"}
              key={entry.name}
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
  const primary = getPrimaryCombatSkill(character.vocation, character.level, slot);

  return {
    title: slot === "attack" ? "Combat Skills" : "Support Skills",
    count: `${unlocked.length} / ${skills.length}`,
    subtitle: `${character.vocation} ${slot === "attack" ? "attack rotation" : "support rotation"}`,
    rule: slot === "attack" ? "Use with at least:" : "Shared support cooldown",
    threshold: slot === "attack" ? "1+ creature" : "",
    entries: skills.map((entry) => {
      const isUnlocked = character.level >= entry.levelRequired;
      return {
        icon: entry.code,
        skill: entry,
        name: entry.name,
        meta: `Level ${entry.levelRequired} / Mana ${entry.manaCost} / CD ${entry.cooldownSeconds}s / ${entry.description}`,
        state: !isUnlocked ? "locked" : entry.id === primary.id ? "selected" : "available",
        lock: !isUnlocked ? `Requires level ${entry.levelRequired}` : entry.id === primary.id ? "Active" : undefined,
      };
    }),
  };
}
