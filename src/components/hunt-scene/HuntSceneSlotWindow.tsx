import type { Character } from "../../shared/types";
import type { HuntSceneSlotType } from "./HuntSceneHotbar";

interface HuntSceneSlotWindowProps {
  character: Character;
  slot: HuntSceneSlotType;
  onClose: () => void;
}

interface HuntSceneSlotEntry {
  icon: string;
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

const windowConfig: Record<HuntSceneSlotType, HuntSceneSlotWindowConfig> = {
  heal: {
    title: "Curas",
    count: "3 / 19",
    subtitle: "Selecione uma cura",
    rule: "Usar cura quando vida <=",
    threshold: "80%",
    entries: [
      { icon: "HP", name: "Small Health Potion", meta: "Nivel 0 · 0 gold", state: "available" },
      { icon: "HP", name: "Health Potion", meta: "Nivel 0 · 50 gold", state: "available" },
      { icon: "HP", name: "Strong Health Potion", meta: "Nivel 50 · 115 gold", state: "locked", lock: "Bloqueado" },
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
      { icon: "MP", name: "Mana Potion", meta: "Nivel 0 · 75-125 mana · 56 gold", state: "available" },
      { icon: "MP", name: "Strong Mana Potion", meta: "Nivel 50 · 115-185 mana · 108 gold", state: "locked", lock: "Bloqueado" },
    ],
  },
  attack: {
    title: "Magias",
    count: "2 / 12",
    subtitle: "Selecione a magia do slot",
    rule: "Usar no minimo com:",
    threshold: "1+ criatura",
    entries: [
      { icon: "SW", name: "Lesser Front Sweep", meta: "Nivel 1 · Mana 6 · CD 6s", state: "selected", lock: "Em outro slot" },
      { icon: "ST", name: "Brutal Strike", meta: "Nivel 16 · Mana 30 · CD 6s", state: "available" },
      { icon: "WW", name: "Whirlwind Throw", meta: "Nivel 28 · Mana 40 · CD 6s", state: "locked", lock: "Requer nivel 28" },
    ],
  },
  support: {
    title: "Magias",
    count: "0 / 12",
    subtitle: "Selecione a magia de suporte",
    rule: "Slot de suporte com cooldown global compartilhado",
    threshold: "",
    entries: [
      { icon: "UT", name: "Utamo Tempo", meta: "Nivel 55 · Mana 200 · CD 2s · Duracao 13s", state: "locked", lock: "Requer nivel 55" },
      { icon: "CH", name: "Chivalrous Challenge", meta: "Nivel 150 · Mana 80 · CD 2s", state: "locked", lock: "Requer nivel 150" },
      { icon: "AV", name: "Avatar Form", meta: "Nivel 300 · Mana 0 · CD 420s", state: "locked", lock: "Wheel Unlock" },
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
  const config = windowConfig[slot];

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
              className={[
                "hunt-slot-entry",
                `is-${entry.state}`,
              ].join(" ")}
              disabled={entry.state === "locked"}
              key={entry.name}
              type="button"
            >
              <span>{entry.icon}</span>
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
