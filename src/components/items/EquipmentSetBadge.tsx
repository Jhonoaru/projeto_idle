import { getEquipmentSetForItem } from "../../game-engine/equipment/calculateEquipmentSetBonuses";
import type { Item } from "../../shared/types";

interface EquipmentSetBadgeProps {
  item?: Item;
  compact?: boolean;
}

export function EquipmentSetBadge({ item, compact = false }: EquipmentSetBadgeProps) {
  const definition = getEquipmentSetForItem(item);
  if (!definition) return null;

  return (
    <span className={`equipment-set-badge equipment-set-${definition.id} ${compact ? "is-compact" : ""}`.trim()} title={definition.description}>
      <i aria-hidden="true">{definition.code}</i>
      <strong>{definition.name}</strong>
    </span>
  );
}
