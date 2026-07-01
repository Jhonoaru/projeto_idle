import { items } from "../../data/items";
import type { ImbuementMaterialStatus } from "../../game-engine/forge/getImbuementApplicationStatus";

interface ForgeMaterialRequirementProps {
  material: ImbuementMaterialStatus;
}

export function ForgeMaterialRequirement({ material }: ForgeMaterialRequirementProps) {
  const itemName = items[material.itemId]?.name ?? material.itemId;
  const isMissing = material.available < material.quantity;

  return (
    <div className={`forge-material ${isMissing ? "is-missing" : "is-ok"}`}>
      <span>{itemName}</span>
      <strong>{material.available}/{material.quantity}</strong>
    </div>
  );
}
