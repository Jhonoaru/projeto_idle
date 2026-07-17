import { getEquipmentProgression } from "../../game-engine/items/getEquipmentProgression";
import type { Item } from "../../shared/types";

interface ItemProgressionBadgeProps {
  item?: Item;
  compact?: boolean;
}

export function ItemProgressionBadge({ item, compact = false }: ItemProgressionBadgeProps) {
  if (!item || item.type !== "equipment") return null;
  const progression = getEquipmentProgression(item);

  return (
    <span className={`item-progression-badge ${progression.className} ${compact ? "is-compact" : ""}`}>
      <i aria-hidden="true">{progression.family.code}</i>
      <strong>{progression.family.label}</strong>
      <em>{progression.band.label} · Lv {progression.requiredLevel}</em>
    </span>
  );
}
