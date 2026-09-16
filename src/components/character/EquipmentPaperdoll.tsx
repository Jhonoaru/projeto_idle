import { useState } from "react";
import { Crown, Shirt, Shield, Sword, Backpack, Footprints, Gem, Circle, Columns2, type LucideIcon } from "lucide-react";
import { ItemIcon } from "../items/ItemIcon";
import type { Character, EquipmentSlot } from "../../shared/types";

const slots: { id: EquipmentSlot; label: string; Icon: LucideIcon; row: number; col: number }[] = [
  { id: "amulet", label: "Amuleto", Icon: Gem, row: 1, col: 1 },
  { id: "helmet", label: "Capacete", Icon: Crown, row: 1, col: 2 },
  { id: "backpack", label: "Mochila", Icon: Backpack, row: 1, col: 3 },
  { id: "weapon", label: "Arma", Icon: Sword, row: 2, col: 1 },
  { id: "armor", label: "Armadura", Icon: Shirt, row: 2, col: 2 },
  { id: "offhand", label: "Escudo / mao secundaria", Icon: Shield, row: 2, col: 3 },
  { id: "ring", label: "Anel", Icon: Circle, row: 3, col: 1 },
  { id: "legs", label: "Pernas", Icon: Columns2, row: 3, col: 2 },
  { id: "boots", label: "Botas", Icon: Footprints, row: 4, col: 2 },
];
export function EquipmentPaperdoll({ character }: { character: Character }) {
  const [selected, setSelected] = useState<EquipmentSlot>("weapon");
  const item = character.equipment[selected];
  const label = slots.find(slot => slot.id === selected)!.label;
  return <div className="equipment-paperdoll">
    <div className="paperdoll-grid" aria-label="Equipamento do personagem">{slots.map(({ id, label, Icon, row, col }) => {
      const equipped = character.equipment[id];
      const title = `${label}: ${equipped?.item.name ?? "Vazio"}`;
      return <button key={id} style={{ gridRow: row, gridColumn: col }} title={title} aria-label={title} aria-pressed={selected === id} onClick={() => setSelected(id)}>
        {equipped ? <ItemIcon inventoryItem={equipped} size="medium" showQuantity={false} showBadges={false} /> : <Icon size={25} aria-hidden="true" />}
      </button>;
    })}</div>
    <div className="paperdoll-inspection" aria-live="polite"><small>{label}</small><strong>{item?.item.name ?? "Slot vazio"}</strong>{item ? <p>{item.item.description}</p> : null}</div>
  </div>;
}
