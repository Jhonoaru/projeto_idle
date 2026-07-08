import type { Character, HuntArea } from "../../shared/types";

export type HuntSceneSlotType = "heal" | "mana" | "attack" | "support" | "utility";

export interface HuntSceneSlot {
  id: HuntSceneSlotType;
  title: string;
  icon: string;
  value: string;
  detail: string;
  status: "ready" | "selected" | "locked";
}

interface HuntSceneHotbarProps {
  character: Character;
  hunt?: HuntArea;
  selectedSlot?: HuntSceneSlotType;
  onSelectSlot: (slot: HuntSceneSlotType) => void;
}

export function HuntSceneHotbar({
  character,
  hunt,
  selectedSlot,
  onSelectSlot,
}: HuntSceneHotbarProps) {
  const slots = getHuntSceneSlots(character, hunt);

  return (
    <div className="hunt-scene-hotbar" aria-label="Hunt combat slots">
      <div className="hunt-hotbar-health">
        <span>HP</span>
        <strong>{character.attributes.maxHealth}/{character.attributes.maxHealth}</strong>
        <div><i style={{ width: "100%" }} /></div>
      </div>
      <div className="hunt-hotbar-mana">
        <span>MP</span>
        <strong>{character.attributes.maxMana}/{character.attributes.maxMana}</strong>
        <div><i style={{ width: "72%" }} /></div>
      </div>
      <div className="hunt-hotbar-slots">
        {slots.map((slot) => (
          <button
            className={[
              "hunt-hotbar-slot",
              `is-${slot.status}`,
              selectedSlot === slot.id ? "is-open" : "",
            ].filter(Boolean).join(" ")}
            key={slot.id}
            onClick={() => onSelectSlot(slot.id)}
            type="button"
          >
            <span>{slot.icon}</span>
            <strong>{slot.title}</strong>
            <em>{slot.value}</em>
            <small>{slot.detail}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

export function getHuntSceneSlots(character: Character, hunt?: HuntArea): HuntSceneSlot[] {
  const healthPotions = countItems(character, ["minor-health-potion", "health-potion", "strong-health-potion"]);
  const manaPotions = countItems(character, ["mana-potion", "strong-mana-potion"]);
  const mainSkill = character.vocation === "Arcanist" || character.vocation === "Warden"
    ? "Spell"
    : character.vocation === "Ranger"
      ? "Shot"
      : "Strike";

  return [
    {
      id: "heal",
      title: "Cura",
      icon: "HP",
      value: healthPotions > 0 ? `${healthPotions}` : "Off",
      detail: "HP <= 80%",
      status: healthPotions > 0 ? "selected" : "ready",
    },
    {
      id: "mana",
      title: "Mana",
      icon: "MP",
      value: manaPotions > 0 ? `${manaPotions}` : "Off",
      detail: "MP <= 50%",
      status: manaPotions > 0 ? "selected" : "ready",
    },
    {
      id: "attack",
      title: "Magias",
      icon: "ATK",
      value: "2/4",
      detail: mainSkill,
      status: "selected",
    },
    {
      id: "support",
      title: "Suporte",
      icon: "SUP",
      value: character.level >= 30 ? "1/2" : "0/2",
      detail: character.level >= 30 ? "Ready" : "Locked",
      status: character.level >= 30 ? "ready" : "locked",
    },
    {
      id: "utility",
      title: "Loot",
      icon: "BAG",
      value: hunt?.monsters.length ? `${hunt.monsters.length}` : "-",
      detail: "Preview",
      status: "ready",
    },
  ];
}

function countItems(character: Character, itemIds: string[]) {
  const ids = new Set(itemIds);

  return character.inventory.reduce((sum, entry) => (
    ids.has(entry.itemId) ? sum + entry.quantity : sum
  ), 0);
}
