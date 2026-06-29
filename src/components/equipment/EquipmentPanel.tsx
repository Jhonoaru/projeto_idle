import { EquipmentSlotBox } from "./EquipmentSlotBox";
import type { Character, EquipmentSlot } from "../../shared/types";

const equipmentSlots: EquipmentSlot[] = [
  "helmet",
  "armor",
  "legs",
  "boots",
  "weapon",
  "shield",
  "amulet",
  "ring",
  "backpack",
  "ammo",
];

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
          onUnequip={onUnequip}
          slot={slot}
        />
      ))}
    </div>
  );
}
