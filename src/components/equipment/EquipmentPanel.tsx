import { EquipmentSlotBox } from "./EquipmentSlotBox";
import type { Character, EquipmentSlot } from "../../shared/types";

const equipmentSlots: EquipmentSlot[] = [
  "weapon",
  "offhand",
  "helmet",
  "amulet",
  "armor",
  "ring",
  "legs",
  "backpack",
  "boots",
];

const slotLabels: Record<EquipmentSlot, string> = {
  weapon: "Arma Principal",
  offhand: "Arma Secundária / Escudo / Quiver",
  helmet: "Elmo",
  armor: "Peitoral",
  legs: "Legs",
  boots: "Bota",
  amulet: "Colar",
  ring: "Anel",
  backpack: "Mochila Principal",
};

interface EquipmentPanelProps {
  character: Character;
  onUnequip: (slot: EquipmentSlot) => void;
}

export function EquipmentPanel({ character, onUnequip }: EquipmentPanelProps) {
  return (
    <div className="equipment-panel">
      {equipmentSlots.map((slot) => (
        <EquipmentSlotBox
          item={character.equipment[slot]}
          key={slot}
          label={slotLabels[slot]}
          onUnequip={onUnequip}
          slot={slot}
        />
      ))}
    </div>
  );
}
